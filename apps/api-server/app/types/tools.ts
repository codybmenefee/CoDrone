/**
 * Tool Types for Vercel AI SDK Integration
 */

import { z } from 'zod';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: z.ZodSchema;
  execute: (params: Record<string, unknown>) => Promise<unknown>;
  metadata?: {
    category?: string;
    tags?: string[];
    version?: string;
    author?: string;
  };
}

export interface ToolRegistry {
  [toolName: string]: ToolDefinition;
}

export interface ToolExecutionContext {
  sessionId: string;
  userId?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ToolExecutionResult {
  success: boolean;
  result?: unknown;
  error?: string;
  metadata?: {
    executionTime: number;
    toolVersion?: string;
    confidence?: number;
  };
}

export interface ToolCallMetadata {
  startTime: string;
  endTime?: string;
  executionTime?: number;
  memoryUsed?: number;
  success: boolean;
  error?: string;
  retryCount?: number;
}

// Spatial tool parameter schemas
export const VolumeCalculationSchema = z.object({
  polygonCoordinates: z.string().describe('GeoJSON polygon as string'),
  dsmFilePath: z.string().describe('Path to DSM file'),
  baseElevation: z.number().optional().describe('Reference elevation'),
  measurementName: z.string().default('Volume Measurement'),
});

export const AreaCalculationSchema = z.object({
  polygonCoordinates: z.string().describe('GeoJSON polygon as string'),
  coordinateSystem: z
    .string()
    .default('EPSG:4326')
    .describe('Coordinate system'),
  measurementName: z.string().default('Area Measurement'),
});

export const ElevationAnalysisSchema = z.object({
  polygonCoordinates: z.string().describe('GeoJSON polygon as string'),
  dsmFilePath: z.string().describe('Path to DSM file'),
  measurementName: z.string().default('Elevation Analysis'),
});

// File processing schemas
export const FileProcessingSchema = z.object({
  filePaths: z.array(z.string()).describe('Array of file paths to process'),
  processingType: z
    .enum(['orthomosaic', 'dsm', 'pointcloud'])
    .describe('Type of processing'),
  outputPath: z.string().optional().describe('Output directory path'),
  parameters: z
    .record(z.unknown())
    .optional()
    .describe('Additional processing parameters'),
});

export type VolumeCalculationParams = z.infer<typeof VolumeCalculationSchema>;
export type AreaCalculationParams = z.infer<typeof AreaCalculationSchema>;
export type ElevationAnalysisParams = z.infer<typeof ElevationAnalysisSchema>;
export type FileProcessingParams = z.infer<typeof FileProcessingSchema>;
