import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Wrench } from 'lucide-react';

import type { ToolCall } from '@/types';

interface ToolCallViewProps {
  toolCalls: ToolCall[];
  className?: string;
}

interface ToolCallItemProps {
  toolCall: ToolCall;
}

const ToolCallItem: React.FC<ToolCallItemProps> = ({ toolCall }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-primary" />
          <span className="font-medium">
            {toolCall.tool
              .replace(/_/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t bg-gray-50 p-3">
          <div className="space-y-2">
            <div>
              <h4 className="text-sm font-medium text-gray-700">Input:</h4>
              <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                {typeof toolCall.input === 'object' ? (
                  <code>{JSON.stringify(toolCall.input, null, 2)}</code>
                ) : (
                  <span>{String(toolCall.input)}</span>
                )}
              </pre>
            </div>
            {toolCall.output && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Output:</h4>
                <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                  <code>{toolCall.output}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ToolCallView: React.FC<ToolCallViewProps> = ({
  toolCalls,
  className,
}) => {
  if (!toolCalls.length) return null;

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2">
        <Wrench className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-gray-700">
          Tool Usage ({toolCalls.length})
        </span>
      </div>
      <div className="space-y-2">
        {toolCalls.map((toolCall, index) => (
          <ToolCallItem key={`${toolCall.tool}-${index}`} toolCall={toolCall} />
        ))}
      </div>
    </div>
  );
};

export default ToolCallView;
