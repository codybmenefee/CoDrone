/**
 * Spatial Data Types for Drone Analysis
 */

import { Position } from 'geojson';

export interface Polygon {
  type: 'Polygon';
  coordinates: Position[][];
}

export interface VolumeCalculationParams {
  polygonCoordinates: string; // GeoJSON polygon as string
  dsmFilePath: string;
  baseElevation?: number;
  measurementName?: string;
}

export interface VolumeCalculationResult {
  volumeCubicMeters: number;
  cutVolumeCubicMeters: number;
  fillVolumeCubicMeters: number;
  areaSquareMeters: number;
  baseElevationMeters: number;
  averageHeightMeters: number;
  measurementName: string;
  coordinates: Position[];
  timestamp: string;
  elevationStats: ElevationStats;
  metadata: VolumeMetadata;
}

export interface AreaCalculationParams {
  polygonCoordinates: string;
  coordinateSystem?: string;
  measurementName?: string;
}

export interface AreaCalculationResult {
  areaSquareMeters: number;
  areaHectares: number;
  areaAcres: number;
  perimeterMeters: number;
  measurementName: string;
  coordinateSystem: string;
  coordinates: Position[];
  timestamp: string;
  metadata: AreaMetadata;
}

export interface ElevationAnalysisParams {
  polygonCoordinates: string;
  dsmFilePath: string;
  measurementName?: string;
}

export interface ElevationAnalysisResult {
  measurementName: string;
  elevationStats: ElevationStats;
  coordinates: Position[];
  timestamp: string;
  dsmFile: string;
  metadata: ElevationMetadata;
}

export interface ElevationStats {
  min: number;
  max: number;
  mean: number;
  median: number;
  std: number;
  range?: number;
}

export interface VolumeMetadata {
  dsmResolutionX: number;
  dsmResolutionY: number;
  pixelCount: number;
  calculationMethod: string;
  coordinateSystem: string;
  confidenceScore: number;
  dsmFile: string;
}

export interface AreaMetadata {
  calculationMethod: string;
  coordinateCount: number;
  coordinateSystem: string;
  confidenceScore?: number;
}

export interface ElevationMetadata {
  calculationMethod: string;
  coordinateCount: number;
  dsmResolution?: number;
  confidenceScore?: number;
}

export interface SpatialFile {
  filename: string;
  filepath: string;
  type: 'dsm' | 'orthomosaic' | 'pointcloud' | 'image';
  size: number;
  uploadTime: string;
  metadata?: {
    crs?: string;
    bounds?: [number, number, number, number];
    resolution?: number;
  };
}
