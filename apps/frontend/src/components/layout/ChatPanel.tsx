import React from 'react';
import ChatInput from '../ChatInput';
import ChatMessage from '../ChatMessage';
import FileUpload from '../FileUpload';
import VolumeResultsView from '../VolumeResultsView';
import TypingIndicator from '../TypingIndicator';
import type { VolumeResult } from '../../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    toolCalls?: unknown[];
    attachments?: string[];
    sessionId?: string;
  };
}

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  sessionId: string;
  attachedFiles: string[];
  hasPolygons: boolean;
  volumeResults: VolumeResult[];
  onSendMessage: (message: string) => void;
  onNewMessage: (message: ChatMessage) => void;
  onToolCall: (toolCall: unknown) => void;
  onFileSelect: (files: FileList) => void;
  onRemoveFile: (filename: string) => void;
  onQuickMeasure: (type: 'area' | 'volume') => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  isLoading,
  sessionId,
  attachedFiles,
  hasPolygons,
  volumeResults,
  onSendMessage,
  onNewMessage,
  onToolCall,
  onFileSelect,
  onRemoveFile,
  onQuickMeasure,
}) => {
  return (
    <div className="h-full flex flex-col">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {messages.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Welcome to CoDrone!
              </h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Upload drone data, draw polygons on the map, and ask me to analyze them.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1 p-4">
            {messages.map(message => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
                toolCalls={message.metadata?.toolCalls as any[] || []}
                metadata={message.metadata}
              />
            ))}
          </div>
        )}

        {isLoading && (
          <div className="px-4 pb-4">
            <TypingIndicator />
          </div>
        )}
      </div>

      {/* Volume Results */}
      {volumeResults.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Recent Results
            </h3>
            <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-thin">
              {volumeResults.slice(-2).map((result, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                  <VolumeResultsView
                    result={result}
                    showExport={false}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* File Upload Area */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <FileUpload
          onFileSelect={(files: FileList) => onFileSelect(files)}
          className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-4 hover:border-gray-400 transition-colors"
          accept=".tif,.tiff,.jpg,.jpeg,.png,.laz,.las,.ply"
          multiple
        />
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <ChatInput
          onSendMessage={onSendMessage}
          onNewMessage={(message: any) => onNewMessage(message as ChatMessage)}
          onToolCall={onToolCall}
          disabled={isLoading}
          hasPolygons={hasPolygons}
          onQuickMeasure={onQuickMeasure}
          sessionId={sessionId}
          onFileSelect={onFileSelect}
          attachedFiles={attachedFiles}
          onRemoveFile={onRemoveFile}
          className=""
        />
      </div>
    </div>
  );
};

export default ChatPanel;
