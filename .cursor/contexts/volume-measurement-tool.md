# Agent Context Template

## Project Context

**Project**: CoDrone - AI-First Drone Data Copilot
**Architecture**: Modular monorepo with FastAPI backend + React frontend
**Current Phase**: Phase 1 (Core AI Agent + Chat UI)

## Technical Stack

- **Backend**: FastAPI, LangChain, OpenAI, Python 3.11+
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Agent**: LangChain with OpenAI Functions
- **Tools**: Decorator-based tool registry
- **Storage**: In-memory sessions (Redis planned)

## Code Standards

- **Python**: Black formatting, 88 char line length, type hints
- **TypeScript**: ESLint + Prettier, strict mode
- **Testing**: pytest for backend, vitest for frontend
- **Documentation**: Docstrings, README updates

## Current Architecture

```
apps/
├── api-server/     # FastAPI backend
├── frontend/       # React frontend
packages/
├── agent-tools/    # LangChain tools
data/
└── storage/        # File uploads
```

## Task: volume-measurement-tool

**Description**: Implement an interactive map integration tool that allows users to draw polygons on aerial imagery for volume measurement and spatial analysis. The tool should integrate with Leaflet.js, support polygon drawing and editing, calculate areas and volumes from drawn shapes, and provide real-time measurement feedback. It should connect to the existing photogrammetry processing pipeline and support natural language commands like "measure the volume of that pile" or "calculate the area of this region".
**Type**: Frontend/Backend Integration
**Complexity**: Complex
**Estimated Time**: 8-12 hours

### 🎯 Task Objective

Create an interactive map component that integrates with the existing CoDrone chat interface, allowing users to draw polygons on aerial imagery and perform volume/area calculations using the existing spatial tools. The component should support real-time measurement feedback and integrate seamlessly with the AI agent for natural language processing of spatial analysis requests.

### 📋 Requirements

- [ ] **Interactive Map Component**: Create a React component using Leaflet.js that displays aerial imagery and supports polygon drawing/editing
- [ ] **Polygon Drawing Tools**: Implement drawing tools for creating, editing, and deleting polygons with visual feedback
- [ ] **Real-time Measurement Display**: Show area and volume calculations in real-time as polygons are drawn/modified
- [ ] **Integration with Spatial Tools**: Connect the map component to the existing `calculate_volume_from_polygon` tool in `spatial_tools.py`
- [ ] **Natural Language Processing**: Support AI agent commands like "measure the volume of that pile" or "calculate the area of this region"
- [ ] **Measurement History**: Store and display measurement history with timestamps and metadata
- [ ] **Export Capabilities**: Allow export of measurements as GeoJSON, CSV, or PDF reports
- [ ] **Responsive Design**: Ensure the map component works well on different screen sizes
- [ ] **Error Handling**: Implement proper error handling for invalid polygons, missing DSM data, and calculation failures
- [ ] **Performance Optimization**: Optimize for large datasets and smooth polygon editing

### 🏗️ Implementation Approach

#### Frontend Implementation

1. **Create Map Component**: Build a new `InteractiveMap` component using `react-leaflet` and `@turf/turf` for spatial operations
2. **Drawing Tools**: Implement polygon drawing using Leaflet's `L.Draw` plugin with custom controls
3. **Measurement Display**: Create a measurement panel that shows real-time area/volume calculations
4. **Integration**: Add the map component to the main chat interface as a collapsible panel

#### Backend Integration

1. **API Endpoints**: Create new FastAPI endpoints for handling spatial data and measurements
2. **Tool Enhancement**: Enhance the existing `calculate_volume_from_polygon` tool to handle real-time requests
3. **Data Storage**: Implement temporary storage for measurement history and polygon data

#### AI Agent Integration

1. **Natural Language Processing**: Extend the agent to understand spatial commands and trigger map interactions
2. **Tool Coordination**: Coordinate between the map component and spatial analysis tools
3. **Context Management**: Maintain context between chat messages and map state

### 🔧 Files to Modify

- `apps/frontend/src/components/InteractiveMap.tsx` - **NEW**: Main map component with drawing tools and measurement display
- `apps/frontend/src/components/MeasurementPanel.tsx` - **NEW**: Panel for displaying measurement results and history
- `apps/frontend/src/components/MapControls.tsx` - **NEW**: Custom drawing controls and toolbar
- `apps/frontend/src/App.tsx` - **MODIFY**: Add map component integration and state management
- `apps/frontend/src/types/index.ts` - **MODIFY**: Add new types for map data, measurements, and spatial operations
- `apps/frontend/src/lib/api.ts` - **MODIFY**: Add API functions for spatial data handling
- `apps/api-server/main.py` - **MODIFY**: Add new endpoints for spatial operations and measurement storage
- `packages/agent_tools/spatial_tools.py` - **MODIFY**: Enhance existing tools and add new spatial analysis functions
- `apps/frontend/package.json` - **MODIFY**: Add additional dependencies for advanced spatial operations

### 🧪 Testing Requirements

- [ ] **Unit Tests**: Test individual map components, drawing tools, and measurement calculations
- [ ] **Integration Tests**: Test map component integration with the chat interface and AI agent
- [ ] **API Tests**: Test new backend endpoints for spatial operations and data handling
- [ ] **Spatial Tests**: Test polygon validation, area calculations, and volume measurements
- [ ] **Performance Tests**: Test map performance with large datasets and complex polygons
- [ ] **Manual Testing**: Test polygon drawing, editing, measurement display, and export functionality
- [ ] **Cross-browser Testing**: Ensure compatibility across different browsers and devices

### 📚 References

- **Leaflet.js Documentation**: https://leafletjs.com/reference.html
- **React-Leaflet Documentation**: https://react-leaflet.js.org/
- **Turf.js Documentation**: https://turfjs.org/
- **Existing Spatial Tools**: `packages/agent_tools/spatial_tools.py` - Reference existing volume calculation implementation
- **Frontend Patterns**: `apps/frontend/src/components/` - Follow existing component patterns and styling
- **API Patterns**: `apps/api-server/main.py` - Follow existing FastAPI endpoint patterns
- **TypeScript Patterns**: `apps/frontend/src/types/index.ts` - Follow existing type definitions
- **Testing Patterns**: `tests/` - Follow existing pytest and vitest patterns

## Constraints & Guidelines

- Maintain existing code patterns and conventions
- Follow established naming conventions
- Add appropriate tests for new functionality
- Update documentation where necessary
- Consider backward compatibility
- Use existing error handling patterns
- Follow the established project structure
- Ensure the map component integrates seamlessly with the existing chat interface
- Maintain performance standards for real-time polygon editing and calculations
- Follow accessibility guidelines for map interactions

## Quality Gates

- [ ] Code passes linting (`make lint`)
- [ ] All tests pass (`make test`)
- [ ] Code is properly formatted (`make format`)
- [ ] Documentation is updated
- [ ] No breaking changes to existing APIs
- [ ] Map component performs well with large datasets
- [ ] Polygon drawing and editing is smooth and responsive
- [ ] Measurement calculations are accurate and real-time
- [ ] Integration with AI agent works seamlessly
- [ ] Export functionality produces valid data formats
