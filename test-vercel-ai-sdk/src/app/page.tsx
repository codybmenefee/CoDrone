'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
import { useState, useRef } from 'react';
import { Send, Bot, User, Clock, CheckCircle, AlertCircle, MapPin, Calculator, Cloud, Shuffle, FileText, Monitor, Loader2 } from 'lucide-react';

// Helper function to get browser information
const getBrowserInfo = () => {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  };
};

// Helper function to get user location
const getUserLocation = (accuracy: 'low' | 'high' = 'low') => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    const options = {
      enableHighAccuracy: accuracy === 'high',
      timeout: 10000,
      maximumAge: accuracy === 'low' ? 600000 : 0 // 10 minutes for low accuracy
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp).toISOString()
        });
      },
      (error) => reject(new Error(`Location error: ${error.message}`)),
      options
    );
  });
};

export default function Chat() {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, addToolResult, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    
    // Automatically send when all tool results are available
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    
    // Handle client-side tools that should be automatically executed
    async onToolCall({ toolCall }) {
      console.log('Tool call received:', toolCall);
      
      try {
        switch (toolCall.toolName) {
          case 'getBrowserInfo':
            // Auto-execute browser info collection
            const browserInfo = getBrowserInfo();
            addToolResult({
              tool: 'getBrowserInfo',
              toolCallId: toolCall.toolCallId,
              output: browserInfo,
            });
            break;
            
          case 'getUserLocation':
            // Auto-execute location request
            try {
              const location = await getUserLocation(toolCall.input.accuracy);
              addToolResult({
                tool: 'getUserLocation',
                toolCallId: toolCall.toolCallId,
                output: location,
              });
            } catch (error) {
              addToolResult({
                tool: 'getUserLocation',
                toolCallId: toolCall.toolCallId,
                output: { error: error.message },
              });
            }
            break;
            
          // Other client-side tools (askForConfirmation, manageFile) 
          // are handled in the UI rendering below
        }
      } catch (error) {
        console.error('Error in onToolCall:', error);
      }
    },
    
    onError: (error) => {
      console.error('Chat error:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && status === 'ready') {
      sendMessage({ text: input });
      setInput('');
    }
  };

  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case 'getWeatherInformation': return <Cloud className="w-4 h-4" />;
      case 'calculate': return <Calculator className="w-4 h-4" />;
      case 'generateRandomData': return <Shuffle className="w-4 h-4" />;
      case 'askForConfirmation': return <AlertCircle className="w-4 h-4" />;
      case 'getUserLocation': return <MapPin className="w-4 h-4" />;
      case 'manageFile': return <FileText className="w-4 h-4" />;
      case 'getBrowserInfo': return <Monitor className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const renderToolPart = (part: any, messageId: string) => {
    const toolName = part.type.replace('tool-', '');
    
    switch (part.type) {
      case 'tool-getWeatherInformation':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-2">
            <div className="flex items-center gap-2 mb-2">
              {getToolIcon('getWeatherInformation')}
              <span className="font-medium text-blue-800">Weather Information</span>
            </div>
            
            {part.state === 'input-streaming' && (
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Getting weather data...</span>
              </div>
            )}
            
            {part.state === 'input-available' && (
              <div className="text-blue-600">
                Fetching weather for {part.input.city}...
              </div>
            )}
            
            {part.state === 'output-available' && (
              <div className="space-y-2">
                <div className="text-blue-800">
                  <strong>{part.output.city}</strong>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600">Weather:</span> {part.output.weather}
                  </div>
                  <div>
                    <span className="text-blue-600">Temperature:</span> {part.output.temperature}
                  </div>
                  <div>
                    <span className="text-blue-600">Humidity:</span> {part.output.humidity}
                  </div>
                  <div>
                    <span className="text-blue-600">Updated:</span> {new Date(part.output.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            )}
            
            {part.state === 'output-error' && (
              <div className="text-red-600">Error: {part.errorText}</div>
            )}
          </div>
        );

      case 'tool-calculate':
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-2">
            <div className="flex items-center gap-2 mb-2">
              {getToolIcon('calculate')}
              <span className="font-medium text-green-800">Calculator</span>
            </div>
            
            {part.state === 'input-available' && (
              <div className="text-green-600">
                Calculating: {part.input.expression}
              </div>
            )}
            
            {part.state === 'output-available' && (
              <div className="space-y-2">
                <div className="text-green-800">
                  <strong>{part.output.expression}</strong> = <strong>{part.output.result}</strong>
                </div>
                {part.output.error && (
                  <div className="text-red-600">{part.output.error}</div>
                )}
              </div>
            )}
          </div>
        );

      case 'tool-generateRandomData':
        return (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 my-2">
            <div className="flex items-center gap-2 mb-2">
              {getToolIcon('generateRandomData')}
              <span className="font-medium text-purple-800">Random Data Generator</span>
            </div>
            
            {part.state === 'output-available' && (
              <div className="space-y-2">
                <div className="text-purple-800">
                  Generated {part.output.count} {part.output.type}(s):
                </div>
                <div className="bg-purple-100 rounded p-2">
                  {part.output.results.map((result: any, index: number) => (
                    <div key={index} className="font-mono text-sm">
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'tool-askForConfirmation':
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-2">
            <div className="flex items-center gap-2 mb-2">
              {getToolIcon('askForConfirmation')}
              <span className="font-medium text-yellow-800">Confirmation Required</span>
            </div>
            
            {part.state === 'input-available' && (
              <div className="space-y-3">
                <div className="text-yellow-800">
                  <div className="font-medium">{part.input.message}</div>
                  <div className="text-sm text-yellow-600 mt-1">
                    Action: {part.input.action}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      addToolResult({
                        tool: 'askForConfirmation',
                        toolCallId: part.toolCallId,
                        output: { confirmed: true, response: 'User confirmed the action' },
                      })
                    }
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    ✓ Confirm
                  </button>
                  <button
                    onClick={() =>
                      addToolResult({
                        tool: 'askForConfirmation',
                        toolCallId: part.toolCallId,
                        output: { confirmed: false, response: 'User declined the action' },
                      })
                    }
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    ✗ Decline
                  </button>
                </div>
              </div>
            )}
            
            {part.state === 'output-available' && (
              <div className="text-yellow-800">
                <strong>Result:</strong> {part.output.response}
              </div>
            )}
          </div>
        );

      case 'tool-getUserLocation':
        return (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 my-2">
            <div className="flex items-center gap-2 mb-2">
              {getToolIcon('getUserLocation')}
              <span className="font-medium text-indigo-800">Location Service</span>
            </div>
            
            {part.state === 'input-available' && (
              <div className="flex items-center gap-2 text-indigo-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Getting your location...</span>
              </div>
            )}
            
            {part.state === 'output-available' && (
              <div className="space-y-2">
                {part.output.error ? (
                  <div className="text-red-600">Error: {part.output.error}</div>
                ) : (
                  <div className="space-y-1 text-sm">
                    <div><strong>Latitude:</strong> {part.output.latitude}</div>
                    <div><strong>Longitude:</strong> {part.output.longitude}</div>
                    <div><strong>Accuracy:</strong> {part.output.accuracy}m</div>
                    <div><strong>Timestamp:</strong> {new Date(part.output.timestamp).toLocaleString()}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'tool-getBrowserInfo':
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-2">
            <div className="flex items-center gap-2 mb-2">
              {getToolIcon('getBrowserInfo')}
              <span className="font-medium text-gray-800">Browser Information</span>
            </div>
            
            {part.state === 'output-available' && (
              <div className="space-y-2 text-sm">
                <div><strong>Platform:</strong> {part.output.platform}</div>
                <div><strong>Language:</strong> {part.output.language}</div>
                <div><strong>Online:</strong> {part.output.onLine ? 'Yes' : 'No'}</div>
                <div><strong>Screen:</strong> {part.output.screen.width}x{part.output.screen.height}</div>
                <div><strong>Viewport:</strong> {part.output.viewport.width}x{part.output.viewport.height}</div>
              </div>
            )}
          </div>
        );

      case 'tool-manageFile':
        return (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 my-2">
            <div className="flex items-center gap-2 mb-2">
              {getToolIcon('manageFile')}
              <span className="font-medium text-orange-800">File Management</span>
            </div>
            
            {part.state === 'input-available' && (
              <div className="space-y-3">
                <div className="text-orange-800">
                  <div>Operation: <strong>{part.input.operation}</strong></div>
                  {part.input.filename && <div>File: {part.input.filename}</div>}
                  {part.input.fileType && <div>Type: {part.input.fileType}</div>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      addToolResult({
                        tool: 'manageFile',
                        toolCallId: part.toolCallId,
                        output: { 
                          success: true, 
                          message: `${part.input.operation} operation completed successfully`,
                          operation: part.input.operation
                        },
                      })
                    }
                    className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
                  >
                    ✓ Execute
                  </button>
                  <button
                    onClick={() =>
                      addToolResult({
                        tool: 'manageFile',
                        toolCallId: part.toolCallId,
                        output: { 
                          success: false, 
                          message: `${part.input.operation} operation was cancelled`,
                          operation: part.input.operation
                        },
                      })
                    }
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {part.state === 'output-available' && (
              <div className="text-orange-800">
                <strong>Result:</strong> {part.output.message}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-2">
            <div className="flex items-center gap-2 mb-2">
              {getToolIcon(toolName)}
              <span className="font-medium text-gray-800">Tool: {toolName}</span>
            </div>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(part, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-2xl font-bold text-gray-800">Vercel AI SDK Test Chat</h1>
        <p className="text-gray-600 text-sm mt-1">
          Testing tool calling with server-side and client-side tools
        </p>
        
        {/* Status indicator */}
        <div className="flex items-center gap-2 mt-2">
          <div className={`w-2 h-2 rounded-full ${
            status === 'ready' ? 'bg-green-500' :
            status === 'streaming' ? 'bg-blue-500' :
            status === 'submitted' ? 'bg-yellow-500' :
            'bg-red-500'
          }`} />
          <span className="text-sm text-gray-500 capitalize">{status}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg">Welcome to the AI SDK Test!</p>
            <p className="text-sm mt-2">Try asking me to:</p>
            <ul className="text-sm mt-2 space-y-1 text-left max-w-md mx-auto">
              <li>• "What's the weather in Paris?"</li>
              <li>• "Calculate 15 * 42 + 7"</li>
              <li>• "Generate 3 random emails"</li>
              <li>• "Get my location"</li>
              <li>• "Show my browser info"</li>
              <li>• "Ask me for confirmation to delete files"</li>
            </ul>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-3xl rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {message.role === 'user' ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Bot className="w-5 h-5" />
                )}
                <span className="font-medium">
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </span>
                {message.metadata?.createdAt && (
                  <span className="text-xs opacity-70">
                    {new Date(message.metadata.createdAt).toLocaleTimeString()}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {message.parts.map((part, index) => {
                  if (part.type === 'text') {
                    return (
                      <div key={index} className="whitespace-pre-wrap">
                        {part.text}
                      </div>
                    );
                  } else if (part.type.startsWith('tool-')) {
                    return (
                      <div key={index}>
                        {renderToolPart(part, message.id)}
                      </div>
                    );
                  } else if (part.type === 'step-start' && index > 0) {
                    return (
                      <div key={index} className="border-t border-gray-300 my-3 pt-3">
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Step {index}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Error display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-700 mt-1">{error.message}</p>
          </div>
        )}
      </div>

      {/* Input form */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything or try the suggested prompts above..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={status !== 'ready'}
          />
          <button
            type="submit"
            disabled={!input.trim() || status !== 'ready'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {status === 'streaming' || status === 'submitted' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
