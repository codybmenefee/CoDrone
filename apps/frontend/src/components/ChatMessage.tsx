import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import ToolCallView from './ToolCallView';
import type { ChatMessage as ChatMessageType, ToolCall } from '@/types';

interface ChatMessageProps {
  message: ChatMessageType;
  toolCalls?: ToolCall[];
  className?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  toolCalls = [],
  className,
}) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-4 p-4 rounded-lg',
        isUser ? 'bg-blue-50' : 'bg-gray-50',
        className
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser ? 'bg-blue-500' : 'bg-gray-600'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Role Label */}
        <div className="text-sm font-medium text-gray-700 mb-2">
          {isUser ? 'You' : 'AI Assistant'}
        </div>

        {/* Message Text */}
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const isInline = !match;

                if (!isInline) {
                  return (
                    <SyntaxHighlighter
                      style={oneDark as any}
                      language={match[1]}
                      PreTag="div"
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  );
                }

                return (
                  <code {...props} className={className}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Tool Calls - only show for assistant messages */}
        {!isUser && toolCalls.length > 0 && (
          <ToolCallView toolCalls={toolCalls} className="mt-3" />
        )}

        {/* Timestamp */}
        {message.timestamp && (
          <div className="text-xs text-gray-500 mt-2">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
