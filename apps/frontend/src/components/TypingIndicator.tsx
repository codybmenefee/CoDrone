import React from 'react';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  className?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ className }) => {
  return (
    <div className={cn('flex gap-3 p-4', className)}>
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground">
        <Bot className="h-4 w-4" />
      </div>

      {/* Typing Animation */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">Canopy Copilot</span>
          <span className="text-xs text-muted-foreground">is thinking...</span>
        </div>

        <div className="bg-secondary/30 rounded-lg p-3 w-fit">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full typing-dot"></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full typing-dot"></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full typing-dot"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
