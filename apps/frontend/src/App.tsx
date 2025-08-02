import React, { useState, useCallback, useEffect } from 'react';
import { nanoid } from 'nanoid';
import ChatInput from './components/ChatInput';
import ChatMessage from './components/ChatMessage';
import MapComponent from './components/MapComponent';
import FileUpload from './components/FileUpload';
import VolumeResultsView from './components/VolumeResultsView';
import TypingIndicator from './components/TypingIndicator';
import { uploadFiles, getFiles, calculateVolume, calculateArea } from './lib/api';
import type { 
  DrawnPolygon, 
  GeoJSONPolygon, 
  MapComponentProps,
  VolumeResult,
  AreaResult 
} from './types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    toolCalls?: any[];
    attachments?: string[];
    sessionId?: string;
  };
}

interface UploadedFile {
  filename: string;
  filepath: string;
  type: 'dsm' | 'orthomosaic' | 'pointcloud' | 'image';
  size: number;
  uploadTime: string;
}

function App() {
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId] = useState(() => nanoid());
  const [isLoading, setIsLoading] = useState(false);

  // Map state
  const [drawnPolygons, setDrawnPolygons] = useState<DrawnPolygon[]>([]);
  const [selectedPolygon, setSelectedPolygon] = useState<string | null>(null);
  const [mapCenter] = useState({ lat: 40.7128, lng: -74.006 });
  const [orthomosaicUrl, setOrthomosaicUrl] = useState<string>();
  const [dsmUrl, setDsmUrl] = useState<string>();

  // File state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);

  // Results state
  const [volumeResults, setVolumeResults] = useState<VolumeResult[]>([]);
  const [areaResults, setAreaResults] = useState<AreaResult[]>([]);

  // Load files on component mount
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const response = await getFiles();
      setUploadedFiles(response.files);
      
      // Auto-set DSM and orthomosaic if available
      const dsm = response.files.find(f => f.type === 'dsm');
      const ortho = response.files.find(f => f.type === 'orthomosaic');
      
      if (dsm) setDsmUrl(dsm.filepath);
      if (ortho) setOrthomosaicUrl(ortho.filepath);
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

  const handleSendMessage = useCallback((content: string) => {
    const userMessage: ChatMessage = {
      id: nanoid(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      metadata: {
        attachments: attachedFiles,
        sessionId,
      },
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
  }, [attachedFiles, sessionId]);

  const handleNewMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => {
      // Check if message already exists to avoid duplicates
      const exists = prev.find(m => m.id === message.id);
      if (exists) return prev;
      return [...prev, message];
    });
    
    if (message.role === 'assistant') {
      setIsLoading(false);
    }
  }, []);

  const handleToolCall = useCallback((toolCall: any) => {
    console.log('Tool call:', toolCall);
    // Tool calls are handled automatically by the Vercel AI SDK
    // Results will be displayed in the ChatMessage component
  }, []);

  const handleFileSelect = async (files: FileList) => {
    try {
      setIsLoading(true);
      const response = await uploadFiles(files);
      
      if (response.success) {
        await loadFiles(); // Reload file list
        
        // Add uploaded files to attachments
        const newAttachments = response.files.map(f => f.safeFilename);
        setAttachedFiles(prev => [...prev, ...newAttachments]);
        
        // Show success message
        const successMessage: ChatMessage = {
          id: nanoid(),
          role: 'system',
          content: `Successfully uploaded ${response.files.length} file(s): ${response.files.map(f => f.filename).join(', ')}`,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, successMessage]);
      }
    } catch (error) {
      console.error('File upload failed:', error);
      const errorMessage: ChatMessage = {
        id: nanoid(),
        role: 'system',
        content: `File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFile = (filename: string) => {
    setAttachedFiles(prev => prev.filter(f => f !== filename));
  };

  const handlePolygonDrawn = useCallback((polygon: DrawnPolygon) => {
    setDrawnPolygons(prev => [...prev, polygon]);
    setSelectedPolygon(polygon.id);
  }, []);

  const handlePolygonEdited = useCallback((polygon: DrawnPolygon) => {
    setDrawnPolygons(prev => 
      prev.map(p => p.id === polygon.id ? polygon : p)
    );
  }, []);

  const handlePolygonDeleted = useCallback((polygonId: string) => {
    setDrawnPolygons(prev => prev.filter(p => p.id !== polygonId));
    if (selectedPolygon === polygonId) {
      setSelectedPolygon(null);
    }
  }, [selectedPolygon]);

  const handleQuickMeasure = async (type: 'area' | 'volume') => {
    if (!selectedPolygon) {
      const message: ChatMessage = {
        id: nanoid(),
        role: 'system',
        content: 'Please draw a polygon on the map first to perform measurements.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, message]);
      return;
    }

    const polygon = drawnPolygons.find(p => p.id === selectedPolygon);
    if (!polygon) return;

    const geoJsonPolygon: GeoJSONPolygon = {
      type: 'Polygon',
      coordinates: [polygon.coordinates],
    };

    try {
      setIsLoading(true);

      if (type === 'area') {
        const result = await calculateArea({
          polygonCoordinates: JSON.stringify(geoJsonPolygon),
          measurementName: `Quick Area - ${new Date().toLocaleTimeString()}`,
        });
        
        setAreaResults(prev => [...prev, result]);
        
        const message: ChatMessage = {
          id: nanoid(),
          role: 'assistant',
          content: `Area calculation completed: ${result.areaSquareMeters.toLocaleString()} m² (${result.areaHectares.toFixed(2)} hectares, ${result.areaAcres.toFixed(2)} acres)`,
          timestamp: new Date().toISOString(),
          metadata: {
            toolCalls: [{
              id: nanoid(),
              toolName: 'calculatePolygonArea',
              parameters: { polygonCoordinates: JSON.stringify(geoJsonPolygon) },
              result,
              status: 'completed' as const,
              timestamp: new Date().toISOString(),
            }],
          },
        };
        setMessages(prev => [...prev, message]);

      } else if (type === 'volume' && dsmUrl) {
        const result = await calculateVolume({
          polygonCoordinates: JSON.stringify(geoJsonPolygon),
          dsmFilePath: dsmUrl,
          measurementName: `Quick Volume - ${new Date().toLocaleTimeString()}`,
        });
        
        setVolumeResults(prev => [...prev, result]);
        
        const message: ChatMessage = {
          id: nanoid(),
          role: 'assistant',
          content: `Volume calculation completed: ${result.volumeCubicMeters.toLocaleString()} m³ over ${result.areaSquareMeters.toLocaleString()} m²`,
          timestamp: new Date().toISOString(),
          metadata: {
            toolCalls: [{
              id: nanoid(),
              toolName: 'calculateVolumeFromPolygon',
              parameters: { 
                polygonCoordinates: JSON.stringify(geoJsonPolygon),
                dsmFilePath: dsmUrl,
              },
              result,
              status: 'completed' as const,
              timestamp: new Date().toISOString(),
            }],
          },
        };
        setMessages(prev => [...prev, message]);
      } else {
        const message: ChatMessage = {
          id: nanoid(),
          role: 'system',
          content: 'Volume calculation requires a DSM file. Please upload a DSM file first.',
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, message]);
      }
    } catch (error) {
      console.error('Measurement failed:', error);
      const message: ChatMessage = {
        id: nanoid(),
        role: 'system',
        content: `Measurement failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, message]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            CoDrone - AI-First Drone Data Copilot
          </h1>
          <p className="text-gray-600">
            Analyze drone data with AI-powered spatial analysis and interactive mapping
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Chat Interface */}
          <div className="space-y-4">
            {/* Chat Messages */}
            <div className="bg-white rounded-lg shadow-sm border h-96 overflow-y-auto">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">AI Assistant</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <p>👋 Welcome to CoDrone!</p>
                    <p className="text-sm mt-1">
                      Upload drone data, draw polygons on the map, and ask me to analyze them.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {messages.map((message) => (
                      <ChatMessage
                        key={message.id}
                        role={message.role}
                        content={message.content}
                        timestamp={message.timestamp}
                        toolCalls={message.metadata?.toolCalls || []}
                        metadata={message.metadata}
                      />
                    ))}
                  </div>
                )}
                
                {isLoading && <TypingIndicator />}
              </div>
            </div>

            {/* Chat Input */}
            <ChatInput
              onSendMessage={handleSendMessage}
              onNewMessage={handleNewMessage}
              onToolCall={handleToolCall}
              disabled={isLoading}
              hasPolygons={drawnPolygons.length > 0}
              onQuickMeasure={handleQuickMeasure}
              sessionId={sessionId}
              onFileSelect={handleFileSelect}
              attachedFiles={attachedFiles}
              onRemoveFile={handleRemoveFile}
              className="bg-white rounded-lg shadow-sm border p-4"
            />

            {/* File Upload */}
            <FileUpload
              onFileSelect={handleFileSelect}
              className="bg-white rounded-lg shadow-sm border p-4"
              accept=".tif,.tiff,.jpg,.jpeg,.png,.laz,.las,.ply"
              multiple
            />
          </div>

          {/* Right Column: Map and Results */}
          <div className="space-y-4">
            {/* Interactive Map */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Interactive Map</h2>
              </div>
              
              <MapComponent
                onPolygonDrawn={handlePolygonDrawn}
                onPolygonEdited={handlePolygonEdited}
                onPolygonDeleted={handlePolygonDeleted}
                initialPolygons={drawnPolygons}
                center={mapCenter}
                zoom={13}
                height="400px"
                enableDrawing={true}
                enableEditing={true}
                showMeasurements={true}
                orthomosaicUrl={orthomosaicUrl}
                dsmUrl={dsmUrl}
              />
            </div>

            {/* Results Display */}
            {volumeResults.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-800">Volume Results</h2>
                </div>
                <div className="p-4 space-y-4">
                  {volumeResults.slice(-3).map((result, index) => (
                    <VolumeResultsView
                      key={index}
                      results={result}
                      showExport={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Uploaded Files ({uploadedFiles.length})
                  </h2>
                </div>
                <div className="p-4">
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                      >
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            file.type === 'dsm' ? 'bg-blue-500' :
                            file.type === 'orthomosaic' ? 'bg-green-500' :
                            file.type === 'pointcloud' ? 'bg-purple-500' :
                            'bg-gray-500'
                          }`}></span>
                          {file.filename}
                        </span>
                        <span className="text-xs text-gray-500">
                          {(file.size / (1024 * 1024)).toFixed(1)} MB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
