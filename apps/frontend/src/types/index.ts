export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
}

export interface ToolCall {
  tool: string
  input: Record<string, any>
  output: string
}

export interface ChatResponse {
  message: string
  tool_calls: ToolCall[]
  session_id: string
  timestamp: Date
}

export interface FileUpload {
  filename: string
  filepath: string
  size: number
  upload_time: Date
}

export interface SessionInfo {
  message_count: number
  last_activity: string
  memory_size: number
}

export interface Tool {
  name: string
  description: string
  parameters: Record<string, any>
}