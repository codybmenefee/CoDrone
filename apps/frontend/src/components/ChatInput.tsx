import React, { useState, useRef } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  className?: string;
  hasPolygons?: boolean;
  onQuickMeasure?: (type: 'area' | 'volume') => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled,
  className,
  hasPolygons = false,
  onQuickMeasure,
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    onSendMessage(message.trim());
    setMessage('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex gap-2">
        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your drone data..."
            className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 min-h-[40px] max-h-[200px]"
            disabled={disabled}
            rows={1}
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="flex-shrink-0 p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </div>

        {hasPolygons && onQuickMeasure && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onQuickMeasure('area')}
              disabled={disabled}
              className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📐 Quick Area
            </button>
            <button
              type="button"
              onClick={() => onQuickMeasure('volume')}
              disabled={disabled}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📊 Quick Volume
            </button>
          </div>
        )}
      </div>
    </form>
  );
};

export default ChatInput;
