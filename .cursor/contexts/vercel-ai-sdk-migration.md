# Agent Context Template

## Project Context

**Project**: CoDrone - AI-First Drone Data Copilot
**Architecture**: Modular monorepo with FastAPI backend + React frontend
**Current Phase**: Phase 1 (Core AI Agent + Chat UI)
**Migration Target**: LangChain to Vercel AI SDK

## Technical Stack

- **Current Backend**: FastAPI, LangChain, OpenAI, Python 3.11+
- **Target Backend**: Next.js App Router, Vercel AI SDK, TypeScript
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Current Agent**: LangChain with OpenAI Functions
- **Target Agent**: Vercel AI SDK with TypeScript tools
- **Tools**: Decorator-based tool registry → Zod-based tool definitions
- **Storage**: In-memory sessions → Persistent session management

## Code Standards

- **Python**: Black formatting, 88 char line length, type hints
- **TypeScript**: ESLint + Prettier, strict mode, comprehensive types
- **Testing**: pytest for backend, vitest for frontend
- **Documentation**: Docstrings, README updates, migration guides

## Current Architecture

```
apps/
├── api-server/     # FastAPI backend (to be migrated)
├── frontend/       # React frontend (to be enhanced)
packages/
├── agent-tools/    # LangChain tools (to be refactored)
data/
└── storage/        # File uploads
```

## Task: vercel-ai-sdk-migration

**Description**: Complete migration from LangChain to Vercel AI SDK for modernized agentic architecture
**Type**: Full Stack Migration
**Complexity**: Very Complex
**Estimated Time**: 8 weeks (phased approach)

### 🎯 Task Objective

Migrate CoDrone's entire agentic architecture from LangChain to Vercel AI SDK, modernizing the codebase with better TypeScript integration, improved performance, and enhanced developer experience. This is a full replacement, not a subdirectory implementation.

### 📋 Requirements

- [ ] **Backend Framework Migration**: Convert FastAPI + LangChain to Next.js App Router + Vercel AI SDK
- [ ] **Tool System Refactor**: Migrate from LangChain decorators to Vercel AI SDK tool definitions with Zod schemas
- [ ] **Spatial Processing Migration**: Convert Python GDAL bindings to Node.js GDAL or WebAssembly
- [ ] **Chat Components Migration**: Migrate chat interface to useChat hook with enhanced streaming
- [ ] **Core Components Preservation**: Maintain MapComponent, VolumeResultsView, and FileUpload functionality
- [ ] **File Processing Pipeline**: Convert Python ODM integration to Node.js wrapper
- [ ] **Session Management**: Implement persistent session storage with KV store
- [ ] **Real-time Streaming**: Advanced streaming with tool call visualization
- [ ] **Type Safety**: Full TypeScript integration throughout the stack
- [ ] **Error Handling**: Consistent error boundaries and recovery mechanisms
- [ ] **Performance Optimization**: Edge runtime deployment and caching strategies
- [ ] **Spatial Integration**: Preserve interactive map drawing and measurement capabilities

### 🏗️ Implementation Approach

#### Phase 1: Core Infrastructure (Week 1-2)

1. **Next.js App Router Setup**

   ```bash
   # Create new Next.js structure
   mkdir -p apps/api-server/app/{api,lib,types}
   cd apps/api-server
   npm init -y
   npm install next@latest react@latest react-dom@latest
   npm install @ai-sdk/openai @ai-sdk/react ai zod
   ```

2. **New Directory Structure**

   ```typescript
   // apps/api-server/
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

3. **Tool System Migration**

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
     // ... other tools
   };
   ```

#### Phase 2: Spatial Processing Migration (Week 3-4)

