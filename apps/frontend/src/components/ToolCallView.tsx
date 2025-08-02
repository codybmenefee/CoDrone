import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  MapPin,
  Ruler,
  BarChart3,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';
import VolumeResultsView from './VolumeResultsView';

interface ToolCall {
  id: string;
  toolName: string;
  parameters: Record<string, unknown>;
  result?: unknown;
  status: 'pending' | 'completed' | 'error';
  timestamp: string;
}

interface ToolCallViewProps {
  toolCall: {
    id: string;
    toolName: string;
    parameters: Record<string, unknown>;
    result?: unknown;
    status: 'pending' | 'completed' | 'error';
    timestamp: string;
  };
  showParameters?: boolean;
  showResult?: boolean;
  className?: string;
}

const ToolCallView: React.FC<ToolCallViewProps> = ({
  toolCall,
  showParameters = true,
  showResult = true,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRawData, setShowRawData] = useState(false);

  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case 'calculateVolumeFromPolygon':
        return <BarChart3 className="h-4 w-4" />;
      case 'calculatePolygonArea':
        return <Ruler className="h-4 w-4" />;
      case 'analyzeElevationProfile':
        return <MapPin className="h-4 w-4" />;
      case 'processImagesWithODM':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: ToolCall['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: ToolCall['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4 animate-pulse" />;
      default:
        return null;
    }
  };

  const formatToolName = (toolName: string) => {
    return toolName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const formatParameterValue = (key: string, value: unknown): string => {
    if (key === 'polygonCoordinates' && typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (parsed.type === 'Polygon') {
          const coordsCount = parsed.coordinates[0]?.length || 0;
          return `Polygon with ${coordsCount} coordinates`;
        }
      } catch {
        return value.substring(0, 50) + '...';
      }
    }

    if (typeof value === 'string' && value.length > 50) {
      return value.substring(0, 50) + '...';
    }

    return String(value);
  };

  const renderResult = () => {
    if (!toolCall.result || toolCall.status !== 'completed') {
      return null;
    }

    const result = toolCall.result as Record<string, unknown>;

    // Handle error results
    if (result.error && typeof result.error === 'string') {
      return (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <div className="text-red-800 font-medium">Error</div>
          <div className="text-red-700 text-sm mt-1">{result.error}</div>
        </div>
      );
    }

    // Special rendering for spatial analysis results
    if (
      toolCall.toolName === 'calculateVolumeFromPolygon' &&
      result.volumeCubicMeters !== undefined
    ) {
      return (
        <VolumeResultsView
          result={result as Record<string, unknown>}
          className="mt-2"
        />
      );
    }

    if (
      toolCall.toolName === 'calculatePolygonArea' &&
      result.areaSquareMeters !== undefined &&
      typeof result.areaSquareMeters === 'number'
    ) {
      return (
        <div className="bg-green-50 border border-green-200 rounded p-3">
          <div className="font-medium text-green-800 mb-2">
            Area Calculation Results
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Area (m²):</span>
              <span className="ml-2 font-medium">
                {result.areaSquareMeters.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Area (hectares):</span>
              <span className="ml-2 font-medium">
                {typeof result.areaHectares === 'number'
                  ? result.areaHectares.toFixed(2)
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Area (acres):</span>
              <span className="ml-2 font-medium">
                {typeof result.areaAcres === 'number'
                  ? result.areaAcres.toFixed(2)
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Perimeter (m):</span>
              <span className="ml-2 font-medium">
                {typeof result.perimeterMeters === 'number'
                  ? result.perimeterMeters.toFixed(2)
                  : 'N/A'}
              </span>
            </div>
          </div>
          {result.measurementName &&
            typeof result.measurementName === 'string' && (
              <div className="mt-2 text-xs text-gray-600">
                Measurement: {result.measurementName}
              </div>
            )}
        </div>
      );
    }

    if (
      toolCall.toolName === 'analyzeElevationProfile' &&
      result.elevationStats &&
      typeof result.elevationStats === 'object' &&
      result.elevationStats !== null
    ) {
      const stats = result.elevationStats as Record<string, unknown>;
      return (
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <div className="font-medium text-blue-800 mb-2">
            Elevation Analysis Results
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Min:</span>
              <span className="ml-2 font-medium">
                {typeof stats.min === 'number' ? stats.min.toFixed(2) : 'N/A'}m
              </span>
            </div>
            <div>
              <span className="text-gray-600">Max:</span>
              <span className="ml-2 font-medium">
                {typeof stats.max === 'number' ? stats.max.toFixed(2) : 'N/A'}m
              </span>
            </div>
            <div>
              <span className="text-gray-600">Mean:</span>
              <span className="ml-2 font-medium">
                {typeof stats.mean === 'number' ? stats.mean.toFixed(2) : 'N/A'}
                m
              </span>
            </div>
            <div>
              <span className="text-gray-600">Median:</span>
              <span className="ml-2 font-medium">
                {typeof stats.median === 'number'
                  ? stats.median.toFixed(2)
                  : 'N/A'}
                m
              </span>
            </div>
            <div>
              <span className="text-gray-600">Std Dev:</span>
              <span className="ml-2 font-medium">
                {typeof stats.std === 'number' ? stats.std.toFixed(2) : 'N/A'}m
              </span>
            </div>
            <div>
              <span className="text-gray-600">Range:</span>
              <span className="ml-2 font-medium">
                {typeof stats.range === 'number'
                  ? stats.range.toFixed(2)
                  : 'N/A'}
                m
              </span>
            </div>
          </div>
        </div>
      );
    }

    // Default result rendering
    return (
      <div className="bg-gray-50 border border-gray-200 rounded p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-800">Result</span>
          <button
            onClick={() => setShowRawData(!showRawData)}
            className="text-xs text-gray-600 hover:text-gray-800"
          >
            {showRawData ? 'Hide' : 'Show'} Raw Data
          </button>
        </div>

        {showRawData ? (
          <pre className="text-xs text-gray-700 overflow-auto max-h-32 bg-white p-2 rounded border">
            {JSON.stringify(result, null, 2)}
          </pre>
        ) : (
          <div className="text-sm text-gray-700">
            {typeof result === 'string'
              ? String(result)
              : 'Tool executed successfully'}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      {/* Tool Header */}
      <div
        className={`flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-50 ${getStatusColor(toolCall.status)}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 flex-1">
          {getToolIcon(toolCall.toolName)}
          {getStatusIcon(toolCall.status)}
          <span className="font-medium">
            {formatToolName(toolCall.toolName)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs opacity-75">
            {new Date(toolCall.timestamp).toLocaleTimeString()}
          </span>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t">
          {/* Parameters */}
          {showParameters && Object.keys(toolCall.parameters).length > 0 && (
            <div className="p-3 border-b bg-gray-50">
              <div className="font-medium text-gray-700 mb-2">Parameters</div>
              <div className="space-y-1 text-sm">
                {Object.entries(toolCall.parameters).map(([key, value]) => (
                  <div key={key} className="flex">
                    <span className="text-gray-600 w-1/3">{key}:</span>
                    <span className="text-gray-800 w-2/3 break-words">
                      {formatParameterValue(key, value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Result */}
          {showResult && <div className="p-3">{renderResult()}</div>}
        </div>
      )}
    </div>
  );
};

export default ToolCallView;
