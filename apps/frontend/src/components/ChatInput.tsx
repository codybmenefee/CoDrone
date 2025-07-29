import React, { useState, useRef } from 'react'
import { Send, Paperclip, X } from 'lucide-react'
import { cn, formatFileSize } from '@/lib/utils'
import FileUpload from './FileUpload'
import type { FileUpload as FileUploadType } from '@/types'

interface ChatInputProps {
  onSendMessage: (message: string, attachments: string[]) => void
  disabled?: boolean
  className?: string
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled, className }) => {
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState<FileUploadType[]>([])
  const [showUpload, setShowUpload] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim() && attachments.length === 0) return
    
    const attachmentPaths = attachments.map(f => f.filepath)
    onSendMessage(message.trim(), attachmentPaths)
    
    setMessage('')
    setAttachments([])
    setShowUpload(false)
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleFileUploaded = (file: FileUploadType) => {
    setAttachments(prev => [...prev, file])
    setShowUpload(false)
  }

  return (
    <div className={cn("border-t border-border bg-background", className)}>
      {/* File Upload Area */}
      {showUpload && (
        <div className="p-4 border-b border-border">
          <FileUpload 
            onFileUploaded={handleFileUploaded}
            disabled={disabled}
          />
        </div>
      )}

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="p-3 border-b border-border">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 bg-secondary rounded px-3 py-1 text-sm"
              >
                <span className="truncate max-w-[200px]">
                  {file.filename}
                </span>
                <span className="text-muted-foreground text-xs">
                  ({formatFileSize(file.size)})
                </span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex gap-2">
          {/* Attachment Button */}
          <button
            type="button"
            onClick={() => setShowUpload(!showUpload)}
            className={cn(
              "flex-shrink-0 p-2 rounded-md border border-border",
              "hover:bg-secondary transition-colors",
              showUpload && "bg-secondary"
            )}
            disabled={disabled}
          >
            <Paperclip className="h-4 w-4" />
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your drone data..."
              className={cn(
                "w-full resize-none rounded-md border border-border",
                "px-3 py-2 text-sm bg-background",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                "placeholder:text-muted-foreground",
                "min-h-[40px] max-h-[200px]"
              )}
              disabled={disabled}
              rows={1}
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={disabled || (!message.trim() && attachments.length === 0)}
            className={cn(
              "flex-shrink-0 p-2 rounded-md",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 text-xs text-muted-foreground">
          Press Enter to send, Shift+Enter for new line
        </div>
      </form>
    </div>
  )
}

export default ChatInput