1. **GDAL Integration**

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

     async calculateArea(
       polygonData: GeoJSON.Polygon,
       crs: string = 'EPSG:4326'
     ) {
       // Geodesic area calculation
       return {
         areaSquareMeters: 12345.67,
         areaHectares: 1.23,
         areaAcres: 3.05,
       };
     }
   }
   ```

2. **ODM Processing Pipeline**

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

1. **Chat Components Migration**

   ```typescript
   // apps/frontend/src/components/ChatInput.tsx (Enhanced)
   'use client';

   import { useChat } from '@ai-sdk/react';
   import { DefaultChatTransport } from 'ai';
   import { useState } from 'react';

   export function ChatInput({
     onSendMessage,
     disabled,
     hasPolygons,
     onQuickMeasure
   }: ChatInputProps) {
     const { sendMessage, status } = useChat({
       transport: new DefaultChatTransport({
         api: '/api/chat',
       }),
       onToolCall: async ({ toolCall }) => {
         // Handle client-side tool calls for spatial operations
         if (toolCall.toolName === 'calculateVolumeFromPolygon') {
           // Trigger map-based volume calculation
         }
       }
     });

     // Enhanced input with file attachments and spatial context
     return (
       <div className="chat-input-container">
         {/* Existing input UI with Vercel AI SDK integration */}
       </div>
     );
   }
   ```

2. **Preserve Core Components**

   ```typescript
   // apps/frontend/src/components/MapComponent.tsx (Preserve)
   // This component handles interactive map drawing and spatial operations
   // Should remain largely unchanged, only update API calls to new endpoints

   export function MapComponent({
     onPolygonDrawn,
     onPolygonEdited,
     onVolumeCalculated,
     center,
     zoom,
     height,
     enableDrawing,
     enableEditing,
     showMeasurements,
     initialPolygons,
   }: MapComponentProps) {
     // Preserve existing map functionality
     // Update only the API endpoints for spatial calculations
   }

   // apps/frontend/src/components/VolumeResultsView.tsx (Preserve)
   // This component displays measurement results
   // Should remain unchanged, only update export functionality
   ```

3. **Enhanced File Upload with Multi-modal Support**

   ```typescript
   // apps/frontend/src/components/FileUpload.tsx (Enhanced)
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

1. **Real-time Streaming**

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

2. **Session Management**

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

### 📅 Implementation Timeline

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

- [ ] Migrate chat components to useChat hook
- [ ] Preserve and enhance MapComponent functionality
- [ ] Maintain VolumeResultsView and measurement display
- [ ] Enhance FileUpload with multi-modal support
- [ ] Add real-time streaming visualization
- [ ] Integrate tool call UI with spatial operations
- [ ] Update API client for new endpoints

#### Week 7-8: Advanced Features

- [ ] Implement session persistence
- [ ] Add error handling and recovery
- [ ] Optimize performance
- [ ] Comprehensive testing

### 🔧 Files to Modify

#### New Backend Files

- `apps/api-server/next.config.js` - Next.js configuration
- `apps/api-server/package.json` - Dependencies and scripts
- `apps/api-server/app/api/chat/route.ts` - Main chat endpoint
- `apps/api-server/app/api/spatial/volume/route.ts` - Volume calculations
- `apps/api-server/app/api/spatial/area/route.ts` - Area calculations
- `apps/api-server/app/api/spatial/elevation/route.ts` - Elevation analysis
- `apps/api-server/app/api/upload/route.ts` - File upload handling
- `apps/api-server/app/api/tools/route.ts` - Tool discovery endpoint
- `apps/api-server/app/lib/ai-sdk/tools.ts` - Tool definitions
- `apps/api-server/app/lib/ai-sdk/memory.ts` - Session management
- `apps/api-server/app/lib/ai-sdk/spatial.ts` - Spatial processing
- `apps/api-server/app/lib/spatial/gdal-wrapper.ts` - GDAL integration
- `apps/api-server/app/lib/processing/odm-wrapper.ts` - ODM processing
- `apps/api-server/app/lib/utils/file-handling.ts` - File operations
- `apps/api-server/app/lib/utils/validation.ts` - Input validation
- `apps/api-server/app/types/chat.ts` - Chat message types
- `apps/api-server/app/types/spatial.ts` - Spatial data types
- `apps/api-server/app/types/tools.ts` - Tool interface types

