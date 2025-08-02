# CoDrone Agentic Architecture Migration Plan

## LangChain to Vercel AI SDK Refactor

### Overview

This document outlines a comprehensive plan to refactor CoDrone's agentic architecture from LangChain to Vercel AI SDK. This is a **full replacement** of the existing agentic framework, not a subdirectory implementation. The migration will modernize the codebase, improve performance, and provide better TypeScript integration.

### Current Architecture Analysis

#### Existing Components

1. **FastAPI Backend** (`apps/api-server/main.py`)
   - LangChain agent with OpenAI Functions
   - Conversation memory management
   - Tool registry integration
   - File upload handling
   - Spatial analysis endpoints

2. **Tool System** (`packages/agent_tools/`)
   - Spatial tools (volume, area, elevation)
   - Processing tools (ODM integration)
   - Simulation tools
   - Tool registry pattern

3. **Frontend Integration**
   - React-based chat interface
   - File upload capabilities
   - Real-time streaming (basic)

#### Current Limitations

- **LangChain Dependency**: Heavy, complex, Python-centric
- **Type Safety**: Limited TypeScript integration
- **Streaming**: Basic implementation
- **Tool Management**: Manual registry pattern
- **Error Handling**: Inconsistent across tools
- **Performance**: Synchronous processing model

### Migration Strategy

#### Phase 1: Core Infrastructure (Week 1-2)

##### 1.1 Backend Framework Migration

**From:** FastAPI + LangChain
**To:** Next.js App Router + Vercel AI SDK

```typescript
// New structure: apps/api-server/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts          # Main chat endpoint
│   │   ├── spatial/
│   │   │   ├── volume/
│   │   │   │   └── route.ts      # Volume calculations
│   │   │   ├── area/
│   │   │   │   └── route.ts      # Area calculations
│   │   │   └── elevation/
│   │   │       └── route.ts      # Elevation analysis
│   │   ├── upload/
│   │   │   └── route.ts          # File upload handling
│   │   └── tools/
│   │       └── route.ts          # Tool discovery
│   ├── lib/
│   │   ├── ai-sdk/
│   │   │   ├── tools.ts          # Tool definitions
│   │   │   ├── memory.ts         # Session management
│   │   │   └── spatial.ts        # Spatial processing
│   │   └── utils/
│   │       ├── file-handling.ts  # File operations
│   │       └── validation.ts     # Input validation
│   └── types/
│       ├── chat.ts               # Chat message types
│       ├── spatial.ts            # Spatial data types
│       └── tools.ts              # Tool interface types
```

##### 1.2 Tool System Refactor

**From:** LangChain tool decorators
**To:** Vercel AI SDK tool definitions

```typescript
// apps/api-server/app/lib/ai-sdk/tools.ts
import { z } from 'zod';
import {
  calculateVolumeFromPolygon,
  calculatePolygonArea,
  analyzeElevationProfile,
} from './spatial';

export const spatialTools = {
  calculateVolumeFromPolygon: {
    description: 'Calculate volume from polygon coordinates and DSM data',
    parameters: z.object({
      polygonCoordinates: z.string().describe('GeoJSON polygon as string'),
      dsmFilePath: z.string().describe('Path to DSM file'),
      baseElevation: z.number().optional().describe('Reference elevation'),
      measurementName: z.string().default('Volume Measurement'),
    }),
    execute: async ({
      polygonCoordinates,
      dsmFilePath,
      baseElevation,
      measurementName,
    }) => {
      return await calculateVolumeFromPolygon(
        polygonCoordinates,
        dsmFilePath,
        baseElevation,
        measurementName
      );
    },
  },

  calculatePolygonArea: {
    description: 'Calculate area of a polygon',
    parameters: z.object({
      polygonCoordinates: z.string().describe('GeoJSON polygon as string'),
      coordinateSystem: z.string().default('EPSG:4326'),
      measurementName: z.string().default('Area Measurement'),
    }),
    execute: async ({
      polygonCoordinates,
      coordinateSystem,
      measurementName,
    }) => {
      return await calculatePolygonArea(
        polygonCoordinates,
        coordinateSystem,
        measurementName
      );
    },
  },

  analyzeElevationProfile: {
    description: 'Analyze elevation profile within polygon',
    parameters: z.object({
      polygonCoordinates: z.string().describe('GeoJSON polygon as string'),
      dsmFilePath: z.string().describe('Path to DSM file'),
      measurementName: z.string().default('Elevation Analysis'),
    }),
    execute: async ({ polygonCoordinates, dsmFilePath, measurementName }) => {
      return await analyzeElevationProfile(
        polygonCoordinates,
        dsmFilePath,
        measurementName
      );
    },
  },
};
```

