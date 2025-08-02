/**
 * API Client for Canopy Copilot Frontend
 *
 * Updated to work with the new Next.js API endpoints
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default configuration
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Types for API responses
export interface FileUploadResponse {
  success: boolean;
  files: Array<{
    filename: string;
    filepath: string;
    safeFilename: string;
    size: number;
    type: 'dsm' | 'orthomosaic' | 'pointcloud' | 'image';
    uploadTime: string;
    metadata: {
      originalName: string;
      mimeType: string;
      extension: string;
    };
  }>;
  totalFiles: number;
  totalSize: number;
}

export interface FileListResponse {
  files: Array<{
    filename: string;
    filepath: string;
    safeFilename: string;
    size: number;
    type: 'dsm' | 'orthomosaic' | 'pointcloud' | 'image';
    uploadTime: string;
    lastModified: string;
    metadata: {
      extension: string;
      isReadable: boolean;
    };
  }>;
  totalFiles: number;
  totalSize: number;
}

export interface VolumeCalculationResult {
  volumeCubicMeters: number;
  cutVolumeCubicMeters: number;
  fillVolumeCubicMeters: number;
  areaSquareMeters: number;
  baseElevationMeters: number;
  averageHeightMeters: number;
  measurementName: string;
  coordinates: number[][];
  timestamp: string;
  elevationStats: {
    min: number;
    max: number;
    mean: number;
    median: number;
    std: number;
    range: number;
  };
  metadata: {
    dsmResolutionX: number;
    dsmResolutionY: number;
    pixelCount: number;
    calculationMethod: string;
    coordinateSystem: string;
    confidenceScore: number;
    dsmFile: string;
  };
}

export interface AreaCalculationResult {
  areaSquareMeters: number;
  areaHectares: number;
  areaAcres: number;
  perimeterMeters: number;
  measurementName: string;
  coordinateSystem: string;
  coordinates: number[][];
  timestamp: string;
  metadata: {
    calculationMethod: string;
    coordinateCount: number;
    coordinateSystem: string;
    confidenceScore: number;
  };
}

export interface SessionListResponse {
  sessions: Array<{
    id: string;
    title: string;
    updatedAt: string;
    messageCount: number;
  }>;
  totalCount: number;
}

// API Functions

/**
 * Upload files to the server
 */
export async function uploadFiles(files: FileList): Promise<FileUploadResponse> {
  const formData = new FormData();

  Array.from(files).forEach(file => {
    formData.append('files', file);
  });

  const response = await api.post<FileUploadResponse>('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

/**
 * Get list of uploaded files
 */
export async function getFiles(): Promise<FileListResponse> {
  const response = await api.get<FileListResponse>('/api/files');
  return response.data;
}

/**
 * Delete a file
 */
export async function deleteFile(filename: string): Promise<{ success: boolean; message: string }> {
  const response = await api.delete(`/api/files?filename=${encodeURIComponent(filename)}`);
  return response.data;
}

/**
 * Calculate volume from polygon coordinates
 */
export async function calculateVolume(params: {
  polygonCoordinates: string;
  dsmFilePath: string;
  baseElevation?: number;
  measurementName?: string;
}): Promise<VolumeCalculationResult> {
  const response = await api.post<VolumeCalculationResult>('/api/spatial/volume', params);
  return response.data;
}

/**
 * Calculate area from polygon coordinates
 */
export async function calculateArea(params: {
  polygonCoordinates: string;
  coordinateSystem?: string;
  measurementName?: string;
}): Promise<AreaCalculationResult> {
  const response = await api.post<AreaCalculationResult>('/api/spatial/area', params);
  return response.data;
}

/**
 * Analyze elevation profile
 */
export async function analyzeElevation(params: {
  polygonCoordinates: string;
  dsmFilePath: string;
  measurementName?: string;
}): Promise<unknown> {
  const response = await api.post('/api/spatial/elevation', params);
  return response.data;
}

/**
 * Get chat sessions
 */
export async function getSessions(limit?: number): Promise<SessionListResponse> {
  const params = limit ? `?limit=${limit}` : '';
  const response = await api.get<SessionListResponse>(`/api/sessions${params}`);
  return response.data;
}

/**
 * Create a new chat session
 */
export async function createSession(title?: string): Promise<{ success: boolean; session: unknown }> {
  const response = await api.post('/api/sessions', { title });
  return response.data;
}

/**
 * Delete a chat session
 */
export async function deleteSession(sessionId: string): Promise<{ success: boolean; message: string }> {
  const response = await api.delete(`/api/sessions?sessionId=${encodeURIComponent(sessionId)}`);
  return response.data;
}

/**
 * Health check
 */
export async function healthCheck(): Promise<{ status: string; timestamp: string }> {
  const response = await api.get('/api/health');
  return response.data;
}

export default api;
