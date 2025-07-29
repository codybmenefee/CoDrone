import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { User, Bot } from 'lucide-react'
import { cn, formatTimestamp } from '@/lib/utils'
import ToolCallView from './ToolCallView'
import type { ChatMessage as ChatMessageType, ToolCall } from '@/types'

interface ChatMessageProps {
  message: ChatMessageType
  toolCalls?: ToolCall[]
  className?: string
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, toolCalls = [], className }) => {
  const isUser = message.role === 'user'
  
  return (
    <div className={cn("flex gap-3 p-4", className)}>
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isUser 
          ? "bg-primary text-primary-foreground" 
          : "bg-secondary text-secondary-foreground"
      )}>
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">
            {isUser ? 'You' : 'Canopy Copilot'}
          </span>
          {message.timestamp && (
            <span className="text-xs text-muted-foreground">
              {formatTimestamp(message.timestamp)}
            </span>
          )}
        </div>

        <div className={cn(
          "prose prose-sm max-w-none",
          isUser 
            ? "bg-primary/10 rounded-lg p-3" 
            : "bg-secondary/30 rounded-lg p-3"
        )}>
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-md"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={cn(
                    "px-1 py-0.5 rounded text-sm",
                    "bg-muted text-muted-foreground"
                  )} {...props}>
                    {children}
                  </code>
                )
              },
              p({ children }) {
                return <p className="mb-2 last:mb-0">{children}</p>
              },
              ul({ children }) {
                return <ul className="list-disc list-inside mb-2">{children}</ul>
              },
              ol({ children }) {
                return <ol className="list-decimal list-inside mb-2">{children}</ol>
              },
              blockquote({ children }) {
                return (
                  <blockquote className="border-l-4 border-primary pl-4 italic">
                    {children}
                  </blockquote>
                )
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
      </div>
    </div>
  )
}

export default ChatMessage