#### Phase 2: Spatial Processing Migration (Week 3-4)

##### 2.1 GDAL Integration

**From:** Python GDAL bindings
**To:** Node.js GDAL bindings or WebAssembly

```typescript
// apps/api-server/app/lib/spatial/gdal-wrapper.ts
import { gdal } from 'gdal-async'; // or similar Node.js GDAL binding

export class SpatialProcessor {
  async calculateVolume(
    polygonData: GeoJSON.Polygon,
    dsmPath: string,
    baseElevation?: number
  ) {
    // GDAL processing logic
    const dataset = gdal.open(dsmPath);
    // ... volume calculation
    return {
      volumeCubicMeters: 1234.56,
      areaSquareMeters: 567.89,
      statistics: { min: 100, max: 150, mean: 125 },
    };
  }

  async calculateArea(polygonData: GeoJSON.Polygon, crs: string = 'EPSG:4326') {
    // Geodesic area calculation
    return {
      areaSquareMeters: 12345.67,
      areaHectares: 1.23,
      areaAcres: 3.05,
    };
  }
}
```

##### 2.2 File Processing Pipeline

**From:** Python ODM integration
**To:** Node.js ODM wrapper or cloud processing

```typescript
// apps/api-server/app/lib/processing/odm-wrapper.ts
export class ODMProcessor {
  async processImages(imagePaths: string[], outputPath: string) {
    // ODM processing via Node.js child process or cloud API
    const result = await this.runODMCommand(imagePaths, outputPath);
    return {
      orthomosaicPath: `${outputPath}/odm_orthophoto.tif`,
      dsmPath: `${outputPath}/odm_dem.tif`,
      pointCloudPath: `${outputPath}/odm_georeferenced_model.laz`,
    };
  }
}
```

#### Phase 3: Frontend Integration (Week 5-6)

##### 3.1 Chat Interface Migration

**From:** Basic React chat
**To:** Vercel AI SDK useChat hook

```typescript
// apps/frontend/src/components/ChatInterface.tsx
'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';

export function ChatInterface() {
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    onToolCall: async ({ toolCall }) => {
      // Handle client-side tool calls
      if (toolCall.toolName === 'getUserLocation') {
        // Handle location requests
      }
    }
  });

  return (
    <div className="chat-interface">
      {messages.map(message => (
        <ChatMessage key={message.id} message={message} />
      ))}
      <ChatInput onSend={sendMessage} disabled={status !== 'ready'} />
    </div>
  );
}
```

##### 3.2 File Upload Integration

**From:** Basic file upload
**To:** Multi-modal chat with file attachments

```typescript
// apps/frontend/src/components/FileUpload.tsx
export function FileUpload({ onFileSelect }: { onFileSelect: (files: FileList) => void }) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    onFileSelect(e.dataTransfer.files);
  };

  return (
    <div
      className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={() => setDragActive(true)}
      onDragLeave={() => setDragActive(false)}
    >
      <input
        type="file"
        multiple
        accept=".tif,.tiff,.jpg,.jpeg,.png,.laz,.las"
        onChange={(e) => e.target.files && onFileSelect(e.target.files)}
      />
    </div>
  );
}
```

#### Phase 4: Advanced Features (Week 7-8)

##### 4.1 Real-time Streaming

**From:** Basic response streaming
**To:** Advanced streaming with tool call visualization

```typescript
// apps/api-server/app/api/chat/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { spatialTools } from '@/lib/ai-sdk/tools';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages: convertToModelMessages(messages),
    system: `You are an AI-powered drone data analysis assistant with advanced spatial analysis capabilities.

    SPATIAL TOOLS USAGE:
    - calculateVolumeFromPolygon: Calculate volume from polygon and DSM
    - calculatePolygonArea: Calculate area of polygons
    - analyzeElevationProfile: Analyze elevation within polygons

    Always validate polygon coordinates before processing.`,
    tools: spatialTools,
  });

  return result.toUIMessageStreamResponse({
    onError: error => {
      console.error('Chat API Error:', error);
      return process.env.NODE_ENV === 'development'
        ? error.message
        : 'An error occurred while processing your request.';
    },
  });
}
```

