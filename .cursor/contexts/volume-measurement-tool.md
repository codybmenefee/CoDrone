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

Create a comprehensive volume measurement system that allows users to:

1. Draw polygons on an interactive map with orthomosaic imagery
2. Calculate real volumes using DSM data and polygon boundaries
3. Interact through natural language commands
4. View real-time measurement feedback and results
5. Export and save measurement data

The system should integrate seamlessly with the existing CoDrone chat interface, allowing users to draw polygons on aerial imagery and perform volume/area calculations using the existing spatial tools. The component should support real-time measurement feedback and integrate seamlessly with the AI agent for natural language processing of spatial analysis requests.

### 📋 Requirements

- [x] **Interactive Map Component**: Create a React component using Leaflet.js that displays aerial imagery and supports polygon drawing/editing
- [x] **Polygon Drawing Tools**: Implement drawing tools for creating, editing, and deleting polygons with visual feedback
- [x] **Real-time Measurement Display**: Show area and volume calculations in real-time as polygons are drawn/modified
- [x] **Integration with Spatial Tools**: Connect the map component to the existing `calculate_volume_from_polygon` tool in `spatial_tools.py`
- [x] **Natural Language Processing**: Support AI agent commands like "measure the volume of that pile" or "calculate the area of this region"
- [x] **Real volume calculation using GDAL and DSM data processing**
- [x] **Real-time measurement feedback in chat interface**
- [x] **Integration with existing photogrammetry pipeline**
- [x] **Support for multiple coordinate systems and projections**
- [x] **Export functionality for measurement results**
- [x] **Visual feedback for polygon areas and calculated volumes**
- [x] **Error handling for invalid polygons and missing DSM data**
- [ ] **Measurement History**: Store and display measurement history with timestamps and metadata
- [ ] **Export Capabilities**: Allow export of measurements as GeoJSON, CSV, or PDF reports
- [ ] **Responsive Design**: Ensure the map component works well on different screen sizes
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

**Backend Enhancement:**

```python
# Enhanced spatial_tools.py with real GDAL processing
@tool
def calculate_volume_from_polygon(
    polygon_coordinates: str,
    dsm_file_path: str,
    base_elevation: float = None,
    measurement_name: str = "Volume Measurement"
) -> str:
    """Enhanced volume calculation with real GDAL processing"""
    # 1. Parse GeoJSON polygon
    # 2. Load DSM raster data
    # 3. Clip DSM to polygon boundary
    # 4. Calculate volume above/below base elevation
    # 5. Return detailed results with metadata
```

**Frontend Map Component:**

```typescript
// MapComponent.tsx with Leaflet integration
interface MapComponentProps {
  onPolygonDrawn: (polygon: GeoJSON.Polygon) => void;
  onVolumeCalculated: (result: VolumeResult) => void;
  orthomosaicUrl?: string;
}

// Features:
// - Leaflet map with drawing controls
// - Polygon creation and editing
// - Real-time area display
// - Integration with chat for volume requests
```

**Natural Language Processing:**

- Enhanced agent prompts for spatial command recognition
- Command parsing for "measure volume", "calculate area", "analyze that region"
- Coordinate extraction from user descriptions

### 🔧 Files to Modify

- `packages/agent_tools/spatial_tools.py` - Enhanced volume calculations with real GDAL processing
- `apps/frontend/src/components/MapComponent.tsx` - New interactive map component
- `apps/frontend/src/components/VolumeResultsView.tsx` - Volume results visualization
- `apps/frontend/src/components/MeasurementPanel.tsx` - **NEW**: Panel for displaying measurement results and history
- `apps/frontend/src/components/MapControls.tsx` - **NEW**: Custom drawing controls and toolbar
- `apps/frontend/src/types/index.ts` - Add spatial data types and interfaces
- `apps/frontend/src/App.tsx` - Integrate map component with chat interface
- `apps/api-server/main.py` - Add spatial data endpoints for DSM processing
- `packages/agent_tools/tool_registry.py` - Register enhanced spatial tools
- `apps/frontend/package.json` - Add leaflet-draw and additional spatial libraries

### 🧪 Testing Requirements

- [x] **Unit Tests**: Test individual map components, drawing tools, and measurement calculations
- [x] **Integration Tests**: Test map component integration with the chat interface and AI agent
- [x] **API Tests**: Test new backend endpoints for spatial operations and data handling
- [x] **Spatial Tests**: Test polygon validation, area calculations, and volume measurements
- [x] **Performance Tests**: Test map performance with large datasets and complex polygons
- [x] **Unit tests for volume calculation algorithms**
- [x] **Integration tests for GDAL DSM processing**
- [x] **Frontend tests for map component interactions**
- [x] **End-to-end tests for natural language → volume calculation workflow**
- [x] **Performance tests for large DSM datasets**
- [x] **Error handling tests for invalid polygons and missing data**
- [ ] **Manual Testing**: Test polygon drawing, editing, measurement display, and export functionality
- [ ] **Cross-browser Testing**: Ensure compatibility across different browsers and devices

### 📚 References

- **Leaflet.js Documentation**: https://leafletjs.com/reference.html
- **React-Leaflet Documentation**: https://react-leaflet.js.org/
- **Turf.js Documentation**: https://turfjs.org/
- **Leaflet.draw Plugin**: https://github.com/Leaflet/Leaflet.draw
- **GDAL Python Bindings**: https://gdal.org/python/
- **GeoJSON Specification**: https://tools.ietf.org/html/rfc7946
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
- Ensure real-time performance for interactive map operations
- Handle large DSM datasets efficiently
- Provide clear user feedback for measurement operations

## Quality Gates

- [x] Code passes linting (`make lint`)
- [x] All tests pass (`make test`)
- [x] Code is properly formatted (`make format`)
- [x] Documentation is updated
- [x] No breaking changes to existing APIs
- [x] Map component renders correctly with polygon drawing
- [x] Volume calculations return accurate results
- [x] Natural language commands trigger appropriate tool calls
- [x] Error states are handled gracefully
- [x] Performance is acceptable for typical DSM sizes (< 2GB)
- [ ] Map component performs well with large datasets
- [ ] Polygon drawing and editing is smooth and responsive
- [ ] Measurement calculations are accurate and real-time
- [ ] Integration with AI agent works seamlessly
- [ ] Export functionality produces valid data formats
