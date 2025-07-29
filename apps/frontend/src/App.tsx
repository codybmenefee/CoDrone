import React, { useState, useEffect, useRef } from 'react'
import { Drone, Settings, Trash2, RefreshCw } from 'lucide-react'
import { cn, generateSessionId } from '@/lib/utils'
import { chatApi } from '@/lib/api'
import ChatMessage from '@/components/ChatMessage'
import ChatInput from '@/components/ChatInput'
import TypingIndicator from '@/components/TypingIndicator'
import type { ChatMessage as ChatMessageType, ChatResponse, Tool } from '@/types'

interface MessageWithTools extends ChatMessageType {
  toolCalls?: ChatResponse['tool_calls']
}

function App() {
  const [messages, setMessages] = useState<MessageWithTools[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState(() => generateSessionId())
  const [tools, setTools] = useState<Tool[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  // Check API health and load tools on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await chatApi.healthCheck()
        setIsConnected(true)
        
        const toolsResponse = await chatApi.listTools()
        setTools(toolsResponse.tools)
        
        // Add welcome message
        setMessages([{
          role: 'assistant',
          content: `# Welcome to Canopy Copilot! 🚁

I'm your AI-powered drone data analysis assistant. I can help you with:

**📊 Data Analysis**
- Analyze drone imagery and orthomosaics
- Generate NDVI and vegetation health reports
- Process survey and inspection data

**📏 Measurements & Calculations**
- Calculate field areas from polygon coordinates
- Estimate processing times for different tasks
- Analyze flight patterns and coverage

**📋 Report Generation**
- Create professional crop health reports
- Generate survey documentation
- Build inspection summaries

**🔧 Available Tools** (${toolsResponse.tools.length} loaded)
${toolsResponse.tools.map(tool => `- **${tool.name.replace(/_/g, ' ')}**: ${tool.description}`).join('\n')}

Try asking me something like:
- "Analyze the orthomosaic from Farm A"
- "Calculate the area of this field: [[lat, lon], [lat, lon], ...]"
- "What datasets are available for analysis?"
- "Generate a crop health report preview"

What would you like to work on today?`,
          timestamp: new Date()
        }])
        
      } catch (error) {
        console.error('Failed to initialize app:', error)
        setIsConnected(false)
        setMessages([{
          role: 'assistant',
          content: '⚠️ **Connection Error**\n\nI\'m having trouble connecting to the backend. Please make sure the API server is running on port 8000.\n\nYou can start it with:\n```bash\ncd apps/api-server\nuvicorn main:app --reload --port 8000\n```',
          timestamp: new Date()
        }])
      }
    }

    initializeApp()
  }, [])

  const handleSendMessage = async (content: string, attachments: string[]) => {
    if (!content.trim() && attachments.length === 0) return

    // Add user message
    const userMessage: MessageWithTools = {
      role: 'user',
      content,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Send to API
      const response = await chatApi.sendMessage({
        messages: [...messages, userMessage],
        session_id: sessionId,
        file_attachments: attachments
      })

      // Add assistant response
      const assistantMessage: MessageWithTools = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date(response.timestamp),
        toolCalls: response.tool_calls
      }

      setMessages(prev => [...prev, assistantMessage])

    } catch (error) {
      console.error('Chat error:', error)
      
      // Add error message
      const errorMessage: MessageWithTools = {
        role: 'assistant',
        content: '❌ **Error**\n\nSorry, I encountered an error processing your request. Please check that the API server is running and try again.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = async () => {
    try {
      await chatApi.clearSession(sessionId)
      setMessages([])
      setSessionId(generateSessionId())
    } catch (error) {
      console.error('Failed to clear session:', error)
    }
  }

  const refreshConnection = async () => {
    try {
      await chatApi.healthCheck()
      setIsConnected(true)
    } catch (error) {
      setIsConnected(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <Drone className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Canopy Copilot</h1>
              <p className="text-sm text-muted-foreground">
                AI Drone Data Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-green-500" : "bg-red-500"
              )} />
              <span className="text-sm text-muted-foreground">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Action Buttons */}
            <button
              onClick={refreshConnection}
              className="p-2 hover:bg-secondary rounded-md transition-colors"
              title="Refresh connection"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <button
              onClick={clearChat}
              className="p-2 hover:bg-secondary rounded-md transition-colors"
              title="Clear chat"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <button className="p-2 hover:bg-secondary rounded-md transition-colors">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin">
          <div className="max-w-4xl mx-auto">
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                message={message}
                toolCalls={message.toolCalls}
                className="border-b border-border/50"
              />
            ))}
            
            {isLoading && (
              <TypingIndicator className="border-b border-border/50" />
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Chat Input */}
      <footer className="flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isLoading || !isConnected}
          />
        </div>
      </footer>

      {/* Debug Info (in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-3 text-xs space-y-1">
          <div>Session: {sessionId.slice(-8)}</div>
          <div>Messages: {messages.length}</div>
          <div>Tools: {tools.length}</div>
          <div className="flex items-center space-x-1">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-green-500" : "bg-red-500"
            )} />
            <span>{isConnected ? 'API Connected' : 'API Disconnected'}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default App