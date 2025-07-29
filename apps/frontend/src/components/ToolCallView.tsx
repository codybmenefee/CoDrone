import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Tool, Clock, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ToolCall } from '@/types'

interface ToolCallViewProps {
  toolCalls: ToolCall[]
  className?: string
}

interface ToolCallItemProps {
  toolCall: ToolCall
  index: number
}

const ToolCallItem: React.FC<ToolCallItemProps> = ({ toolCall, index }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="border border-border rounded-lg p-3 mb-2 bg-muted/30">
      <div 
        className="flex items-center cursor-pointer hover:bg-muted/50 rounded p-1 -m-1"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2 flex-1">
          <Tool className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">
            {toolCall.tool.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
          <CheckCircle className="h-3 w-3 text-green-600" />
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-3">
          {/* Input Parameters */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Input
            </h4>
            <div className="bg-secondary/50 rounded p-2 text-sm">
              {typeof toolCall.input === 'object' ? (
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(toolCall.input, null, 2)}
                </pre>
              ) : (
                <span>{String(toolCall.input)}</span>
              )}
            </div>
          </div>

          {/* Output */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Output
            </h4>
            <div className="bg-accent/50 rounded p-2 text-sm">
              <pre className="whitespace-pre-wrap font-mono text-xs">
                {toolCall.output}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const ToolCallView: React.FC<ToolCallViewProps> = ({ toolCalls, className }) => {
  if (!toolCalls.length) return null

  return (
    <div className={cn("mt-3", className)}>
      <div className="flex items-center space-x-2 mb-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          Tool Usage ({toolCalls.length})
        </span>
      </div>
      
      <div className="space-y-1">
        {toolCalls.map((toolCall, index) => (
          <ToolCallItem 
            key={`${toolCall.tool}-${index}`} 
            toolCall={toolCall} 
            index={index} 
          />
        ))}
      </div>
    </div>
  )
}

export default ToolCallView