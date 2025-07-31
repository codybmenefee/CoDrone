import { useState, useEffect, useRef } from 'react';
import { Plane, Settings, Trash2, RefreshCw, Map } from 'lucide-react';
import { generateSessionId } from '@/lib/utils';
import { chatApi } from '@/lib/api';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import FileUpload from './components/FileUpload';
import TypingIndicator from './components/TypingIndicator';
import MapComponent from './components/MapComponent';
import VolumeResultsView from './components/VolumeResultsView';
import type {
  ChatMessage as ChatMessageType,
  ChatResponse,
  Tool,
  GeoJSONPolygon,
  VolumeResult,
  AreaResult,
  DrawnPolygon,
} from '@/types';

interface MessageWithTools extends ChatMessageType {
  toolCalls?: any[];
}

function App() {
  const [messages, setMessages] = useState<MessageWithTools[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tools, setTools] = useState<Tool[]>([]);
  const [sessionId] = useState(() => generateSessionId());
  const [showMap, setShowMap] = useState(true);
  const [drawnPolygons, setDrawnPolygons] = useState<DrawnPolygon[]>([]);
  const [latestMeasurement, setLatestMeasurement] = useState<VolumeResult | AreaResult | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 });
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check API health and load tools on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if backend is available
        const healthResponse = await fetch('http://localhost:8000/health');
        if (!healthResponse.ok) {
          console.warn('Backend not available');
          return;
        }

        // Load available tools
        const toolsResponse = await chatApi.listTools();
        setTools(toolsResponse);

        // Add welcome message with tools info and map instructions
        const welcomeMessage: MessageWithTools = {
          role: 'assistant',
          content: `Hello! I'm your AI-powered drone data analysis assistant. I can help you with:

**🔧 Available Tools** (${toolsResponse.length} loaded)
${toolsResponse.map(tool => `- **${tool.name.replace(/_/g, ' ')}**: ${tool.description}`).join('\n')}

**🗺️ Interactive Map Features:**
- Draw polygons to define measurement areas
- Calculate volumes from DSM data
- Measure areas with geodesic accuracy
- Real-time elevation analysis
- Natural language commands like "measure the volume of that pile"

**What I can do:**
- Analyze drone imagery and orthomosaics
- Calculate field areas and measurements
- Estimate processing times for different tasks
- Generate report previews
- List available datasets
- Process volume measurements from drawn polygons
- Analyze elevation profiles and statistics

Feel free to draw on the map or ask me anything about your drone data!`,
          timestamp: new Date(),
        };

        setMessages([welcomeMessage]);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // Add error message for user
        const errorMessage: MessageWithTools = {
          role: 'assistant',
          content: '⚠️ Unable to connect to the backend service. Please ensure the API server is running on port 8000.',
          timestamp: new Date(),
        };
        setMessages([errorMessage]);
      }
    };

    initializeApp();
  }, []);

  const handleSendMessage = async (content: string, attachments: string[] = []) => {
    const userMessage: MessageWithTools = {
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Include polygon data in the request if available
      const contextualContent = drawnPolygons.length > 0 
        ? `${content}\n\nContext: I have ${drawnPolygons.length} polygon(s) drawn on the map: ${drawnPolygons.map(p => `${p.name} (${p.area ? Math.round(p.area) + ' m²' : 'no area calculated'})`).join(', ')}`
        : content;

      const response = await chatApi.sendMessage({
        messages: [
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: 'user', content: contextualContent },
        ],
        session_id: sessionId,
        file_attachments: [...uploadedFiles, ...attachments],
      });

      const assistantMessage: MessageWithTools = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        toolCalls: response.tool_calls,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Process tool calls for spatial operations
      if (response.tool_calls && response.tool_calls.length > 0) {
        await processSpatialToolCalls(response.tool_calls);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: MessageWithTools = {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const processSpatialToolCalls = async (toolCalls: any[]) => {
    for (const toolCall of toolCalls) {
      if (toolCall.tool === 'calculate_volume_from_polygon' || 
          toolCall.tool === 'calculate_polygon_area') {
        try {
          const result = JSON.parse(toolCall.output);
          if (result.volume_cubic_meters !== undefined || result.area_square_meters !== undefined) {
            setLatestMeasurement(result);
            
            // Update the corresponding polygon with measurement data
            if (result.coordinates) {
              setDrawnPolygons(prev => prev.map(polygon => {
                // Simple coordinate matching - in production, you'd want more robust matching
                const coordsMatch = JSON.stringify(polygon.polygon.coordinates[0].slice(0, 3)) === 
                                  JSON.stringify(result.coordinates.slice(0, 3));
                if (coordsMatch) {
                  return {
                    ...polygon,
                    area: result.area_square_meters,
                    volume: result.volume_cubic_meters,
                    measurement: result,
                    updatedAt: new Date()
                  };
                }
                return polygon;
              }));
            }
          }
        } catch (error) {
          console.error('Error processing spatial tool call:', error);
        }
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setUploadedFiles(prev => [...prev, result.filepath]);
        
        // Add file upload notification to chat
        const fileMessage: MessageWithTools = {
          role: 'assistant',
          content: `📄 File uploaded successfully: **${result.filename}** (${(result.size / 1024).toFixed(1)} KB)`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, fileMessage]);

        // If it's a DSM or orthomosaic file, offer to use it with the map
        if (file.name.toLowerCase().includes('dsm') || file.name.toLowerCase().includes('ortho')) {
          const suggestionMessage: MessageWithTools = {
            role: 'assistant',
            content: `🗺️ I detected this might be a DSM or orthomosaic file. You can now draw polygons on the map and I'll use this file for volume calculations!`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, suggestionMessage]);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handlePolygonDrawn = (polygon: GeoJSONPolygon) => {
    const newPolygon: DrawnPolygon = {
      id: 'polygon_' + Date.now(),
      polygon,
      name: `Polygon ${drawnPolygons.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setDrawnPolygons(prev => [...prev, newPolygon]);

    // Add a chat message about the new polygon
    const polygonMessage: MessageWithTools = {
      role: 'assistant',
      content: `📐 New polygon drawn! I can now calculate its area or volume. Just ask me something like "calculate the area of that polygon" or "measure the volume using the DSM data".`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, polygonMessage]);
  };

  const handlePolygonEdited = (polygon: GeoJSONPolygon) => {
    // Update the polygon in state and recalculate measurements
    setDrawnPolygons(prev => prev.map(p => {
      // Simple matching - you might want more robust polygon matching
      if (JSON.stringify(p.polygon.coordinates[0].slice(0, 3)) === 
          JSON.stringify(polygon.coordinates[0].slice(0, 3))) {
        return { ...p, polygon, updatedAt: new Date() };
      }
      return p;
    }));
  };

  const handleVolumeCalculated = (result: VolumeResult) => {
    setLatestMeasurement(result);
    
    // Add measurement result to chat
    const resultMessage: MessageWithTools = {
      role: 'assistant',
      content: `📊 **Volume Measurement Complete!**

**${result.measurement_name}**
- **Volume**: ${result.volume_cubic_meters.toFixed(1)} m³
- **Area**: ${result.area_square_meters.toFixed(1)} m²
- **Average Height**: ${result.average_height_meters.toFixed(1)} m
${result.cut_volume_cubic_meters !== undefined ? `- **Cut Volume**: ${result.cut_volume_cubic_meters.toFixed(1)} m³` : ''}
${result.fill_volume_cubic_meters !== undefined ? `- **Fill Volume**: ${result.fill_volume_cubic_meters.toFixed(1)} m³` : ''}

Calculation method: ${result.metadata.calculation_method}
Confidence: ${(result.metadata.confidence_score * 100).toFixed(0)}%`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, resultMessage]);
  };

  const clearChat = () => {
    setMessages([]);
    setLatestMeasurement(null);
  };

  const exportMeasurement = (result: VolumeResult | AreaResult) => {
    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${result.measurement_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  CoDrone - Volume Measurement Tool
                </h1>
                <p className="text-sm text-gray-600">
                  AI-First Drone Data Copilot with Interactive Mapping
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowMap(!showMap)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showMap 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Map className="h-4 w-4 inline mr-1" />
                {showMap ? 'Hide Map' : 'Show Map'}
              </button>
              <button
                onClick={clearChat}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Clear Chat"
              >
                <Trash2 className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`grid gap-8 ${showMap ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 lg:grid-cols-4'}`}>
          {/* Map Section */}
          {showMap && (
            <div className="xl:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Interactive Map
                </h3>
                <MapComponent
                  onPolygonDrawn={handlePolygonDrawn}
                  onPolygonEdited={handlePolygonEdited}
                  onVolumeCalculated={handleVolumeCalculated}
                  center={mapCenter}
                  zoom={13}
                  height="500px"
                  enableDrawing={true}
                  enableEditing={true}
                  showMeasurements={true}
                  initialPolygons={drawnPolygons}
                />
              </div>

              {/* Volume Results */}
              {latestMeasurement && (
                <div className="mt-4">
                  <VolumeResultsView
                    result={latestMeasurement}
                    onExport={exportMeasurement}
                  />
                </div>
              )}
            </div>
          )}

          {/* Chat Section */}
          <div className={showMap ? 'xl:col-span-1' : 'lg:col-span-3'}>
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    message={message}
                    toolCalls={message.toolCalls}
                  />
                ))}

                {isLoading && <TypingIndicator />}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t p-4">
                <ChatInput
                  onSendMessage={handleSendMessage}
                  disabled={isLoading}
                  placeholder={drawnPolygons.length > 0 
                    ? "Ask me to measure the area or volume of your polygon..."
                    : "Draw a polygon on the map or ask me about drone data analysis..."
                  }
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className={showMap ? 'xl:col-span-2 grid xl:grid-cols-2 gap-4' : 'lg:col-span-1'}>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                File Upload
              </h3>
              <FileUpload onFileSelect={handleFileUpload} />
              
              {uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Uploaded Files ({uploadedFiles.length})
                  </h4>
                  <div className="space-y-1">
                    {uploadedFiles.slice(-3).map((filepath, index) => (
                      <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        {filepath.split('/').pop()}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Development Info
                </h4>
                <div className="text-xs text-blue-700 space-y-1">
                  <div>Session: {sessionId}</div>
                  <div>Tools: {tools.length}</div>
                  <div>Messages: {messages.length}</div>
                  <div>Polygons: {drawnPolygons.length}</div>
                  {latestMeasurement && (
                    <div>Last Measurement: {latestMeasurement.measurement_name}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Polygons List */}
            {drawnPolygons.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Drawn Polygons ({drawnPolygons.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {drawnPolygons.map((polygon) => (
                    <div key={polygon.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-sm">{polygon.name}</div>
                      {polygon.area && (
                        <div className="text-xs text-gray-600">
                          Area: {polygon.area < 10000 
                            ? `${polygon.area.toFixed(1)} m²` 
                            : `${(polygon.area / 10000).toFixed(2)} ha`
                          }
                        </div>
                      )}
                      {polygon.volume && (
                        <div className="text-xs text-gray-600">
                          Volume: {polygon.volume.toFixed(1)} m³
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        Created: {polygon.createdAt.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
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
