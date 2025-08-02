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

const MapComponent: React.FC<MapComponentProps> = ({
  onPolygonDrawn,
  onPolygonEdited,
  onPolygonDeleted,
  onVolumeCalculated,
  orthomosaicUrl,
  dsmUrl,
  initialPolygons = [],
  center = { lat: 40.7128, lng: -74.006 }, // Default to NYC
  zoom = 13,
  height = '400px',
  enableDrawing = true,
  enableEditing = true,
  showMeasurements = true,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const drawControlRef = useRef<L.Control.Draw | null>(null);

  const [drawnPolygons, setDrawnPolygons] =
    useState<DrawnPolygon[]>(initialPolygons);
  // const [selectedPolygon, setSelectedPolygon] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Helper functions (declared before use)
  const layerToGeoJSON = (layer: L.Layer): GeoJSONPolygon | null => {
    if (layer instanceof L.Polygon) {
      const latLngs = layer.getLatLngs()[0] as L.LatLng[];

      // Filter out duplicate consecutive points
      const uniqueCoordinates: GeoJSONCoordinate[] = [];
      for (let i = 0; i < latLngs.length; i++) {
        const coord: GeoJSONCoordinate = [latLngs[i].lng, latLngs[i].lat];
        if (
          i === 0 ||
          coord[0] !== uniqueCoordinates[uniqueCoordinates.length - 1][0] ||
          coord[1] !== uniqueCoordinates[uniqueCoordinates.length - 1][1]
        ) {
          uniqueCoordinates.push(coord);
        }
      }

      // Ensure polygon is closed and has at least 4 points
      if (uniqueCoordinates.length >= 3) {
        if (
          uniqueCoordinates[0][0] !==
            uniqueCoordinates[uniqueCoordinates.length - 1][0] ||
          uniqueCoordinates[0][1] !==
            uniqueCoordinates[uniqueCoordinates.length - 1][1]
        ) {
          uniqueCoordinates.push([
            uniqueCoordinates[0][0],
            uniqueCoordinates[0][1],
          ] as GeoJSONCoordinate);
        }

        // Ensure we have at least 4 points for a valid polygon
        if (uniqueCoordinates.length >= 4) {
          return {
            type: 'Polygon',
            coordinates: [uniqueCoordinates],
          };
        }
      }
    }
    return null;
  };

  const createDrawnPolygon = (
    polygon: GeoJSONPolygon,
    layer: L.Polygon
  ): DrawnPolygon => {
    const id =
      'polygon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const now = new Date();

    // Store layer reference on the drawn polygon
    (layer as L.Polygon & { _drawnPolygonId?: string })._drawnPolygonId = id;

    return {
      id,
      polygon,
      name: `Polygon ${drawnPolygons.length + 1}`,
      color: '#97009c',
      createdAt: now,
      updatedAt: now,
    };
  };

  const addPolygonPopup = (layer: L.Polygon, drawnPolygon: DrawnPolygon) => {
    if (!showMeasurements) return;

    const popupContent = `
      <div class="space-y-2">
        <h3 class="font-semibold text-sm">${drawnPolygon.name}</h3>
        <div class="text-xs space-y-1">
          ${drawnPolygon.area ? `<div>Area: ${formatArea(drawnPolygon.area)}</div>` : ''}
          ${drawnPolygon.volume ? `<div>Volume: ${formatVolume(drawnPolygon.volume)}</div>` : ''}
        </div>
        <div class="flex gap-1 mt-2">
          <button class="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600" onclick="window.measureArea('${drawnPolygon.id}')">
            Area
          </button>
          <button class="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600" onclick="window.measureVolume('${drawnPolygon.id}')">
            Volume
          </button>
        </div>
      </div>
    `;

    layer.bindPopup(popupContent);
  };

  const updatePolygonInState = (layer: L.Polygon, polygon: GeoJSONPolygon) => {
    const polygonId = (layer as L.Polygon & { _drawnPolygonId?: string })
      ._drawnPolygonId;
    if (!polygonId) return;

    setDrawnPolygons(prev =>
      prev.map(p =>
        p.id === polygonId ? { ...p, polygon, updatedAt: new Date() } : p
      )
    );
  };

  const removePolygonFromState = (layer: L.Polygon) => {
    const polygonId = (layer as L.Polygon & { _drawnPolygonId?: string })
      ._drawnPolygonId;
    if (!polygonId) return;

    setDrawnPolygons(prev => prev.filter(p => p.id !== polygonId));
  };

  const calculateArea = useCallback(
    async (polygon: GeoJSONPolygon, name: string) => {
      try {
        setIsLoading(true);

        // Use Turf.js for immediate area calculation
        const turfPolygon = turf.polygon(polygon.coordinates);
        const areaInSquareMeters = turf.area(turfPolygon);

        // Update polygon in state with area
        setDrawnPolygons(prev =>
          prev.map(p =>
            p.polygon === polygon ? { ...p, area: areaInSquareMeters } : p
          )
        );

        // Also send to backend for more accurate calculation
        const { spatialApi } = await import('@/lib/api');
        try {
          const result = await spatialApi.calculateArea({
            polygon_coordinates: JSON.stringify(polygon),
            measurement_name: name,
            coordinate_system: 'EPSG:4326',
          });

          setDrawnPolygons(prev =>
            prev.map(p =>
              p.polygon === polygon
                ? { ...p, area: result.area_square_meters, measurement: result }
                : p
            )
          );
        } catch (error) {
          console.error('Backend area calculation failed:', error);
          // Continue with Turf.js calculation
        }
      } catch (error) {
        console.error('Error calculating area:', error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const addPolygonToMap = useCallback(
    (drawnPolygon: DrawnPolygon) => {
      if (!drawnItemsRef.current) return;

      const coordinates = drawnPolygon.polygon.coordinates[0];
      const latLngs: L.LatLng[] = coordinates.map(coord =>
        L.latLng(coord[1], coord[0])
      );

      const layer = L.polygon(latLngs, {
        color: drawnPolygon.color || '#97009c',
        weight: 3,
        opacity: 0.8,
        fillOpacity: 0.3,
      });

      (layer as L.Polygon & { _drawnPolygonId?: string })._drawnPolygonId =
        drawnPolygon.id;
      drawnItemsRef.current.addLayer(layer);
      addPolygonPopup(layer, drawnPolygon);
    },
    []
  );

  const setupEventHandlers = useCallback(
    (map: L.Map, drawnItems: L.FeatureGroup) => {
      // Polygon created
      map.on(L.Draw.Event.CREATED, (event: L.LeafletEvent) => {
        const layer = event.layer as L.Polygon;
        const polygon = layerToGeoJSON(layer);

        if (polygon) {
          const drawnPolygon = createDrawnPolygon(polygon, layer);
          setDrawnPolygons(prev => [...prev, drawnPolygon]);
          drawnItems.addLayer(layer);

          // Add popup with measurement options
          addPolygonPopup(layer, drawnPolygon);

          // Calculate area immediately
          calculateArea(polygon, drawnPolygon.name);

          onPolygonDrawn?.(polygon);
        }
      });

      // Polygon edited
      map.on(L.Draw.Event.EDITED, (event: L.LeafletEvent) => {
        const layers = (event as unknown as { layers: L.LayerGroup }).layers;
        layers.eachLayer((layer: L.Layer) => {
          const polygon = layerToGeoJSON(layer);
          if (polygon && layer instanceof L.Polygon) {
            updatePolygonInState(layer, polygon);
            onPolygonEdited?.(polygon);
          }
        });
      });

      // Polygon deleted
      map.on(L.Draw.Event.DELETED, (event: L.LeafletEvent) => {
        const layers = (event as unknown as { layers: L.LayerGroup }).layers;
        layers.eachLayer((layer: L.Layer) => {
          const polygon = layerToGeoJSON(layer);
          if (polygon && layer instanceof L.Polygon) {
            removePolygonFromState(layer);
            onPolygonDeleted?.(polygon);
          }
        });
      });
    },
    [onPolygonDrawn, onPolygonEdited, onPolygonDeleted, calculateArea]
  );

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    console.log('🗺️ Initializing map component...');

    try {
      // Create map
      const map = L.map(mapContainerRef.current).setView(
        [center.lat, center.lng],
        zoom
      );
      mapRef.current = map;

      // Suppress touchleave warnings
      const originalWarn = console.warn;
      console.warn = (...args) => {
        if (
          args[0] &&
          typeof args[0] === 'string' &&
          args[0].includes('touchleave')
        ) {
          return; // Suppress touchleave warnings
        }
        originalWarn.apply(console, args);
      };

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

      // Initialize draw control if drawing is enabled
      if (enableDrawing) {
        console.log('✏️ Initializing drawing controls...');
        const drawControl = new L.Control.Draw({
          edit: enableEditing
            ? {
                featureGroup: drawnItems,
              }
            : undefined,
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
        console.log('✅ Drawing controls initialized');
      }

      // Set up event handlers
      setupEventHandlers(map, drawnItems);
      console.log('✅ Map component initialized successfully');

      return () => {
        // Restore original console.warn
        console.warn = originalWarn;

        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [center.lat, center.lng, zoom, enableDrawing, enableEditing, orthomosaicUrl, setupEventHandlers]);

  // Load initial polygons
  useEffect(() => {
    if (!drawnItemsRef.current || initialPolygons.length === 0) return;

    initialPolygons.forEach(drawnPolygon => {
      addPolygonToMap(drawnPolygon);
    });
  }, [initialPolygons, addPolygonToMap]);

  const calculateVolume = useCallback(
    async (polygonId: string, dsmFile?: string, baseElevation?: number) => {
      const polygon = drawnPolygons.find(p => p.id === polygonId);
      if (!polygon) return;

      try {
        setIsLoading(true);

        // Integrate with the backend spatial tools
        const { spatialApi } = await import('@/lib/api');
        const result = await spatialApi.calculateVolume({
          polygon_coordinates: JSON.stringify(polygon.polygon),
          dsm_file_path: dsmFile || dsmUrl || '/default/dsm.tif',
          base_elevation: baseElevation,
          measurement_name: polygon.name,
        });

        setDrawnPolygons(prev =>
          prev.map(p =>
            p.id === polygonId
              ? {
                  ...p,
                  volume: result.volume_cubic_meters,
                  measurement: result,
                }
              : p
          )
        );

        onVolumeCalculated?.(result);
      } catch (error) {
        console.error('Error calculating volume:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [drawnPolygons, dsmUrl, onVolumeCalculated]
  );

  // Expose functions to global window for popup buttons
  useEffect(() => {
    (
      window as Window & {
        measureArea?: (polygonId: string) => void;
        measureVolume?: (polygonId: string) => void;
      }
    ).measureArea = (polygonId: string) => {
      const polygon = drawnPolygons.find(p => p.id === polygonId);
      if (polygon) {
        calculateArea(polygon.polygon, polygon.name);
      }
    };

    (
      window as Window & {
        measureArea?: (polygonId: string) => void;
        measureVolume?: (polygonId: string) => void;
      }
    ).measureVolume = (polygonId: string) => {
      calculateVolume(polygonId);
    };

    return () => {
      delete (
        window as Window & {
          measureArea?: (polygonId: string) => void;
          measureVolume?: (polygonId: string) => void;
        }
      ).measureArea;
      delete (
        window as Window & {
          measureArea?: (polygonId: string) => void;
          measureVolume?: (polygonId: string) => void;
        }
      ).measureVolume;
    };
  }, [drawnPolygons, calculateArea, calculateVolume]);

  const formatArea = (area: number): string => {
    if (area < 10000) {
      return `${area.toFixed(1)} m²`;
    } else {
      return `${(area / 10000).toFixed(2)} ha`;
    }
  };

  const formatVolume = (volume: number): string => {
    return `${volume.toFixed(1)} m³`;
  };

  // Public API for external components
  // const addPolygon = useCallback((polygon: GeoJSONPolygon, name?: string) => {
  //   if (!drawnItemsRef.current) return;

  //   const drawnPolygon = createDrawnPolygon(polygon, {} as L.Layer);
  //   if (name) drawnPolygon.name = name;

  //   setDrawnPolygons(prev => [...prev, drawnPolygon]);
  //   addPolygonToMap(drawnPolygon);
  // }, []);

  // const clearPolygons = useCallback(() => {
  //   if (drawnItemsRef.current) {
  //     drawnItemsRef.current.clearLayers();
  //   }
  //   setDrawnPolygons([]);
  // }, []);

  const zoomToPolygon = useCallback(
    (polygonId: string) => {
      const polygon = drawnPolygons.find(p => p.id === polygonId);
      if (!polygon || !mapRef.current) return;

      const coordinates = polygon.polygon.coordinates[0];
      const latLngs: L.LatLng[] = coordinates.map(coord =>
        L.latLng(coord[1], coord[0])
      );
      const bounds = L.latLngBounds(latLngs);

      mapRef.current.fitBounds(bounds, { padding: [20, 20] });
    },
    [drawnPolygons]
  );

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainerRef}
        style={{ height, width: '100%' }}
        className="rounded-lg border border-gray-300"
      />

      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="bg-white px-4 py-2 rounded-lg flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm">Calculating measurements...</span>
          </div>
        </div>
      )}

      {/* Polygon list panel */}
      {drawnPolygons.length > 0 && (
        <div className="absolute top-2 right-2 bg-white rounded-lg shadow-lg p-3 max-w-xs">
          <h4 className="font-semibold text-sm mb-2">
            Drawn Polygons ({drawnPolygons.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {drawnPolygons.map(polygon => (
              <div
                key={polygon.id}
                className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded"
              >
                <div>
                  <div className="font-medium">{polygon.name}</div>
                  {polygon.area && (
                    <div className="text-gray-600">
                      {formatArea(polygon.area)}
                    </div>
                  )}
                  {polygon.volume && (
                    <div className="text-gray-600">
                      {formatVolume(polygon.volume)}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => zoomToPolygon(polygon.id)}
                  className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Zoom
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
