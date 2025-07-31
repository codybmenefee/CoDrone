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
**Type**: Backend/Frontend
**Complexity**: Complex
**Estimated Time**: 8-12 Hours

### 🎯 Task Objective

Create a comprehensive volume measurement system that allows users to:
1. Draw polygons on an interactive map with orthomosaic imagery
2. Calculate real volumes using DSM data and polygon boundaries
3. Interact through natural language commands
4. View real-time measurement feedback and results
5. Export and save measurement data

### 📋 Requirements

- [x] Interactive map component with Leaflet.js integration
- [x] Polygon drawing and editing capabilities using Leaflet Draw
- [x] Real volume calculation using GDAL and DSM data processing
- [x] Natural language command processing ("measure the volume of that pile")
- [x] Real-time measurement feedback in chat interface
- [x] Integration with existing photogrammetry pipeline
- [x] Support for multiple coordinate systems and projections
- [x] Export functionality for measurement results
- [x] Visual feedback for polygon areas and calculated volumes
- [x] Error handling for invalid polygons and missing DSM data

### 🏗️ Implementation Approach

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
- `apps/frontend/src/types/index.ts` - Add spatial data types and interfaces
- `apps/frontend/src/App.tsx` - Integrate map component with chat interface
- `apps/api-server/main.py` - Add spatial data endpoints for DSM processing
- `packages/agent_tools/tool_registry.py` - Register enhanced spatial tools
- `apps/frontend/package.json` - Add leaflet-draw and additional spatial libraries

### 🧪 Testing Requirements

- [x] Unit tests for volume calculation algorithms
- [x] Integration tests for GDAL DSM processing
- [x] Frontend tests for map component interactions
- [x] End-to-end tests for natural language → volume calculation workflow
- [x] Performance tests for large DSM datasets
- [x] Error handling tests for invalid polygons and missing data

### 📚 References

- [Leaflet.js Documentation](https://leafletjs.com/reference.html) - Map component implementation
- [Leaflet.draw Plugin](https://github.com/Leaflet/Leaflet.draw) - Polygon drawing functionality
- [GDAL Python Bindings](https://gdal.org/python/) - Raster data processing
- [Turf.js](https://turfjs.org/) - Geospatial analysis utilities (already in package.json)
- [GeoJSON Specification](https://tools.ietf.org/html/rfc7946) - Polygon data format

## Constraints & Guidelines

- Maintain existing code patterns and conventions
- Follow established naming conventions
- Add appropriate tests for new functionality
- Update documentation where necessary
- Consider backward compatibility
- Use existing error handling patterns
- Follow the established project structure
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
