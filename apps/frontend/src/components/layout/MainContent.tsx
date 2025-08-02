import React from 'react';
import MapComponent from '../MapComponent';
import MapErrorBoundary from '../MapErrorBoundary';
import type { DrawnPolygon } from '../../types';

interface MainContentProps {
  drawnPolygons: DrawnPolygon[];
  onPolygonDrawn: (polygon: DrawnPolygon) => void;
  onPolygonEdited: (polygon: DrawnPolygon) => void;
  onPolygonDeleted: (polygonId: string) => void;
  mapCenter: { lat: number; lng: number };
  orthomosaicUrl?: string;
  dsmUrl?: string;
}

const MainContent: React.FC<MainContentProps> = ({
  drawnPolygons,
  onPolygonDrawn,
  onPolygonEdited,
  onPolygonDeleted,
  mapCenter,
  orthomosaicUrl,
  dsmUrl,
}) => {
  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            CoDrone - AI-First Drone Data Copilot
          </h1>
          <p className="text-gray-600 mt-1">
            Analyze drone data with AI-powered spatial analysis and interactive mapping
          </p>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative bg-gray-100 min-h-0">
        <div className="absolute inset-0 w-full h-full">
          <MapErrorBoundary>
            <MapComponent
              onPolygonDrawn={(geoJsonPolygon) => {
                // Convert GeoJSONPolygon to DrawnPolygon
                const drawnPolygon: DrawnPolygon = {
                  id: Math.random().toString(36).substr(2, 9),
                  polygon: geoJsonPolygon,
                  name: `Polygon ${drawnPolygons.length + 1}`,
                  createdAt: new Date(),
                  updatedAt: new Date()
                };
                onPolygonDrawn(drawnPolygon);
              }}
              onPolygonEdited={(geoJsonPolygon) => {
                // Find the existing polygon and update it
                const existingPolygon = drawnPolygons.find(p =>
                  JSON.stringify(p.polygon.coordinates) === JSON.stringify(geoJsonPolygon.coordinates)
                );
                if (existingPolygon) {
                  const updatedPolygon: DrawnPolygon = {
                    ...existingPolygon,
                    polygon: geoJsonPolygon,
                    updatedAt: new Date()
                  };
                  onPolygonEdited(updatedPolygon);
                }
              }}
              onPolygonDeleted={(geoJsonPolygon) => {
                // Find the polygon to delete by coordinates
                const polygonToDelete = drawnPolygons.find(p =>
                  JSON.stringify(p.polygon.coordinates) === JSON.stringify(geoJsonPolygon.coordinates)
                );
                if (polygonToDelete) {
                  onPolygonDeleted(polygonToDelete.id);
                }
              }}
              initialPolygons={drawnPolygons}
              center={mapCenter}
              zoom={13}
              height="100%"
              enableDrawing={true}
              enableEditing={true}
              showMeasurements={true}
              orthomosaicUrl={orthomosaicUrl}
              dsmUrl={dsmUrl}
            />
          </MapErrorBoundary>
        </div>

        {/* Map Controls Overlay */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-2">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>DSM Layer</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Orthomosaic</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Drawn Polygons</span>
              </div>
            </div>
          </div>
        </div>

        {/* Polygon Info */}
        {drawnPolygons.length > 0 && (
          <div className="absolute bottom-4 left-4 z-10">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Drawn Polygons
              </h3>
              <div className="space-y-1">
                {drawnPolygons.map((polygon, index) => (
                  <div
                    key={polygon.id}
                    className="text-xs text-gray-600 flex justify-between items-center"
                  >
                    <span>Polygon {index + 1}</span>
                    <span className="text-blue-600">
                      {polygon.polygon.coordinates[0]?.length || 0} points
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                Use the chat panel to analyze these polygons
              </div>
            </div>
          </div>
        )}

        {/* Instructions for first time users */}
        {drawnPolygons.length === 0 && (
          <div className="absolute bottom-4 right-4 z-10">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-sm">
              <div className="flex items-start gap-3">
                <div className="text-blue-600 text-xl">✏️</div>
                <div>
                  <h3 className="text-sm font-medium text-blue-900 mb-1">
                    Getting Started
                  </h3>
                  <p className="text-xs text-blue-700">
                    Draw polygons on the map using the drawing tools, then ask the AI assistant to analyze them.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainContent;
