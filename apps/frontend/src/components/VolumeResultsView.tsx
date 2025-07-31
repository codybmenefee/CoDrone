import React from 'react';
import { BarChart3, TrendingUp, Info, Download, MapPin } from 'lucide-react';
import { VolumeResult, AreaResult } from '@/types';

interface VolumeResultsViewProps {
  result: VolumeResult | AreaResult | null;
  onExport?: (result: VolumeResult | AreaResult) => void;
  onZoomToPolygon?: () => void;
  className?: string;
}

const VolumeResultsView: React.FC<VolumeResultsViewProps> = ({
  result,
  onExport,
  onZoomToPolygon,
  className = '',
}) => {
  if (!result) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p>No measurement results to display</p>
        <p className="text-sm">
          Draw a polygon and calculate volume or area to see results
        </p>
      </div>
    );
  }

  const isVolumeResult = 'volume_cubic_meters' in result;
  const isAreaResult = 'area_hectares' in result;

  const formatNumber = (value: number, decimals: number = 2): string => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-100';
    if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const renderVolumeResults = (volumeResult: VolumeResult) => (
    <div className="space-y-4">
      {/* Main Volume Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-900">Net Volume</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {formatNumber(volumeResult.volume_cubic_meters)} m³
          </div>
          <div className="text-sm text-blue-600">
            {(volumeResult.volume_cubic_meters * 1.30795).toFixed(1)} yd³
          </div>
        </div>

        {volumeResult.fill_volume_cubic_meters !== undefined && (
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-900">Fill Volume</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {formatNumber(volumeResult.fill_volume_cubic_meters)} m³
            </div>
            <div className="text-sm text-green-600">Material added</div>
          </div>
        )}

        {volumeResult.cut_volume_cubic_meters !== undefined && (
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-red-600" />
              <span className="font-semibold text-red-900">Cut Volume</span>
            </div>
            <div className="text-2xl font-bold text-red-900">
              {formatNumber(volumeResult.cut_volume_cubic_meters)} m³
            </div>
            <div className="text-sm text-red-600">Material removed</div>
          </div>
        )}
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-gray-700">Area</div>
          <div className="text-lg font-semibold text-gray-900">
            {formatNumber(volumeResult.area_square_meters)} m²
          </div>
          <div className="text-xs text-gray-600">
            {formatNumber(volumeResult.area_square_meters / 10000, 3)} ha
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-gray-700">Avg Height</div>
          <div className="text-lg font-semibold text-gray-900">
            {formatNumber(volumeResult.average_height_meters)} m
          </div>
          <div className="text-xs text-gray-600">
            {formatNumber(volumeResult.average_height_meters * 3.28084, 1)} ft
          </div>
        </div>

        {volumeResult.base_elevation_meters !== undefined && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-gray-700">
              Base Elevation
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {formatNumber(volumeResult.base_elevation_meters)} m
            </div>
            <div className="text-xs text-gray-600">
              {formatNumber(volumeResult.base_elevation_meters * 3.28084, 1)} ft
            </div>
          </div>
        )}

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-gray-700">Confidence</div>
          <div
            className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${getConfidenceColor(
              volumeResult.metadata.confidence_score
            )}`}
          >
            {(volumeResult.metadata.confidence_score * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Elevation Statistics */}
      {volumeResult.elevation_stats && (
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Elevation Statistics
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="text-center">
              <div className="text-xs text-gray-600">Min</div>
              <div className="font-semibold text-blue-600">
                {formatNumber(volumeResult.elevation_stats.min, 1)}m
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600">Max</div>
              <div className="font-semibold text-red-600">
                {formatNumber(volumeResult.elevation_stats.max, 1)}m
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600">Mean</div>
              <div className="font-semibold text-gray-900">
                {formatNumber(volumeResult.elevation_stats.mean, 1)}m
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600">Median</div>
              <div className="font-semibold text-gray-700">
                {formatNumber(volumeResult.elevation_stats.median, 1)}m
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600">Std Dev</div>
              <div className="font-semibold text-purple-600">
                {formatNumber(volumeResult.elevation_stats.std, 1)}m
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAreaResults = (areaResult: AreaResult) => (
    <div className="space-y-4">
      {/* Main Area Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-900">Area (m²)</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {formatNumber(areaResult.area_square_meters)} m²
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-900">Area (ha)</span>
          </div>
          <div className="text-2xl font-bold text-green-900">
            {formatNumber(areaResult.area_hectares, 3)} ha
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-purple-900">Area (acres)</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {formatNumber(areaResult.area_acres, 2)} ac
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-gray-700">Perimeter</div>
          <div className="text-lg font-semibold text-gray-900">
            {formatNumber(areaResult.perimeter_meters)} m
          </div>
          <div className="text-xs text-gray-600">
            {formatNumber(areaResult.perimeter_meters * 3.28084)} ft
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-gray-700">Coordinates</div>
          <div className="text-lg font-semibold text-gray-900">
            {areaResult.metadata.coordinate_count}
          </div>
          <div className="text-xs text-gray-600">polygon vertices</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {result.measurement_name}
          </h3>
          <p className="text-sm text-gray-600">
            {isVolumeResult ? 'Volume Measurement' : 'Area Measurement'} •{' '}
            {formatDate(result.timestamp)}
          </p>
        </div>

        <div className="flex gap-2">
          {onZoomToPolygon && (
            <button
              onClick={onZoomToPolygon}
              className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
            >
              <MapPin className="h-4 w-4" />
              Zoom
            </button>
          )}
          {onExport && (
            <button
              onClick={() => onExport(result)}
              className="px-3 py-1.5 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          )}
        </div>
      </div>

      {/* Results Content */}
      <div className="p-4">
        {isVolumeResult && renderVolumeResults(result as VolumeResult)}
        {isAreaResult && renderAreaResults(result as AreaResult)}
      </div>

      {/* Metadata Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t rounded-b-lg">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Info className="h-3 w-3" />
          <span>Method: {result.metadata.calculation_method}</span>
          <span>•</span>
          <span>
            CRS:{' '}
            {isVolumeResult
              ? (result as VolumeResult).metadata.coordinate_system
              : (result as AreaResult).coordinate_system}
          </span>
          {isVolumeResult && (result as VolumeResult).metadata.dsm_file && (
            <>
              <span>•</span>
              <span>DSM: {(result as VolumeResult).metadata.dsm_file}</span>
            </>
          )}
          {isVolumeResult && (result as VolumeResult).metadata.note && (
            <>
              <span>•</span>
              <span className="text-yellow-600">
                {(result as VolumeResult).metadata.note}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VolumeResultsView;
