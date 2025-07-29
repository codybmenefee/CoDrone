import { useState, useEffect, useRef } from 'react';
import { Plane, Settings, Trash2, RefreshCw } from 'lucide-react';
import { generateSessionId } from '@/lib/utils';
import { chatApi } from '@/lib/api';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import FileUpload from './components/FileUpload';
import TypingIndicator from './components/TypingIndicator';
import type {
  ChatMessage as ChatMessageType,
  ChatResponse,
  Tool,
} from '@/types';

interface MessageWithTools extends ChatMessageType {
  toolCalls?: ChatResponse['tool_calls'];
}

function App() {
  const [messages, setMessages] = useState<MessageWithTools[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tools, setTools] = useState<Tool[]>([]);
  const [sessionId] = useState(() => generateSessionId());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check API health and load tools on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if backend is available
        const healthResponse = await fetch('http://localhost:8000/health');
        if (!healthResponse.ok) {
          console.warn('Backend not available');
          return;
        }

        // Load available tools
        const toolsResponse = await chatApi.listTools();
        setTools(toolsResponse.tools);

        // Add welcome message with tools info
        const welcomeMessage: MessageWithTools = {
          role: 'assistant',
          content: `Hello! I'm your AI-powered drone data analysis assistant. I can help you with:

**🔧 Available Tools** (${toolsResponse.tools.length} loaded)
${toolsResponse.tools.map(tool => `- **${tool.name.replace(/_/g, ' ')}**: ${tool.description}`).join('\n')}

**What I can do:**
- Analyze drone imagery and orthomosaics
- Calculate field areas and measurements
- Estimate processing times for different tasks
- Generate report previews
- List available datasets

Feel free to ask me anything about your drone data!`,
          timestamp: new Date(),
        };

        setMessages([welcomeMessage]);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // Add error message
        const errorMessage: MessageWithTools = {
          role: 'assistant',
          content:
            "Sorry, I'm having trouble connecting to the backend. Please make sure the server is running.",
          timestamp: new Date(),
        };
        setMessages([errorMessage]);
      }
    };

    initializeApp();
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: MessageWithTools = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage(content.trim(), sessionId);

      const assistantMessage: MessageWithTools = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        toolCalls: response.tool_calls,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);

      const errorMessage: MessageWithTools = {
        role: 'assistant',
        content:
          'Sorry, I encountered an error while processing your message. Please try again.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    // For now, just acknowledge the files
    const fileNames = files.map(f => f.name).join(', ');
    const userMessage: MessageWithTools = {
      role: 'user',
      content: `I've uploaded these files: ${fileNames}`,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // In a real implementation, you'd upload the files to the backend
    // and then send a message about them
    const assistantMessage: MessageWithTools = {
      role: 'assistant',
      content: `I see you've uploaded: ${fileNames}. I'm ready to help you analyze these files!`,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const refreshTools = async () => {
    try {
      const toolsResponse = await chatApi.listTools();
      setTools(toolsResponse.tools);
    } catch (error) {
      console.error('Failed to refresh tools:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                <Plane className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  AI Drone Data Assistant
                </h1>
                <p className="text-sm text-gray-500">
                  Powered by LangChain & OpenAI
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-500">Tools: {tools.length}</div>
              <button
                onClick={refreshTools}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Refresh tools"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={clearChat}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Clear chat"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    message={message}
                    toolCalls={message.toolCalls}
                  />
                ))}

                {isLoading && <TypingIndicator />}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t p-4">
                <ChatInput
                  onSendMessage={handleSendMessage}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                File Upload
              </h3>
              <FileUpload onFileSelect={handleFileUpload} />

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Development Info
                </h4>
                <div className="text-xs text-blue-700 space-y-1">
                  <div>Session: {sessionId}</div>
                  <div>Tools: {tools.length}</div>
                  <div>Messages: {messages.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
