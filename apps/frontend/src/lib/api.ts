import axios from 'axios';
import type {
  ChatMessage,
  ChatResponse,
  FileUpload,
  SessionInfo,
  Tool,
  VolumeResult,
  AreaResult,
  ElevationStats,
} from '@/types';

const API_BASE = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export interface ChatRequest {
  messages: ChatMessage[];
  session_id?: string;
  file_attachments?: string[];
}

export interface SpatialCalculationRequest {
  polygon_coordinates: string;
  measurement_name?: string;
}

export interface VolumeCalculationRequest extends SpatialCalculationRequest {
  dsm_file_path: string;
  base_elevation?: number;
}

export interface AreaCalculationRequest extends SpatialCalculationRequest {
  coordinate_system?: string;
}

export interface ElevationAnalysisRequest extends SpatialCalculationRequest {
  dsm_file_path: string;
}

export const chatApi = {
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    const response = await api.post('/chat', request);
    return response.data;
  },

  uploadFile: async (file: File): Promise<FileUpload> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  listFiles: async (): Promise<FileUpload[]> => {
    const response = await api.get('/files');
    return response.data;
  },

  deleteFile: async (filename: string): Promise<{ message: string }> => {
    const response = await api.delete(`/files/${filename}`);
    return response.data;
  },

  listSessions: async (): Promise<Record<string, SessionInfo>> => {
    const response = await api.get('/sessions');
    return response.data;
  },

  clearSession: async (sessionId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/sessions/${sessionId}`);
    return response.data;
  },

  listTools: async (): Promise<Tool[]> => {
    const response = await api.get('/tools');
    return response.data;
  },

  healthCheck: async (): Promise<{ message: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};

export const spatialApi = {
  calculateVolume: async (request: VolumeCalculationRequest): Promise<VolumeResult> => {
    const response = await api.post('/api/spatial/volume', request);
    return response.data;
  },

  calculateArea: async (request: AreaCalculationRequest): Promise<AreaResult> => {
    const response = await api.post('/api/spatial/area', request);
    return response.data;
  },

  analyzeElevation: async (request: ElevationAnalysisRequest): Promise<ElevationStats> => {
    const response = await api.post('/api/spatial/elevation', request);
    return response.data;
  },
};

export default api;
