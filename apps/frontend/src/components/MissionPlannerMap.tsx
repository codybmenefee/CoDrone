import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import * as turf from '@turf/turf';

// Import leaflet-draw after CSS
import 'leaflet-draw';
import {
  MapComponentProps,
  GeoJSONPolygon,
  DrawnPolygon,
  GeoJSONCoordinate,
} from '@/types';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Mission planning specific types
interface FlightWaypoint {
  lat: number;
  lng: number;
  alt: number;
  speed?: number;
  action?: 'photo' | 'video_start' | 'video_stop' | 'hover';
  heading?: number;
}

interface FlightPlan {
  waypoints: FlightWaypoint[];
  estimatedFlightTime: number;
  estimatedDistance: number;
  photoCount: number;
  batteryUsage: number;
  patternType: 'grid' | 'perimeter' | 'adaptive';
}

interface WeatherConditions {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  suitable: boolean;
  safetyLevel: 'excellent' | 'good' | 'marginal' | 'poor' | 'unsafe';
}

interface MissionPlannerMapProps extends MapComponentProps {
  onFlightPlanGenerated?: (flightPlan: FlightPlan) => void;
  onWeatherCheck?: (lat: number, lng: number) => void;
  onExportKML?: (flightPlan: FlightPlan) => void;
  showFlightPaths?: boolean;
  showWeatherOverlay?: boolean;
  missionType?: 'survey' | 'inspection' | 'mapping' | 'monitoring';
  flightParameters?: {
    altitude: number;
    speed: number;
    overlapForward: number;
    overlapSide: number;
  };
  weatherData?: WeatherConditions;
  currentFlightPlan?: FlightPlan;
}

