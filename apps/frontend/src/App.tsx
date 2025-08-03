import React, { useState, useCallback, useEffect } from 'react';
import { nanoid } from 'nanoid';
import AppLayout from './components/layout/AppLayout';
import Sidebar from './components/layout/Sidebar';
import ChatPanel from './components/layout/ChatPanel';
import MainContent from './components/layout/MainContent';
import {
  uploadFiles,
  getFiles,
  calculateVolume,
  calculateArea,
} from './lib/api';
import type { DrawnPolygon, GeoJSONPolygon, VolumeResult } from './types';

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
  // const [areaResults, setAreaResults] = useState<AreaResult[]>([]);

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

  const handleSendMessage = useCallback(
    (content: string) => {
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
    },
    [attachedFiles, sessionId]
  );

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

  const handleToolCall = useCallback((toolCall: unknown) => {
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

  // Sync map state with backend
  const syncMapState = async (polygons: DrawnPolygon[], selectedId: string | null) => {
    try {
      await fetch('/api/map/state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          polygons: polygons.map(p => ({
            id: p.id,
            name: p.name || `Polygon ${p.id}`,
            polygon: p.polygon,
            area: p.area || 0
          })),
          selectedPolygon: selectedId,
        }),
      });
    } catch (error) {
      console.error('Failed to sync map state:', error);
    }
  };

  const handlePolygonDrawn = useCallback((polygon: DrawnPolygon) => {
    setDrawnPolygons(prev => {
      const updated = [...prev, polygon];
      // Sync with backend
      syncMapState(updated, polygon.id);
      return updated;
    });
    setSelectedPolygon(polygon.id);
  }, []);

  const handlePolygonEdited = useCallback((polygon: DrawnPolygon) => {
    setDrawnPolygons(prev => {
      const updated = prev.map(p => (p.id === polygon.id ? polygon : p));
      // Sync with backend
      syncMapState(updated, selectedPolygon);
      return updated;
    });
  }, [selectedPolygon]);

  const handlePolygonDeleted = useCallback(
    (polygonId: string) => {
      setDrawnPolygons(prev => {
        const updated = prev.filter(p => p.id !== polygonId);
        const newSelectedId = selectedPolygon === polygonId ? null : selectedPolygon;
        // Sync with backend
        syncMapState(updated, newSelectedId);
        return updated;
      });
      if (selectedPolygon === polygonId) {
        setSelectedPolygon(null);
      }
    },
    [selectedPolygon]
  );

  const handleQuickMeasure = async (type: 'area' | 'volume') => {
    if (!selectedPolygon) {
      const message: ChatMessage = {
        id: nanoid(),
        role: 'system',
        content:
          'Please draw a polygon on the map first to perform measurements.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, message]);
      return;
    }

    const polygon = drawnPolygons.find(p => p.id === selectedPolygon);
    if (!polygon) return;

    const geoJsonPolygon: GeoJSONPolygon = {
      type: 'Polygon',
      coordinates: polygon.polygon.coordinates,
    };

    try {
      setIsLoading(true);

      if (type === 'area') {
        const result = await calculateArea({
          polygonCoordinates: JSON.stringify(geoJsonPolygon),
        });

        // setAreaResults(prev => [...prev, result]);

        const message: ChatMessage = {
          id: nanoid(),
          role: 'system',
          content: `Area calculation completed: ${result.area_square_meters.toFixed(2)} square meters`,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, message]);
      } else if (type === 'volume') {
        const dsmFile = uploadedFiles.find(f => f.type === 'dsm');
        if (!dsmFile) {
          throw new Error('DSM file required for volume calculation');
        }

        const result = await calculateVolume({
          polygonCoordinates: JSON.stringify(geoJsonPolygon),
          dsmFilePath: dsmFile.filepath,
        });

        setVolumeResults(prev => [...prev, result as VolumeResult]);

        const message: ChatMessage = {
          id: nanoid(),
          role: 'system',
          content: `Volume calculation completed: ${result.volume_cubic_meters.toFixed(2)} cubic meters`,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, message]);
      }
    } catch (error) {
      console.error('Measurement failed:', error);
      const errorMessage: ChatMessage = {
        id: nanoid(),
        role: 'system',
        content: `Measurement failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout
      sidebar={
        <Sidebar
          uploadedFiles={uploadedFiles}
          volumeResults={volumeResults}
        />
      }
      main={
        <MainContent
          drawnPolygons={drawnPolygons}
          onPolygonDrawn={handlePolygonDrawn}
          onPolygonEdited={handlePolygonEdited}
          onPolygonDeleted={handlePolygonDeleted}
          mapCenter={mapCenter}
          orthomosaicUrl={orthomosaicUrl}
          dsmUrl={dsmUrl}
        />
      }
      chat={
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          sessionId={sessionId}
          attachedFiles={attachedFiles}
          hasPolygons={drawnPolygons.length > 0}
          volumeResults={volumeResults}
          onSendMessage={handleSendMessage}
          onNewMessage={handleNewMessage}
          onToolCall={handleToolCall}
          onFileSelect={handleFileSelect}
          onRemoveFile={handleRemoveFile}
          onQuickMeasure={handleQuickMeasure}
        />
      }
    />
  );
}

export default App;
