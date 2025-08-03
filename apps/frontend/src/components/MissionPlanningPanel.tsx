import React, { useState, useCallback, useEffect } from 'react';
import { GeoJSONPolygon } from '@/types';

// Types for mission planning
interface FlightParameters {
  altitude: number;
  speed: number;
  overlapForward: number;
  overlapSide: number;
  imageInterval: number;
  cameraAngle: number;
}

interface MissionRequirements {
  missionType: 'survey' | 'inspection' | 'mapping' | 'monitoring' | 'search_rescue';
  priority: 'high' | 'medium' | 'low';
  qualityLevel: 'draft' | 'standard' | 'high' | 'survey_grade';
  deadline?: string;
}

interface WeatherWindow {
  startTime: string;
  endTime: string;
  duration: number;
  safetyLevel: 'excellent' | 'good' | 'marginal' | 'poor' | 'unsafe';
  score: number;
  conditions: string;
}

interface MissionPlan {
  id: string;
  flightPlan: {
    waypoints: any[];
    estimatedFlightTime: number;
    estimatedDistance: number;
    photoCount: number;
    batteryUsage: number;
  };
  weatherWindows: WeatherWindow[];
  recommendedWindow: WeatherWindow | null;
  riskAssessment: {
    overall: 'low' | 'medium' | 'high' | 'critical';
    warnings: string[];
    mitigations: string[];
  };
  cost: {
    estimatedHours: number;
    totalCost: number;
  };
  metadata: {
    aiRecommendations: string[];
    confidence: number;
  };
}

interface MissionPlanningPanelProps {
  boundary?: GeoJSONPolygon;
  location: { lat: number; lng: number; name?: string };
  onMissionPlanGenerated?: (plan: MissionPlan) => void;
  onParametersChanged?: (parameters: FlightParameters) => void;
  onExportKML?: (plan: MissionPlan, platform: string) => void;
  onWeatherRefresh?: (lat: number, lng: number) => void;
  className?: string;
}

