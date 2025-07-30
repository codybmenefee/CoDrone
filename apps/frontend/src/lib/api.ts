import axios from 'axios';
import type {
  ChatMessage,
  ChatResponse,
  FileUpload,
  SessionInfo,
  Tool,
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

export const chatApi = {
  sendMessage: async (
    content: string,
    sessionId: string
  ): Promise<ChatResponse> => {
    const request: ChatRequest = {
      messages: [{ role: 'user', content }],
      session_id: sessionId,
    };
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

  listFiles: async (): Promise<{ files: FileUpload[] }> => {
    const response = await api.get('/files');
    return response.data;
  },

  listSessions: async (): Promise<{
    sessions: Record<string, SessionInfo>;
  }> => {
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

  healthCheck: async (): Promise<{
    status: string;
    timestamp: string;
    tools_available: number;
    sessions_active: number;
  }> => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
