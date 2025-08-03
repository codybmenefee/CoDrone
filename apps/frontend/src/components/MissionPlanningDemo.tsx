import React, { useState } from 'react';
import MissionPlannerMap from './MissionPlannerMap';
import MissionPlanningPanel from './MissionPlanningPanel';
import { GeoJSONPolygon } from '@/types';

// Demo component to showcase all new mission planning features
const MissionPlanningDemo: React.FC = () => {
  const [currentBoundary, setCurrentBoundary] = useState<GeoJSONPolygon | undefined>();
  const [currentFlightPlan, setCurrentFlightPlan] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [demoLocation] = useState({
    lat: 40.7128,
    lng: -74.0060,
    name: "NYC Demo Area"
  });

  const handlePolygonDrawn = (polygon: GeoJSONPolygon) => {
    console.log('Polygon drawn:', polygon);
    setCurrentBoundary(polygon);
  };

  const handleFlightPlanGenerated = (flightPlan: any) => {
    console.log('Flight plan generated:', flightPlan);
    setCurrentFlightPlan(flightPlan);
  };

  const handleWeatherCheck = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`/api/weather?lat=${lat}&lng=${lng}&type=current`);
      const data = await response.json();
      if (data.success) {
        setWeatherData(data.data);
      }
    } catch (error) {
      console.error('Weather check failed:', error);
    }
  };

  const handleKMLExport = async (flightPlan: any) => {
    try {
      const exportData = {
        type: 'flightPlan',
        data: flightPlan,
        options: {
          platform: 'dji',
          format: 'kml',
          metadata: {
            missionName: 'Demo Mission',
            pilotName: 'Demo User'
          }
        }
      };

      const response = await fetch('/api/export/kml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportData)
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'demo-mission.kml';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        alert('KML file downloaded successfully!');
      }
    } catch (error) {
      console.error('KML export failed:', error);
      alert('KML export failed. Please try again.');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">
            🚁 CoDrone Mission Planning Demo
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered mission planning with weather integration, smart boundaries, and automated optimization
          </p>
        </div>
      </div>

      {/* Demo Content */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full p-4 gap-4">

        {/* Map Section */}
        <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Interactive Mission Planner</h2>
            <p className="text-sm text-gray-600 mt-1">
              Draw polygons, generate flight plans, and visualize missions with real-time weather data
            </p>
          </div>

          <div className="h-[600px]">
            <MissionPlannerMap
              center={demoLocation}
              zoom={13}
              height="100%"
              onPolygonDrawn={handlePolygonDrawn}
              onFlightPlanGenerated={handleFlightPlanGenerated}
              onWeatherCheck={handleWeatherCheck}
              onExportKML={handleKMLExport}
              weatherData={weatherData}
              currentFlightPlan={currentFlightPlan}
              showFlightPaths={true}
              showWeatherOverlay={!!weatherData}
            />
          </div>
        </div>

        {/* Control Panel Section */}
        <div className="w-96">
          <MissionPlanningPanel
            boundary={currentBoundary}
            location={demoLocation}
            onMissionPlanGenerated={handleFlightPlanGenerated}
            onParametersChanged={(params) => console.log('Parameters changed:', params)}
            onExportKML={handleKMLExport}
            onWeatherRefresh={handleWeatherCheck}
          />

          {/* Demo Instructions */}
          <div className="mt-4 bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">🎯 Demo Instructions</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Draw a polygon on the map</li>
              <li>2. Select mission type and quality</li>
              <li>3. Click "Generate AI Mission Plan"</li>
              <li>4. Check weather conditions</li>
              <li>5. Export KML for your drone</li>
            </ol>
          </div>

          {/* Feature Highlights */}
          <div className="mt-4 bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">✨ New Features</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>🤖 AI-powered mission planning</li>
              <li>🌤️ Real-time weather integration</li>
              <li>📐 Smart boundary suggestions</li>
              <li>⚙️ Intelligent parameter optimization</li>
              <li>📤 Multi-platform KML export</li>
              <li>🎯 Flight path visualization</li>
            </ul>
          </div>

          {/* API Testing */}
          <div className="mt-4 bg-yellow-50 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">🧪 Test APIs</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleWeatherCheck(demoLocation.lat, demoLocation.lng)}
                className="w-full text-left text-sm bg-yellow-100 hover:bg-yellow-200 p-2 rounded border"
              >
                Test Weather API
              </button>

              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/boundary-suggestions?action=features&centerLat=40.7128&centerLng=-74.0060&radiusMeters=500');
                    const data = await response.json();
                    console.log('Boundary features:', data);
                    alert(`Found ${data.data?.features?.length || 0} features. Check console for details.`);
                  } catch (error) {
                    console.error('Boundary API test failed:', error);
                  }
                }}
                className="w-full text-left text-sm bg-yellow-100 hover:bg-yellow-200 p-2 rounded border"
              >
                Test Boundary Detection
              </button>

              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/parameter-optimization?action=defaults&missionType=survey&qualityLevel=high');
                    const data = await response.json();
                    console.log('Default parameters:', data);
                    alert('Default parameters loaded. Check console for details.');
                  } catch (error) {
                    console.error('Parameter API test failed:', error);
                  }
                }}
                className="w-full text-left text-sm bg-yellow-100 hover:bg-yellow-200 p-2 rounded border"
              >
                Test Parameter Optimization
              </button>
            </div>
          </div>

          {/* Status Display */}
          {(currentBoundary || currentFlightPlan || weatherData) && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">📊 Current Status</h3>
              <div className="text-sm space-y-1">
                {currentBoundary && (
                  <div className="text-green-600">✅ Boundary drawn</div>
                )}
                {currentFlightPlan && (
                  <div className="text-blue-600">✅ Flight plan generated ({currentFlightPlan.waypoints?.length || 0} waypoints)</div>
                )}
                {weatherData && (
                  <div className="text-purple-600">✅ Weather data loaded ({weatherData.suitable ? 'Good' : 'Poor'} conditions)</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissionPlanningDemo;
