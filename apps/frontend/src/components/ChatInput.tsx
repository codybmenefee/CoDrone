import React, { useState, useRef } from 'react';
import { Send, FileUp, X } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { nanoid } from 'nanoid';

interface ChatInputProps {
  onSendMessage?: (message: string) => void;
  disabled?: boolean;
  className?: string;
  hasPolygons?: boolean;
  onQuickMeasure?: (type: 'area' | 'volume') => void;
  sessionId?: string;
  onFileSelect?: (files: FileList) => void;
  attachedFiles?: string[];
  onRemoveFile?: (filename: string) => void;
  onNewMessage?: (message: any) => void;
  onToolCall?: (toolCall: any) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  className = '',
  hasPolygons = false,
  onQuickMeasure,
  sessionId,
  onFileSelect,
  attachedFiles = [],
  onRemoveFile,
  onNewMessage,
  onToolCall,
}) => {
  const [message, setMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use Vercel AI SDK's useChat hook
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: aiHandleSubmit,
    isLoading,
    error,
  } = useChat({
    api: '/api/chat',
    initialInput: message,
    body: {
      sessionId: sessionId,
      attachments: attachedFiles,
    },
    onFinish: (message) => {
      // Handle completion
      if (onNewMessage) {
        onNewMessage(message);
      }
    },
    onToolCall: (toolCall) => {
      // Handle tool calls
      if (onToolCall) {
        onToolCall(toolCall);
      }
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || isLoading) return;

    // Create message object with metadata
    const messageObj = {
      id: nanoid(),
      role: 'user' as const,
      content: message.trim(),
      timestamp: new Date().toISOString(),
      metadata: {
        sessionId,
        attachments: attachedFiles,
      },
    };

    // Call legacy handler if provided
    if (onSendMessage) {
      onSendMessage(message.trim());
    }

    // Call new message handler
    if (onNewMessage) {
      onNewMessage(messageObj);
    }

    // Use AI SDK's submit with the current message
    aiHandleSubmit({
      data: {
        sessionId,
        attachments: attachedFiles,
      },
    });

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
    const value = e.target.value;
    setMessage(value);
    handleInputChange(e);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onFileSelect) {
      onFileSelect(e.target.files);
    }
    // Reset input
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && onFileSelect) {
      onFileSelect(e.dataTransfer.files);
    }
  };

  const handleQuickMeasure = (type: 'area' | 'volume') => {
    if (onQuickMeasure) {
      onQuickMeasure(type);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {/* File Attachments */}
      {attachedFiles.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachedFiles.map((filename, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs"
            >
              <span>{filename}</span>
              {onRemoveFile && (
                <button
                  type="button"
                  onClick={() => onRemoveFile(filename)}
                  className="hover:bg-blue-200 rounded p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div 
        className={`flex gap-2 ${isDragOver ? 'bg-blue-50 border-blue-300' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your drone data..."
            className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 min-h-[40px] max-h-[200px]"
            disabled={disabled || isLoading}
            rows={1}
          />
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute right-3 top-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>

        {/* File Upload Button */}
        {onFileSelect && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isLoading}
            className="flex-shrink-0 p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Upload files"
          >
            <FileUp className="h-4 w-4" />
          </button>
        )}

        {/* Send Button */}
        <button
          type="submit"
          disabled={disabled || !message.trim() || isLoading}
          className="flex-shrink-0 p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

      {/* Hidden file input */}
      {onFileSelect && (
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".tif,.tiff,.jpg,.jpeg,.png,.laz,.las,.ply"
          onChange={handleFileChange}
          className="hidden"
        />
      )}

      {/* Error display */}
      {error && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
          Error: {error.message}
        </div>
      )}

      {/* Footer with quick actions */}
      <div className="mt-2 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </div>

        {hasPolygons && onQuickMeasure && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleQuickMeasure('area')}
              disabled={disabled || isLoading}
              className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📐 Quick Area
            </button>
            <button
              type="button"
              onClick={() => handleQuickMeasure('volume')}
              disabled={disabled || isLoading}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📊 Quick Volume
            </button>
          </div>
        )}
      </div>

      {/* Drag and drop indicator */}
      {isDragOver && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-50 bg-opacity-75 flex items-center justify-center rounded-md pointer-events-none">
          <div className="text-blue-600 font-medium">Drop files here to upload</div>
        </div>
      )}
    </form>
  );
};

export default ChatInput;