#### Frontend Files to Update

**Chat Components (Migrate to Vercel AI SDK)**

- `apps/frontend/package.json` - Add Vercel AI SDK dependencies
- `apps/frontend/src/components/ChatInput.tsx` - Enhanced input handling with useChat
- `apps/frontend/src/components/ChatMessage.tsx` - Tool call visualization
- `apps/frontend/src/components/ToolCallView.tsx` - Enhanced tool call display
- `apps/frontend/src/components/TypingIndicator.tsx` - Streaming indicator updates

**Core Application Components (Preserve & Enhance)**

- `apps/frontend/src/App.tsx` - Main app layout and state management
- `apps/frontend/src/components/MapComponent.tsx` - Interactive map with drawing (preserve)
- `apps/frontend/src/components/VolumeResultsView.tsx` - Results visualization (preserve)
- `apps/frontend/src/components/FileUpload.tsx` - File upload functionality (enhance)

**API & Types (Update for Vercel AI SDK)**

- `apps/frontend/src/lib/api.ts` - Updated API client for new endpoints
- `apps/frontend/src/types/chat.ts` - Enhanced chat types
- `apps/frontend/src/types/tools.ts` - Tool call types
- `apps/frontend/src/types/index.ts` - Spatial and measurement types (preserve)

#### Configuration Files

- `apps/api-server/tsconfig.json` - TypeScript configuration
- `apps/api-server/.eslintrc.js` - ESLint configuration
- `apps/api-server/.prettierrc` - Prettier configuration
- `docker-compose.yml` - Updated services
- `package.json` - Root dependencies
- `pyproject.toml` - Remove LangChain dependencies

#### Files to Remove/Deprecate

- `apps/api-server/main.py` - FastAPI backend (deprecated)
- `apps/api-server/requirements.txt` - Python dependencies (deprecated)
- `packages/agent_tools/spatial_tools.py` - LangChain tools (deprecated)
- `packages/agent_tools/processing_tools.py` - LangChain tools (deprecated)
- `packages/agent_tools/tool_registry.py` - LangChain registry (deprecated)

### 🧪 Testing Requirements

- [ ] **Unit Tests**
  - [ ] Tool function testing with Zod validation
  - [ ] Spatial calculation validation
  - [ ] Session management operations
  - [ ] File upload and processing
  - [ ] Error handling and recovery

- [ ] **Integration Tests**
  - [ ] End-to-end chat flow with tool calls
  - [ ] File upload and ODM processing pipeline
  - [ ] Session persistence across requests
  - [ ] Real-time streaming functionality
  - [ ] Tool discovery and execution

- [ ] **Performance Tests**
  - [ ] Streaming response times (< 100ms latency)
  - [ ] Memory usage optimization
  - [ ] Concurrent user handling
  - [ ] Large file processing performance
  - [ ] Tool execution time (< 5 seconds)

- [ ] **Migration Tests**
  - [ ] Data migration from LangChain sessions
  - [ ] Backward compatibility during transition
  - [ ] Feature flag switching
  - [ ] Rollback procedures

- [ ] **Update Existing Tests**
  - [ ] Convert Python tests to TypeScript
  - [ ] Update frontend component tests
  - [ ] Migrate API endpoint tests
  - [ ] Update tool integration tests

### 📚 References

- **Vercel AI SDK Documentation**: https://sdk.vercel.ai/docs
- **Next.js App Router**: https://nextjs.org/docs/app
- **Zod Schema Validation**: https://zod.dev/
- **Node.js GDAL Options**:
  - gdal-async: https://github.com/mmomtchev/node-gdal-async
  - gdal.js: https://github.com/azavea/gdal.js
- **ODM Node.js Integration**: https://github.com/OpenDroneMap/NodeODM
- **Existing Code Patterns**:
  - `apps/frontend/src/components/` - Component structure
  - `packages/agent_tools/` - Tool implementation patterns (to be migrated)
  - `apps/api-server/main.py` - API endpoint patterns (to be replaced)