##### 4.2 Session Management

**From:** In-memory session storage
**To:** Persistent session management

```typescript
// apps/api-server/app/lib/ai-sdk/memory.ts
import { kv } from '@vercel/kv'; // or your preferred storage

export class SessionManager {
  async getSession(sessionId: string) {
    const session = await kv.get(`session:${sessionId}`);
    return session || { messages: [], metadata: {} };
  }

  async saveSession(sessionId: string, data: any) {
    await kv.set(`session:${sessionId}`, data, { ex: 86400 }); // 24h expiry
  }

  async clearSession(sessionId: string) {
    await kv.del(`session:${sessionId}`);
  }
}
```

### Implementation Timeline

#### Week 1-2: Core Infrastructure

- [ ] Set up Next.js App Router structure
- [ ] Migrate basic chat endpoint
- [ ] Implement tool definition system
- [ ] Set up TypeScript types

#### Week 3-4: Spatial Processing

- [ ] Migrate GDAL processing to Node.js
- [ ] Implement spatial tools with Vercel AI SDK
- [ ] Set up file processing pipeline
- [ ] Test spatial calculations

#### Week 5-6: Frontend Integration

- [ ] Migrate chat interface to useChat hook
- [ ] Implement file upload with multi-modal support
- [ ] Add real-time streaming visualization
- [ ] Integrate tool call UI

#### Week 7-8: Advanced Features

- [ ] Implement session persistence
- [ ] Add error handling and recovery
- [ ] Optimize performance
- [ ] Comprehensive testing

### Technical Benefits

#### Performance Improvements

- **Streaming**: Real-time response streaming with tool call visualization
- **Type Safety**: Full TypeScript integration throughout
- **Error Handling**: Consistent error boundaries and recovery
- **Memory Management**: Efficient session handling

#### Developer Experience

- **Unified Codebase**: Single language (TypeScript) for frontend and backend
- **Modern Tooling**: Next.js 15, Vercel AI SDK v5, latest React patterns
- **Better Debugging**: Enhanced error messages and development tools
- **Hot Reloading**: Faster development cycles

#### Scalability

- **Edge Runtime**: Deploy to Vercel Edge for global performance
- **Serverless**: Automatic scaling based on demand
- **Caching**: Built-in caching strategies
- **Monitoring**: Better observability and metrics

### Migration Risks and Mitigation

#### Risk 1: GDAL Compatibility

**Risk:** Node.js GDAL bindings may not be as mature as Python
**Mitigation:**

- Research and test Node.js GDAL options
- Consider WebAssembly GDAL as fallback
- Maintain Python GDAL as microservice if needed

#### Risk 2: ODM Integration

**Risk:** ODM may not have Node.js bindings
**Mitigation:**

- Use child process to call ODM CLI
- Consider cloud-based ODM services
- Implement ODM as separate microservice

#### Risk 3: Data Migration

**Risk:** Existing session data and file storage
**Mitigation:**

- Implement data migration scripts
- Maintain backward compatibility during transition
- Gradual migration with feature flags

### Testing Strategy

#### Unit Tests

- Tool function testing
- Spatial calculation validation
- Error handling verification

#### Integration Tests

- End-to-end chat flow
- File upload and processing
- Tool call execution

#### Performance Tests

- Streaming response times
- Memory usage optimization
- Concurrent user handling

### Deployment Strategy

#### Phase 1: Parallel Deployment

- Deploy new system alongside existing
- Feature flag to switch between systems
- Gradual user migration

#### Phase 2: Full Migration

- Complete switch to new system
- Monitor performance and errors
- Rollback plan if needed

#### Phase 3: Optimization

- Performance tuning
- Caching implementation
- Monitoring and alerting

### Success Metrics

#### Performance Metrics

- Response time < 2 seconds for chat
- Tool execution time < 5 seconds
- 99.9% uptime
- < 100ms streaming latency

#### User Experience Metrics

- Tool call success rate > 95%
- File upload success rate > 98%
- User satisfaction score > 4.5/5

#### Technical Metrics

- TypeScript coverage > 90%
- Test coverage > 80%
- Zero critical security vulnerabilities

### Conclusion

This migration will modernize CoDrone's agentic architecture, providing:

- Better performance and user experience
- Improved developer productivity
- Enhanced scalability and maintainability
- Future-proof technology stack

The phased approach ensures minimal disruption while delivering significant improvements in functionality and performance.
