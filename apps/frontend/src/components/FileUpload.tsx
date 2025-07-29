import React, { useCallback, useState } from 'react'
import { Upload, X, File, Image, FileText } from 'lucide-react'
import { cn, formatFileSize } from '@/lib/utils'
import { chatApi } from '@/lib/api'
import type { FileUpload as FileUploadType } from '@/types'

interface FileUploadProps {
  onFileUploaded: (file: FileUploadType) => void
  className?: string
  disabled?: boolean
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded, className, disabled }) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const getFileIcon = (filename: string) => {
    const ext = filename.toLowerCase().split('.').pop()
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'tif'].includes(ext || '')) {
      return <Image className="h-4 w-4" />
    }
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) {
      return <FileText className="h-4 w-4" />
    }
    return <File className="h-4 w-4" />
  }

  const uploadFile = async (file: File) => {
    try {
      setUploading(true)
      setUploadProgress(0)

      // Simulate progress for demo
      const interval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      const result = await chatApi.uploadFile(file)
      
      clearInterval(interval)
      setUploadProgress(100)
      
      setTimeout(() => {
        onFileUploaded(result)
        setUploading(false)
        setUploadProgress(0)
      }, 500)
      
    } catch (error) {
      console.error('Upload failed:', error)
      setUploading(false)
      setUploadProgress(0)
      // In a real app, show error notification here
    }
  }

  const handleFiles = useCallback(async (files: FileList) => {
    if (disabled || uploading) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 50MB.`)
        continue
      }

      await uploadFile(file)
    }
  }, [disabled, uploading])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }, [handleFiles])

  if (uploading) {
    return (
      <div className={cn("border-2 border-dashed border-primary/50 rounded-lg p-4", className)}>
        <div className="flex items-center space-x-3">
          <Upload className="h-5 w-5 text-primary animate-pulse" />
          <div className="flex-1">
            <div className="text-sm font-medium">Uploading...</div>
            <div className="w-full bg-secondary rounded-full h-2 mt-1">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer",
          isDragOver 
            ? "border-primary bg-primary/5" 
            : "border-border hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && document.getElementById('file-input')?.click()}
      >
        <div className="text-center">
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Images, PDFs, text files (max 50MB)
          </p>
        </div>
      </div>
      
      <input
        id="file-input"
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInput}
        disabled={disabled}
        accept=".jpg,.jpeg,.png,.gif,.bmp,.tiff,.tif,.pdf,.txt,.csv,.json,.geojson,.shp,.kml,.kmz"
      />
    </>
  )
}

export default FileUpload