### 🎨 Design Considerations

- **Type Safety**: Full TypeScript integration with strict mode
- **Performance**: Edge runtime deployment for global performance
- **Scalability**: Serverless architecture with automatic scaling
- **Developer Experience**: Hot reloading and enhanced debugging
- **Error Handling**: Consistent error boundaries and recovery
- **Streaming**: Real-time response streaming with tool call visualization
- **Session Management**: Persistent storage with KV store
- **File Processing**: Efficient handling of large drone data files
- **Component Preservation**: Maintain existing map, volume, and file upload functionality
- **Spatial Integration**: Preserve interactive map drawing and measurement capabilities
- **Multi-modal Support**: Enhanced file upload with spatial context awareness

### 🔄 Migration Workflow

1. **Parallel Development**: Develop new system alongside existing
2. **Feature Flags**: Implement switching between old and new systems
3. **Gradual Migration**: Migrate users incrementally
4. **Data Migration**: Transfer sessions and file storage
5. **Performance Monitoring**: Track metrics during transition
6. **Full Cutover**: Complete switch to new system
7. **Optimization**: Performance tuning and monitoring

### 🚨 Migration Risks and Mitigation

#### Risk 1: GDAL Compatibility

**Risk:** Node.js GDAL bindings may not be as mature as Python
**Mitigation:**

- Research and test Node.js GDAL options thoroughly
- Consider WebAssembly GDAL as fallback
- Maintain Python GDAL as microservice if needed
- Implement feature flag for GDAL processing

#### Risk 2: ODM Integration

**Risk:** ODM may not have Node.js bindings
**Mitigation:**

- Use child process to call ODM CLI
- Consider cloud-based ODM services
- Implement ODM as separate microservice
- Maintain Python ODM service during transition

#### Risk 3: Data Migration

**Risk:** Existing session data and file storage
**Mitigation:**

- Implement data migration scripts
- Maintain backward compatibility during transition
- Gradual migration with feature flags
- Comprehensive backup and rollback procedures

#### Risk 4: Performance Regression

**Risk:** New system may be slower initially
**Mitigation:**

- Comprehensive performance testing
- Gradual rollout with monitoring
- Performance optimization phase
- Rollback plan if needed

### 📊 Success Metrics

#### Performance Metrics

- Response time < 2 seconds for chat
- Tool execution time < 5 seconds
- 99.9% uptime
- < 100ms streaming latency
- Memory usage < 512MB per request

#### User Experience Metrics

- Tool call success rate > 95%
- File upload success rate > 98%
- User satisfaction score > 4.5/5
- Zero data loss during migration

#### Technical Metrics

- TypeScript coverage > 90%
- Test coverage > 80%
- Zero critical security vulnerabilities
- < 1% error rate in production

## Constraints & Guidelines

- Maintain existing functionality during migration
- Follow established naming conventions
- Add comprehensive tests for new functionality
- Update documentation throughout migration
- Ensure backward compatibility during transition
- Use existing error handling patterns where applicable
- Follow the established project structure
- Implement proper TypeScript types for all components
- Maintain data integrity during migration
- Use feature flags for gradual rollout

## Quality Gates

- [ ] Code passes TypeScript strict mode
- [ ] All tests pass (unit, integration, performance)
- [ ] Code is properly formatted (ESLint + Prettier)
- [ ] Documentation is updated with migration guides
- [ ] No breaking changes to user-facing APIs
- [ ] Performance meets or exceeds current system
- [ ] Error handling is comprehensive and consistent
- [ ] Session management is persistent and reliable
- [ ] File processing pipeline is functional
- [ ] Real-time streaming works correctly
- [ ] Tool system is fully functional
- [ ] Migration can be rolled back if needed
- [ ] Monitoring and alerting are in place
- [ ] Security audit passes
- [ ] Accessibility standards are met