const MissionPlannerMap: React.FC<MissionPlannerMapProps> = ({
  onPolygonDrawn,
  onPolygonEdited,
  onPolygonDeleted,
  onVolumeCalculated,
  onFlightPlanGenerated,
  onWeatherCheck,
  onExportKML,
  orthomosaicUrl,
  dsmUrl,
  initialPolygons = [],
  center = { lat: 40.7128, lng: -74.006 },
  zoom = 13,
  height = '600px',
  enableDrawing = true,
  enableEditing = true,
  showMeasurements = true,
  showFlightPaths = true,
  showWeatherOverlay = false,
  missionType = 'survey',
  flightParameters = {
    altitude: 120,
    speed: 10,
    overlapForward: 70,
    overlapSide: 60,
  },
  weatherData,
  currentFlightPlan,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const flightPathLayerRef = useRef<L.LayerGroup | null>(null);
  const weatherLayerRef = useRef<L.LayerGroup | null>(null);
  const drawControlRef = useRef<L.Control.Draw | null>(null);

  const [drawnPolygons, setDrawnPolygons] = useState<DrawnPolygon[]>(initialPolygons);
  const [isGeneratingFlightPlan, setIsGeneratingFlightPlan] = useState(false);
  const [selectedMissionType, setSelectedMissionType] = useState(missionType);
  const [showFlightPlanPanel, setShowFlightPlanPanel] = useState(false);

  // Create flight path layer
  const createFlightPathLayer = useCallback(() => {
    if (!mapRef.current) return null;

    const layer = new L.LayerGroup();
    mapRef.current.addLayer(layer);
    return layer;
  }, []);

  // Create weather overlay layer
  const createWeatherLayer = useCallback(() => {
    if (!mapRef.current) return null;

    const layer = new L.LayerGroup();
    mapRef.current.addLayer(layer);
    return layer;
  }, []);

  // Generate flight plan from polygon
  const generateFlightPlan = useCallback(async (polygon: GeoJSONPolygon) => {
    if (!onFlightPlanGenerated) return;

    setIsGeneratingFlightPlan(true);

    try {
      // Simulate flight plan generation
      const waypoints = generateGridPattern(polygon, flightParameters);
      const flightPlan: FlightPlan = {
        waypoints,
        estimatedFlightTime: estimateFlightTime(waypoints, flightParameters.speed),
        estimatedDistance: calculateTotalDistance(waypoints),
        photoCount: estimatePhotoCount(waypoints),
        batteryUsage: calculateBatteryUsage(waypoints, flightParameters.speed),
        patternType: selectedMissionType === 'inspection' ? 'perimeter' : 'grid',
      };

      onFlightPlanGenerated(flightPlan);
      displayFlightPath(flightPlan);
      setShowFlightPlanPanel(true);
    } catch (error) {
      console.error('Error generating flight plan:', error);
    } finally {
      setIsGeneratingFlightPlan(false);
    }
  }, [flightParameters, selectedMissionType, onFlightPlanGenerated]);

  // Display flight path on map
  const displayFlightPath = useCallback((flightPlan: FlightPlan) => {
    if (!flightPathLayerRef.current || !showFlightPaths) return;

    // Clear existing flight path
    flightPathLayerRef.current.clearLayers();

    // Create flight path line
    const pathCoords = flightPlan.waypoints.map(wp => [wp.lat, wp.lng] as L.LatLngTuple);
    const flightPath = L.polyline(pathCoords, {
      color: '#ff6b35',
      weight: 3,
      opacity: 0.8,
      dashArray: '10, 5',
    });

    flightPathLayerRef.current.addLayer(flightPath);

    // Add waypoint markers
    flightPlan.waypoints.forEach((waypoint, index) => {
      const waypointIcon = L.divIcon({
        html: `<div class="waypoint-marker" style="
          background-color: #ff6b35;
          border: 2px solid white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
          color: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">${index + 1}</div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        className: '',
      });

      const marker = L.marker([waypoint.lat, waypoint.lng], { icon: waypointIcon });

      // Add popup with waypoint details
      const popupContent = `
        <div class="waypoint-popup">
          <h4>Waypoint ${index + 1}</h4>
          <p><strong>Altitude:</strong> ${waypoint.alt}m</p>
          <p><strong>Speed:</strong> ${waypoint.speed || flightParameters.speed}m/s</p>
          ${waypoint.action ? `<p><strong>Action:</strong> ${waypoint.action}</p>` : ''}
          ${waypoint.heading ? `<p><strong>Heading:</strong> ${waypoint.heading}°</p>` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);
      flightPathLayerRef.current!.addLayer(marker);
    });

    // Add takeoff and landing markers
    if (flightPlan.waypoints.length > 0) {
      const takeoffPoint = flightPlan.waypoints[0];
      const landingPoint = flightPlan.waypoints[flightPlan.waypoints.length - 1];

      const takeoffIcon = L.divIcon({
        html: `<div style="
          background-color: #22c55e;
          border: 2px solid white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">T</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        className: '',
      });

      const landingIcon = L.divIcon({
        html: `<div style="
          background-color: #ef4444;
          border: 2px solid white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">L</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        className: '',
      });

      const takeoffMarker = L.marker([takeoffPoint.lat, takeoffPoint.lng], { icon: takeoffIcon })
        .bindPopup('<strong>Takeoff Point</strong>');
      const landingMarker = L.marker([landingPoint.lat, landingPoint.lng], { icon: landingIcon })
        .bindPopup('<strong>Landing Point</strong>');

      flightPathLayerRef.current!.addLayer(takeoffMarker);
      flightPathLayerRef.current!.addLayer(landingMarker);
    }
  }, [showFlightPaths, flightParameters.speed]);

  // Display weather overlay
  const displayWeatherOverlay = useCallback(() => {
    if (!weatherLayerRef.current || !showWeatherOverlay || !weatherData) return;

    // Clear existing weather overlay
    weatherLayerRef.current.clearLayers();

    // Add weather indicator at center of map
    const bounds = mapRef.current!.getBounds();
    const center = bounds.getCenter();

    const weatherIcon = L.divIcon({
      html: `<div class="weather-indicator" style="
        background-color: ${getWeatherColor(weatherData.safetyLevel)};
        border: 2px solid white;
        border-radius: 8px;
        padding: 8px;
        min-width: 120px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        font-size: 12px;
        color: white;
        text-align: center;
      ">
        <div><strong>Weather</strong></div>
        <div>${weatherData.temperature}°C</div>
        <div>${weatherData.windSpeed} m/s</div>
        <div>${weatherData.safetyLevel.toUpperCase()}</div>
      </div>`,
      iconSize: [120, 60],
      iconAnchor: [60, 30],
      className: '',
    });

    const weatherMarker = L.marker([center.lat, center.lng], { icon: weatherIcon });
    weatherLayerRef.current.addLayer(weatherMarker);
  }, [showWeatherOverlay, weatherData]);

  // Get weather color based on safety level
  const getWeatherColor = (safetyLevel: string) => {
    switch (safetyLevel) {
      case 'excellent': return '#22c55e';
      case 'good': return '#84cc16';
      case 'marginal': return '#f59e0b';
      case 'poor': return '#ef4444';
      case 'unsafe': return '#991b1b';
      default: return '#6b7280';
    }
  };

  // Generate grid pattern waypoints
  const generateGridPattern = (
    polygon: GeoJSONPolygon,
    params: typeof flightParameters
  ): FlightWaypoint[] => {
    const waypoints: FlightWaypoint[] = [];

    // Get polygon bounds
    const coords = polygon.coordinates[0];
    const lats = coords.map(coord => coord[1]);
    const lngs = coords.map(coord => coord[0]);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Calculate spacing based on overlap and altitude
    const gsd = (params.altitude * 6.17) / (8.8 * 4000); // Simplified GSD calculation
    const forwardSpacing = (3000 * gsd / 100) * (1 - params.overlapForward / 100);
    const sideSpacing = (4000 * gsd / 100) * (1 - params.overlapSide / 100);

    // Convert spacing to degrees (very rough approximation)
    const latSpacing = sideSpacing / 111000;
    const lngSpacing = forwardSpacing / (111000 * Math.cos(minLat * Math.PI / 180));

    // Generate grid lines
    let isReverse = false;
    for (let lat = minLat; lat <= maxLat; lat += latSpacing) {
      const lineWaypoints: FlightWaypoint[] = [];

      for (let lng = minLng; lng <= maxLng; lng += lngSpacing) {
        // Check if point is inside polygon
        if (isPointInPolygon({ lat, lng }, coords)) {
          lineWaypoints.push({
            lat,
            lng,
            alt: params.altitude,
            speed: params.speed,
            action: 'photo',
          });
        }
      }

      // Alternate direction for efficient flight pattern
      if (isReverse) {
        lineWaypoints.reverse();
      }

      waypoints.push(...lineWaypoints);
      isReverse = !isReverse;
    }

    return waypoints;
  };

  // Check if point is inside polygon
  const isPointInPolygon = (point: { lat: number; lng: number }, coords: number[][]) => {
    let inside = false;
    for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
      if (((coords[i][1] > point.lat) !== (coords[j][1] > point.lat)) &&
          (point.lng < (coords[j][0] - coords[i][0]) * (point.lat - coords[i][1]) / (coords[j][1] - coords[i][1]) + coords[i][0])) {
        inside = !inside;
      }
    }
    return inside;
  };

  // Calculate total flight distance
  const calculateTotalDistance = (waypoints: FlightWaypoint[]): number => {
    let totalDistance = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];
      totalDistance += calculateDistance(p1.lat, p1.lng, p2.lat, p2.lng);
    }
    return totalDistance;
  };

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  // Estimate flight time
  const estimateFlightTime = (waypoints: FlightWaypoint[], speed: number): number => {
    const distance = calculateTotalDistance(waypoints);
    return distance / speed / 60; // Convert to minutes
  };

  // Estimate photo count
  const estimatePhotoCount = (waypoints: FlightWaypoint[]): number => {
    return waypoints.filter(wp => wp.action === 'photo').length;
  };

  // Calculate battery usage
  const calculateBatteryUsage = (waypoints: FlightWaypoint[], speed: number): number => {
    const flightTime = estimateFlightTime(waypoints, speed);
    const maxFlightTime = 30; // Assume 30 minutes max flight time
    return Math.min(100, (flightTime / maxFlightTime) * 100);
  };

  // Handle polygon creation
  const handlePolygonCreated = useCallback((polygon: GeoJSONPolygon) => {
    onPolygonDrawn?.(polygon);

    // Auto-generate flight plan if enabled
    if (selectedMissionType) {
      generateFlightPlan(polygon);
    }
  }, [onPolygonDrawn, selectedMissionType, generateFlightPlan]);

  // Handle weather check
  const handleWeatherCheck = useCallback(() => {
    if (!onWeatherCheck || !mapRef.current) return;

    const mapCenter = mapRef.current.getCenter();
    onWeatherCheck(mapCenter.lat, mapCenter.lng);
  }, [onWeatherCheck]);

  // Handle KML export
  const handleKMLExport = useCallback(() => {
    if (!onExportKML || !currentFlightPlan) return;

    onExportKML(currentFlightPlan);
  }, [onExportKML, currentFlightPlan]);

  // Initialize map with flight planning features
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    console.log('🗺️ Initializing mission planner map...');

    try {
      // Create map
      const map = L.map(mapContainerRef.current).setView([center.lat, center.lng], zoom);
      mapRef.current = map;

      // Add base tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      // Add orthomosaic layer if provided
      if (orthomosaicUrl) {
        L.tileLayer(orthomosaicUrl, {
          attribution: 'Orthomosaic Data',
          opacity: 0.8,
        }).addTo(map);
      }

      // Initialize feature group for drawn items
      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);
      drawnItemsRef.current = drawnItems;

      // Initialize flight path layer
      flightPathLayerRef.current = createFlightPathLayer();

      // Initialize weather layer
      weatherLayerRef.current = createWeatherLayer();

      // Initialize draw control
      if (enableDrawing) {
        const drawControl = new L.Control.Draw({
          edit: enableEditing ? { featureGroup: drawnItems } : undefined,
          draw: {
            rectangle: false,
            circle: false,
            circlemarker: false,
            marker: false,
            polyline: false,
            polygon: {
              allowIntersection: false,
              drawError: {
                color: '#e1e100',
                message: '<strong>Error:</strong> Shape edges cannot cross!',
              },
              shapeOptions: {
                color: '#97009c',
                weight: 3,
                opacity: 0.8,
                fillOpacity: 0.3,
              },
            },
          },
        });

        map.addControl(drawControl);
        drawControlRef.current = drawControl;
      }

      // Set up event handlers for polygon creation
      map.on(L.Draw.Event.CREATED, (event: L.LeafletEvent) => {
        const layer = event.layer as L.Polygon;
        drawnItems.addLayer(layer);

        // Convert to GeoJSON and handle
        const latLngs = layer.getLatLngs()[0] as L.LatLng[];
        const coordinates = latLngs.map(ll => [ll.lng, ll.lat]);
        coordinates.push(coordinates[0]); // Close the polygon

        const polygon: GeoJSONPolygon = {
          type: 'Polygon',
          coordinates: [coordinates],
        };

        handlePolygonCreated(polygon);
      });

      console.log('✅ Mission planner map initialized successfully');

    } catch (error) {
      console.error('Error initializing mission planner map:', error);
    }
  }, [center.lat, center.lng, zoom, enableDrawing, enableEditing, orthomosaicUrl, createFlightPathLayer, createWeatherLayer, handlePolygonCreated]);

  // Update flight path when currentFlightPlan changes
  useEffect(() => {
    if (currentFlightPlan) {
      displayFlightPath(currentFlightPlan);
    }
  }, [currentFlightPlan, displayFlightPath]);

  // Update weather overlay when weatherData changes
  useEffect(() => {
    displayWeatherOverlay();
  }, [displayWeatherOverlay]);

  return (
    <div className="relative w-full h-full">
      {/* Mission Planner Controls */}
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4 min-w-[200px]">
        <h3 className="font-semibold text-sm mb-3">Mission Planner</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Mission Type
            </label>
            <select
              value={selectedMissionType}
              onChange={(e) => setSelectedMissionType(e.target.value as typeof selectedMissionType)}
              className="w-full text-xs border border-gray-300 rounded px-2 py-1"
            >
              <option value="survey">Survey</option>
              <option value="inspection">Inspection</option>
              <option value="mapping">Mapping</option>
              <option value="monitoring">Monitoring</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleWeatherCheck}
              className="flex-1 px-3 py-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Weather
            </button>

            {currentFlightPlan && (
              <button
                onClick={handleKMLExport}
                className="flex-1 px-3 py-2 text-xs bg-green-500 text-white rounded hover:bg-green-600"
              >
                Export KML
              </button>
            )}
          </div>

          {isGeneratingFlightPlan && (
            <div className="text-xs text-blue-600 text-center">
              Generating flight plan...
            </div>
          )}
        </div>
      </div>

      {/* Flight Plan Panel */}
      {showFlightPlanPanel && currentFlightPlan && (
        <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-[250px]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-sm">Flight Plan</h3>
            <button
              onClick={() => setShowFlightPlanPanel(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Pattern:</span>
              <span className="font-medium">{currentFlightPlan.patternType}</span>
            </div>
            <div className="flex justify-between">
              <span>Waypoints:</span>
              <span className="font-medium">{currentFlightPlan.waypoints.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Flight Time:</span>
              <span className="font-medium">{currentFlightPlan.estimatedFlightTime.toFixed(1)} min</span>
            </div>
            <div className="flex justify-between">
              <span>Distance:</span>
              <span className="font-medium">{(currentFlightPlan.estimatedDistance / 1000).toFixed(1)} km</span>
            </div>
            <div className="flex justify-between">
              <span>Photos:</span>
              <span className="font-medium">{currentFlightPlan.photoCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Battery:</span>
              <span className={`font-medium ${currentFlightPlan.batteryUsage > 80 ? 'text-red-600' : 'text-green-600'}`}>
                {currentFlightPlan.batteryUsage.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        style={{ height, width: '100%' }}
        className="rounded-lg border border-gray-300"
      />

      {/* Weather Status */}
      {weatherData && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full`}
              style={{ backgroundColor: getWeatherColor(weatherData.safetyLevel) }}
            />
            <span className="text-xs font-medium">
              {weatherData.suitable ? 'Flight Conditions: Good' : 'Flight Conditions: Poor'}
            </span>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {weatherData.temperature}°C, Wind: {weatherData.windSpeed} m/s
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionPlannerMap;
