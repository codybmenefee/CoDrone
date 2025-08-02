import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { User, Bot, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import ToolCallView from './ToolCallView';

interface ToolCall {
  id: string;
  toolName: string;
  parameters: Record<string, unknown>;
  result?: unknown;
  status: 'pending' | 'completed' | 'error';
  timestamp: string;
}

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  toolCalls?: ToolCall[];
  isStreaming?: boolean;
  className?: string;
  metadata?: {
    attachments?: string[];
    sessionId?: string;
    modelUsed?: string;
    tokensUsed?: number;
    processingTime?: number;
  };
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  timestamp,
  toolCalls = [],
  isStreaming = false,
  className = '',
  metadata,
}) => {
  const isUser = role === 'user';
  const isSystem = role === 'system';
  
  const formatTimestamp = (ts?: string) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusIcon = (status: ToolCall['status']) => {
    switch (status) {
      case 'pending':
        return <Loader className="h-3 w-3 animate-spin text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex gap-3 p-4 ${isUser ? 'flex-row-reverse' : ''} ${className}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-blue-500 text-white' 
            : isSystem 
              ? 'bg-gray-500 text-white'
              : 'bg-green-500 text-white'
        }`}>
          {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
        </div>
      </div>

      {/* Message Content */}
      <div className={`flex-1 ${isUser ? 'max-w-[80%]' : ''}`}>
        {/* Message Header */}
        <div className={`flex items-center gap-2 mb-1 ${isUser ? 'justify-end' : ''}`}>
          <span className="text-sm font-medium text-gray-900">
            {isUser ? 'You' : isSystem ? 'System' : 'Assistant'}
          </span>
          {timestamp && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTimestamp(timestamp)}
            </span>
          )}
          {isStreaming && (
            <span className="text-xs text-blue-500 flex items-center gap-1">
              <Loader className="h-3 w-3 animate-spin" />
              Thinking...
            </span>
          )}
        </div>

        {/* File Attachments */}
        {metadata?.attachments && metadata.attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {metadata.attachments.map((filename, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
              >
                📎 {filename}
              </span>
            ))}
          </div>
        )}

        {/* Message Bubble */}
        <div className={`rounded-lg px-4 py-2 ${
          isUser 
            ? 'bg-blue-500 text-white ml-auto' 
            : isSystem
              ? 'bg-gray-100 text-gray-800'
              : 'bg-gray-100 text-gray-800'
        }`}>
          {/* Main Content */}
          <div className="prose prose-sm max-w-none">
            {isUser ? (
              <div className="whitespace-pre-wrap break-words">{content}</div>
            ) : (
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={tomorrow}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            )}
          </div>

          {/* Streaming indicator */}
          {isStreaming && !isUser && (
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Tool Calls */}
        {toolCalls.length > 0 && (
          <div className="mt-3 space-y-2">
            {toolCalls.map((toolCall) => (
              <div key={toolCall.id} className="border rounded-lg p-3 bg-white">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(toolCall.status)}
                  <span className="text-sm font-medium text-gray-700">
                    {toolCall.toolName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(toolCall.timestamp)}
                  </span>
                </div>
                
                <ToolCallView 
                  toolCall={toolCall}
                  showParameters={true}
                  showResult={toolCall.status === 'completed'}
                />
              </div>
            ))}
          </div>
        )}

        {/* Message Metadata */}
        {metadata && (metadata.modelUsed || metadata.tokensUsed || metadata.processingTime) && (
          <div className="mt-2 text-xs text-gray-400 flex items-center gap-3">
            {metadata.modelUsed && (
              <span>Model: {metadata.modelUsed}</span>
            )}
            {metadata.tokensUsed && (
              <span>Tokens: {metadata.tokensUsed}</span>
            )}
            {metadata.processingTime && (
              <span>Time: {metadata.processingTime}ms</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
