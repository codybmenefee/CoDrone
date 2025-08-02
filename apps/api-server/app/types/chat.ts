/**
 * Chat Types for Vercel AI SDK Integration
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    toolCalls?: ToolCall[];
    attachments?: string[];
    sessionId?: string;
  };
}

export interface ToolCall {
  id: string;
  toolName: string;
  parameters: Record<string, unknown>;
  result?: unknown;
  status: 'pending' | 'completed' | 'error';
  timestamp: string;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    title?: string;
    tags?: string[];
  };
}

export interface ChatRequest {
  messages: ChatMessage[];
  sessionId?: string;
  attachments?: string[];
  metadata?: Record<string, unknown>;
}

export interface ChatResponse {
  message: ChatMessage;
  toolCalls?: ToolCall[];
  sessionId: string;
  metadata?: {
    modelUsed?: string;
    tokensUsed?: number;
    processingTime?: number;
  };
}

export interface StreamingChatResponse {
  type: 'text' | 'tool_call' | 'tool_result' | 'complete';
  content?: string;
  toolCall?: ToolCall;
  sessionId: string;
  metadata?: Record<string, unknown>;
}