const MissionPlanningPanel: React.FC<MissionPlanningPanelProps> = ({
  boundary,
  location,
  onMissionPlanGenerated,
  onParametersChanged,
  onExportKML,
  onWeatherRefresh,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'planning' | 'parameters' | 'weather' | 'export'>('planning');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentMissionPlan, setCurrentMissionPlan] = useState<MissionPlan | null>(null);

  // Mission requirements state
  const [missionRequirements, setMissionRequirements] = useState<MissionRequirements>({
    missionType: 'survey',
    priority: 'medium',
    qualityLevel: 'standard',
  });

  // Flight parameters state
  const [flightParameters, setFlightParameters] = useState<FlightParameters>({
    altitude: 120,
    speed: 10,
    overlapForward: 70,
    overlapSide: 60,
    imageInterval: 2,
    cameraAngle: 0,
  });

  // Export settings state
  const [exportSettings, setExportSettings] = useState({
    platform: 'generic',
    format: 'kml',
    includeMetadata: true,
  });

  // Update parameters when mission type changes
  useEffect(() => {
    const optimizedParams = optimizeParametersForMission(missionRequirements);
    setFlightParameters(optimizedParams);
    onParametersChanged?.(optimizedParams);
  }, [missionRequirements, onParametersChanged]);

  // Optimize parameters based on mission requirements
  const optimizeParametersForMission = (requirements: MissionRequirements): FlightParameters => {
    const baseParams = { ...flightParameters };

    // Mission type optimizations
    switch (requirements.missionType) {
      case 'survey':
        baseParams.overlapForward = 80;
        baseParams.overlapSide = 70;
        baseParams.altitude = Math.min(150, baseParams.altitude);
        break;

      case 'inspection':
        baseParams.altitude = Math.min(50, baseParams.altitude);
        baseParams.speed = Math.min(5, baseParams.speed);
        baseParams.overlapForward = 90;
        baseParams.cameraAngle = -30;
        break;

      case 'mapping':
        baseParams.overlapForward = 85;
        baseParams.overlapSide = 75;
        baseParams.speed = 8;
        break;

      case 'monitoring':
        baseParams.speed = Math.max(15, baseParams.speed);
        baseParams.overlapForward = 60;
        baseParams.overlapSide = 50;
        break;
    }

    // Quality level optimizations
    switch (requirements.qualityLevel) {
      case 'survey_grade':
        baseParams.overlapForward = Math.max(85, baseParams.overlapForward);
        baseParams.overlapSide = Math.max(75, baseParams.overlapSide);
        baseParams.speed = Math.min(8, baseParams.speed);
        break;

      case 'high':
        baseParams.overlapForward = Math.max(75, baseParams.overlapForward);
        baseParams.overlapSide = Math.max(65, baseParams.overlapSide);
        break;

      case 'draft':
        baseParams.overlapForward = Math.min(60, baseParams.overlapForward);
        baseParams.overlapSide = Math.min(50, baseParams.overlapSide);
        baseParams.speed = Math.max(12, baseParams.speed);
        break;
    }

    return baseParams;
  };

  // Generate mission plan
  const generateMissionPlan = useCallback(async () => {
    if (!boundary) {
      alert('Please draw a boundary polygon first');
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate AI mission planning call
      const mockPlan: MissionPlan = {
        id: `mission_${Date.now()}`,
        flightPlan: {
          waypoints: generateMockWaypoints(boundary, flightParameters),
          estimatedFlightTime: 25.5,
          estimatedDistance: 3200,
          photoCount: 145,
          batteryUsage: 78,
        },
        weatherWindows: [
          {
            startTime: '2025-01-02T09:00:00Z',
            endTime: '2025-01-02T11:00:00Z',
            duration: 120,
            safetyLevel: 'excellent',
            score: 95,
            conditions: 'Clear skies, light winds',
          },
          {
            startTime: '2025-01-02T14:00:00Z',
            endTime: '2025-01-02T16:00:00Z',
            duration: 120,
            safetyLevel: 'good',
            score: 85,
            conditions: 'Partly cloudy, moderate winds',
          },
        ],
        recommendedWindow: {
          startTime: '2025-01-02T09:00:00Z',
          endTime: '2025-01-02T11:00:00Z',
          duration: 120,
          safetyLevel: 'excellent',
          score: 95,
          conditions: 'Clear skies, light winds',
        },
        riskAssessment: {
          overall: 'medium',
          warnings: [
            'Moderate battery usage - monitor closely',
            'Flight duration approaches maximum recommended time',
          ],
          mitigations: [
            'Plan battery swap point at waypoint 75',
            'Monitor weather conditions before flight',
            'Have backup landing sites identified',
          ],
        },
        cost: {
          estimatedHours: 2.5,
          totalCost: 375,
        },
        metadata: {
          aiRecommendations: [
            'Optimal weather window identified for tomorrow morning',
            'Consider reducing overlap by 5% to improve battery efficiency',
            'Flight path optimized for minimal battery usage',
            'Recommended altitude provides best balance of coverage and quality',
          ],
          confidence: 0.92,
        },
      };

      setCurrentMissionPlan(mockPlan);
      onMissionPlanGenerated?.(mockPlan);

    } catch (error) {
      console.error('Error generating mission plan:', error);
      alert('Failed to generate mission plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [boundary, flightParameters, missionRequirements, onMissionPlanGenerated]);

  // Generate mock waypoints
  const generateMockWaypoints = (polygon: GeoJSONPolygon, params: FlightParameters) => {
    // This would integrate with the real flight pattern generation
    const coords = polygon.coordinates[0];
    const bounds = {
      minLat: Math.min(...coords.map(c => c[1])),
      maxLat: Math.max(...coords.map(c => c[1])),
      minLng: Math.min(...coords.map(c => c[0])),
      maxLng: Math.max(...coords.map(c => c[0])),
    };

    const waypoints = [];
    const stepSize = (bounds.maxLat - bounds.minLat) / 10; // 10 lines

    for (let lat = bounds.minLat; lat <= bounds.maxLat; lat += stepSize) {
      waypoints.push({
        lat,
        lng: bounds.minLng,
        alt: params.altitude,
        speed: params.speed,
        action: 'photo',
      });
      waypoints.push({
        lat,
        lng: bounds.maxLng,
        alt: params.altitude,
        speed: params.speed,
        action: 'photo',
      });
    }

    return waypoints;
  };

  // Handle export
  const handleExport = useCallback(() => {
    if (!currentMissionPlan) {
      alert('No mission plan to export');
      return;
    }

    onExportKML?.(currentMissionPlan, exportSettings.platform);
  }, [currentMissionPlan, exportSettings.platform, onExportKML]);

  // Handle weather refresh
  const handleWeatherRefresh = useCallback(() => {
    onWeatherRefresh?.(location.lat, location.lng);
  }, [location, onWeatherRefresh]);

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'planning':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mission Type
              </label>
              <select
                value={missionRequirements.missionType}
                onChange={(e) => setMissionRequirements(prev => ({
                  ...prev,
                  missionType: e.target.value as MissionRequirements['missionType']
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="survey">Area Survey</option>
                <option value="inspection">Infrastructure Inspection</option>
                <option value="mapping">Detailed Mapping</option>
                <option value="monitoring">Monitoring</option>
                <option value="search_rescue">Search & Rescue</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality Level
              </label>
              <select
                value={missionRequirements.qualityLevel}
                onChange={(e) => setMissionRequirements(prev => ({
                  ...prev,
                  qualityLevel: e.target.value as MissionRequirements['qualityLevel']
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="draft">Draft (60% overlap)</option>
                <option value="standard">Standard (70% overlap)</option>
                <option value="high">High (80% overlap)</option>
                <option value="survey_grade">Survey Grade (85% overlap)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={missionRequirements.priority}
                onChange={(e) => setMissionRequirements(prev => ({
                  ...prev,
                  priority: e.target.value as MissionRequirements['priority']
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline (Optional)
              </label>
              <input
                type="datetime-local"
                value={missionRequirements.deadline || ''}
                onChange={(e) => setMissionRequirements(prev => ({
                  ...prev,
                  deadline: e.target.value
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <button
              onClick={generateMissionPlan}
              disabled={isGenerating || !boundary}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Generate AI Mission Plan'}
            </button>
          </div>
        );

      case 'parameters':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Altitude (m)
              </label>
              <input
                type="number"
                min="10"
                max="150"
                value={flightParameters.altitude}
                onChange={(e) => {
                  const newParams = { ...flightParameters, altitude: Number(e.target.value) };
                  setFlightParameters(newParams);
                  onParametersChanged?.(newParams);
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Speed (m/s)
              </label>
              <input
                type="number"
                min="2"
                max="20"
                value={flightParameters.speed}
                onChange={(e) => {
                  const newParams = { ...flightParameters, speed: Number(e.target.value) };
                  setFlightParameters(newParams);
                  onParametersChanged?.(newParams);
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Forward Overlap (%)
              </label>
              <input
                type="range"
                min="50"
                max="95"
                value={flightParameters.overlapForward}
                onChange={(e) => {
                  const newParams = { ...flightParameters, overlapForward: Number(e.target.value) };
                  setFlightParameters(newParams);
                  onParametersChanged?.(newParams);
                }}
                className="w-full"
              />
              <span className="text-sm text-gray-600">{flightParameters.overlapForward}%</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Side Overlap (%)
              </label>
              <input
                type="range"
                min="40"
                max="85"
                value={flightParameters.overlapSide}
                onChange={(e) => {
                  const newParams = { ...flightParameters, overlapSide: Number(e.target.value) };
                  setFlightParameters(newParams);
                  onParametersChanged?.(newParams);
                }}
                className="w-full"
              />
              <span className="text-sm text-gray-600">{flightParameters.overlapSide}%</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Camera Angle (degrees)
              </label>
              <input
                type="range"
                min="-90"
                max="0"
                value={flightParameters.cameraAngle}
                onChange={(e) => {
                  const newParams = { ...flightParameters, cameraAngle: Number(e.target.value) };
                  setFlightParameters(newParams);
                  onParametersChanged?.(newParams);
                }}
                className="w-full"
              />
              <span className="text-sm text-gray-600">{flightParameters.cameraAngle}° (0 = nadir)</span>
            </div>
          </div>
        );

      case 'weather':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-900">Weather Windows</h4>
              <button
                onClick={handleWeatherRefresh}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Refresh
              </button>
            </div>

            {currentMissionPlan?.weatherWindows.map((window, index) => (
              <div
                key={index}
                className={`p-3 border rounded-lg ${
                  window === currentMissionPlan.recommendedWindow
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-sm">
                    {new Date(window.startTime).toLocaleDateString()} {new Date(window.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    window.safetyLevel === 'excellent' ? 'bg-green-100 text-green-800' :
                    window.safetyLevel === 'good' ? 'bg-blue-100 text-blue-800' :
                    window.safetyLevel === 'marginal' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {window.safetyLevel.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{window.conditions}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Duration: {window.duration} min • Score: {window.score}/100
                </p>
              </div>
            ))}

            {currentMissionPlan && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">Recommended Window</h5>
                <p className="text-sm text-blue-800">
                  {currentMissionPlan.recommendedWindow
                    ? `${new Date(currentMissionPlan.recommendedWindow.startTime).toLocaleDateString()} at ${new Date(currentMissionPlan.recommendedWindow.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : 'No suitable weather window found'
                  }
                </p>
              </div>
            )}
          </div>
        );

      case 'export':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform
              </label>
              <select
                value={exportSettings.platform}
                onChange={(e) => setExportSettings(prev => ({ ...prev, platform: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="generic">Generic KML</option>
                <option value="dji">DJI</option>
                <option value="autel">Autel</option>
                <option value="litchi">Litchi</option>
                <option value="pix4d">Pix4D Capture</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format
              </label>
              <select
                value={exportSettings.format}
                onChange={(e) => setExportSettings(prev => ({ ...prev, format: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="kml">KML</option>
                <option value="kmz">KMZ</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeMetadata"
                checked={exportSettings.includeMetadata}
                onChange={(e) => setExportSettings(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="includeMetadata" className="ml-2 text-sm text-gray-700">
                Include metadata and flight details
              </label>
            </div>

            <button
              onClick={handleExport}
              disabled={!currentMissionPlan}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Export Flight Plan
            </button>

            {currentMissionPlan && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">Export Preview</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• {currentMissionPlan.flightPlan.waypoints.length} waypoints</li>
                  <li>• {currentMissionPlan.flightPlan.estimatedFlightTime.toFixed(1)} min flight time</li>
                  <li>• {currentMissionPlan.flightPlan.photoCount} photo points</li>
                  <li>• Compatible with {exportSettings.platform} platform</li>
                </ul>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Mission Planning</h2>
        <p className="text-sm text-gray-600 mt-1">
          {location.name || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'planning', label: 'Planning', icon: '🎯' },
          { id: 'parameters', label: 'Parameters', icon: '⚙️' },
          { id: 'weather', label: 'Weather', icon: '🌤️' },
          { id: 'export', label: 'Export', icon: '📤' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 px-4 py-3 text-sm font-medium text-center border-b-2 ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        {renderTabContent()}
      </div>

      {/* Mission Plan Summary */}
      {currentMissionPlan && activeTab === 'planning' && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-2">Mission Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Flight Time:</span>
              <span className="ml-2 font-medium">{currentMissionPlan.flightPlan.estimatedFlightTime.toFixed(1)} min</span>
            </div>
            <div>
              <span className="text-gray-600">Battery:</span>
              <span className={`ml-2 font-medium ${
                currentMissionPlan.flightPlan.batteryUsage > 80 ? 'text-red-600' : 'text-green-600'
              }`}>
                {currentMissionPlan.flightPlan.batteryUsage.toFixed(0)}%
              </span>
            </div>
            <div>
              <span className="text-gray-600">Distance:</span>
              <span className="ml-2 font-medium">{(currentMissionPlan.flightPlan.estimatedDistance / 1000).toFixed(1)} km</span>
            </div>
            <div>
              <span className="text-gray-600">Cost:</span>
              <span className="ml-2 font-medium">${currentMissionPlan.cost.totalCost}</span>
            </div>
          </div>

          {currentMissionPlan.riskAssessment.overall !== 'low' && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm font-medium text-yellow-800">
                Risk Level: {currentMissionPlan.riskAssessment.overall.toUpperCase()}
              </p>
              {currentMissionPlan.riskAssessment.warnings.length > 0 && (
                <ul className="mt-1 text-xs text-yellow-700">
                  {currentMissionPlan.riskAssessment.warnings.slice(0, 2).map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {currentMissionPlan.metadata.aiRecommendations.length > 0 && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm font-medium text-blue-800">AI Recommendations:</p>
              <ul className="mt-1 text-xs text-blue-700">
                {currentMissionPlan.metadata.aiRecommendations.slice(0, 2).map((rec, index) => (
                  <li key={index}>• {rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MissionPlanningPanel;
