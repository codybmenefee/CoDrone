export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface ToolCall {
  tool: string;
  input: Record<string, unknown>;
  output: string;
}

export interface ChatResponse {
  message: string;
  tool_calls: ToolCall[];
  session_id: string;
  timestamp: Date;
}

export interface FileUpload {
  filename: string;
  filepath: string;
  size: number;
  upload_time: Date;
}

export interface SessionInfo {
  message_count: number;
  last_activity: string;
  memory_size: number;
}

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

// Spatial data types
export interface Coordinate {
  lat: number;
  lng: number;
}

export interface GeoJSONCoordinate extends Array<number> {
  0: number; // longitude
  1: number; // latitude
  2?: number; // elevation (optional)
}

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: GeoJSONCoordinate[][];
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: GeoJSONPolygon;
  properties: {
    name?: string;
    description?: string;
    [key: string]: unknown;
  };
}

// Volume measurement types
export interface VolumeResult {
  volume_cubic_meters: number;
  cut_volume_cubic_meters?: number;
  fill_volume_cubic_meters?: number;
  area_square_meters: number;
  base_elevation_meters?: number;
  average_height_meters: number;
  measurement_name: string;
  coordinates: GeoJSONCoordinate[];
  timestamp: string;
  elevation_stats?: ElevationStats;
  metadata: VolumeMetadata;
}

export interface ElevationStats {
  min: number;
  max: number;
  mean: number;
  std: number;
  median: number;
  min_elevation?: number;
  max_elevation?: number;
  mean_elevation?: number;
  std_elevation?: number;
  median_elevation?: number;
  elevation_range?: number;
}

export interface VolumeMetadata {
  dsm_resolution_x?: number;
  dsm_resolution_y?: number;
  pixel_count?: number;
  calculation_method: string;
  coordinate_system: string;
  confidence_score: number;
  dsm_file?: string;
  note?: string;
}

// Area measurement types
export interface AreaResult {
  area_square_meters: number;
  area_hectares: number;
  area_acres: number;
  measurement_name: string;
  coordinate_system: string;
  coordinates: GeoJSONCoordinate[];
  timestamp: string;
  perimeter_meters: number;
  metadata: {
    calculation_method: string;
    coordinate_count: number;
  };
}

// Map component types
export interface MapComponentProps {
  onPolygonDrawn?: (polygon: GeoJSONPolygon) => void;
  onPolygonEdited?: (polygon: GeoJSONPolygon) => void;
  onPolygonDeleted?: (polygon: GeoJSONPolygon) => void;
  onVolumeCalculated?: (result: VolumeResult) => void;
  orthomosaicUrl?: string;
  dsmUrl?: string;
  initialPolygons?: DrawnPolygon[];
  center?: Coordinate;
  zoom?: number;
  height?: string;
  enableDrawing?: boolean;
  enableEditing?: boolean;
  showMeasurements?: boolean;
}

export interface DrawnPolygon {
  id: string;
  polygon: GeoJSONPolygon;
  name: string;
  color?: string;
  area?: number;
  volume?: number;
  createdAt: Date;
  updatedAt: Date;
  measurement?: VolumeResult | AreaResult;
}

// Map interaction types
export interface MapInteraction {
  type:
    | 'polygon_drawn'
    | 'polygon_edited'
    | 'polygon_deleted'
    | 'measurement_requested';
  polygon?: GeoJSONPolygon;
  polygonId?: string;
  timestamp: Date;
  user_command?: string;
}

export interface MeasurementRequest {
  polygon: GeoJSONPolygon;
  measurement_type: 'volume' | 'area' | 'elevation';
  dsm_file?: string;
  base_elevation?: number;
  measurement_name?: string;
}

// Map layer types
export interface MapLayer {
  id: string;
  name: string;
  type: 'orthomosaic' | 'dsm' | 'vector' | 'raster';
  url: string;
  visible: boolean;
  opacity: number;
  bounds?: [[number, number], [number, number]]; // [sw, ne]
}

// Spatial analysis types
export interface SpatialAnalysis {
  id: string;
  name: string;
  type: 'volume' | 'area' | 'elevation' | 'change_detection';
  polygon: GeoJSONPolygon;
  result: VolumeResult | AreaResult | ElevationStats;
  created_at: string;
  updated_at: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error_message?: string;
}

// Natural language command types
export interface SpatialCommand {
  original_text: string;
  command_type:
    | 'measure_volume'
    | 'calculate_area'
    | 'analyze_elevation'
    | 'draw_polygon';
  polygon?: GeoJSONPolygon;
  polygon_id?: string;
  parameters: {
    measurement_name?: string;
    base_elevation?: number;
    dsm_file?: string;
    coordinate_system?: string;
  };
  confidence: number;
}

// Export utility types for map interactions
export type MapEventHandler = (event: MapInteraction) => void;
export type MeasurementHandler = (request: MeasurementRequest) => void;
export type PolygonHandler = (polygon: GeoJSONPolygon) => void;
