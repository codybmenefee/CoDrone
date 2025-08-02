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

## Task: report-generation

**Description**: Using GrapesJS, implement a visual report builder tool for drone data analysis reports
**Type**: Frontend + Backend
**Complexity**: Complex
**Estimated Time**: 8-12 hours

### 🎯 Task Objective

Implement a comprehensive report building system using GrapesJS that allows users to create professional drone data analysis reports through a visual drag-and-drop interface. The system should integrate with existing AI agent tools and support template-based report generation.

### 📋 Requirements

- [ ] **GrapesJS Integration**: Install and configure GrapesJS in the React frontend
- [ ] **Report Builder Component**: Create a dedicated report editor component with drag-and-drop functionality
- [ ] **Drone-Specific Components**: Build custom GrapesJS components for drone data visualization (maps, charts, analysis results)
- [ ] **Template System**: Implement report templates for common drone analysis types (crop health, volume measurement, area analysis)
- [ ] **AI Integration**: Connect report builder with existing AI agent tools for automated content generation
- [ ] **Export Functionality**: Support PDF export of generated reports
- [ ] **Backend API**: Create FastAPI endpoints for report template management and storage
- [ ] **Tool Integration**: Add new agent tools for report generation and template management

### 🏗️ Implementation Approach

#### Phase 1: GrapesJS Setup & Basic Integration

1. **Install Dependencies**

   ```bash
   # Frontend dependencies
   npm install grapesjs grapesjs-preset-webpage grapesjs-plugin-export
   npm install @types/grapesjs --save-dev
   ```

2. **Create Report Builder Component**

   ```typescript
   // apps/frontend/src/components/ReportBuilder.tsx
   import GrapesJS from 'grapesjs';
   import 'grapesjs/dist/css/grapes.min.css';

   interface ReportBuilderProps {
     templateId?: string;
     onSave?: (html: string, css: string) => void;
   }

   export const ReportBuilder: React.FC<ReportBuilderProps> = ({
     templateId,
     onSave,
   }) => {
     // GrapesJS initialization with custom components
   };
   ```

3. **Custom Drone Components**
   ```typescript
   // apps/frontend/src/components/report/DroneComponents.tsx
   export const droneComponents = {
     'drone-map': {
       // Map component for displaying drone imagery
     },
     'analysis-chart': {
       // Chart component for NDVI, volume data
     },
     'measurement-table': {
       // Table component for area/volume results
     },
   };
   ```

#### Phase 2: Backend API & Tool Integration

1. **Report Management API**

   ```python
   # apps/api-server/report_management.py
   from fastapi import APIRouter, HTTPException
   from pydantic import BaseModel

   router = APIRouter(prefix="/reports", tags=["reports"])

   class ReportTemplate(BaseModel):
       id: str
       name: str
       category: str
       html_template: str
       css_template: str
       components: List[str]
   ```

2. **New Agent Tools**

   ```python
   # packages/agent_tools/report_tools.py
   @tool
   def generate_report_from_template(
       template_id: str,
       data_context: str,
       customizations: Optional[Dict] = None
   ) -> str:
       """Generate a report using a specific template and data context."""

   @tool
   def create_custom_report(
       report_type: str,
       analysis_data: str,
       visualizations: List[str]
   ) -> str:
       """Create a custom report with specified content and visualizations."""
   ```

#### Phase 3: Template System & AI Integration

1. **Pre-built Templates**
   - Crop Health Analysis Report
   - Volume Measurement Report
   - Area Survey Report
   - 3D Model Inspection Report

2. **AI-Powered Content Generation**
   - Auto-populate analysis results
   - Generate executive summaries
   - Create data visualizations
   - Suggest report improvements

### 🔧 Files to Modify

#### Frontend Files

- `apps/frontend/package.json` - Add GrapesJS dependencies
- `apps/frontend/src/components/ReportBuilder.tsx` - Main report builder component
- `apps/frontend/src/components/report/DroneComponents.tsx` - Custom drone-specific components
- `apps/frontend/src/components/report/ReportTemplates.tsx` - Template selection interface
- `apps/frontend/src/components/report/ReportPreview.tsx` - Report preview component
- `apps/frontend/src/lib/reportApi.ts` - API client for report management
- `apps/frontend/src/types/report.ts` - TypeScript definitions for reports

#### Backend Files

- `apps/api-server/main.py` - Add report management routes
- `apps/api-server/report_management.py` - Report API endpoints
- `packages/agent_tools/report_tools.py` - New report generation tools
- `packages/agent_tools/tool_registry.py` - Register new report tools
- `data/templates/` - Directory for report templates

#### Configuration Files

- `apps/frontend/vite.config.ts` - Configure GrapesJS asset handling
- `apps/frontend/tailwind.config.js` - Add report builder styles
- `docker-compose.yml` - Add any new services if needed

### 🧪 Testing Requirements

- [ ] **Unit Tests**
  - [ ] Report builder component rendering
  - [ ] Custom drone components functionality
  - [ ] Template loading and application
  - [ ] Export functionality (HTML/CSS generation)

- [ ] **Integration Tests**
  - [ ] Report API endpoints (CRUD operations)
  - [ ] Agent tool integration with report generation
  - [ ] Template system with AI agent

- [ ] **Manual Testing Steps**
  - [ ] Drag-and-drop component placement
  - [ ] Template selection and customization
  - [ ] AI-powered content generation
  - [ ] PDF export functionality
  - [ ] Report saving and loading

- [ ] **Update Existing Tests**
  - [ ] Update tool registry tests to include new report tools
  - [ ] Add report builder to frontend component tests

### 📚 References

- **GrapesJS Documentation**: https://grapesjs.com/docs/
- **GrapesJS React Integration**: https://github.com/artf/grapesjs-react
- **Custom Components Guide**: https://grapesjs.com/docs/modules/Components.html
- **Export Plugin**: https://github.com/artf/grapesjs-plugin-export
- **Existing Code Patterns**:
  - `apps/frontend/src/components/` - Component structure
  - `packages/agent_tools/` - Tool implementation patterns
  - `apps/api-server/main.py` - API endpoint patterns

### 🎨 Design Considerations

- **Responsive Design**: Ensure report builder works on different screen sizes
- **Accessibility**: Follow WCAG guidelines for the visual editor
- **Performance**: Optimize GrapesJS initialization and component rendering
- **User Experience**: Intuitive drag-and-drop interface with clear visual feedback
- **Integration**: Seamless connection with existing chat interface and AI agent

### 🔄 Workflow Integration

1. **User initiates report creation** through chat interface
2. **AI agent suggests appropriate templates** based on analysis data
3. **User opens report builder** with pre-populated template
4. **AI agent can auto-generate content** based on analysis results
5. **User customizes report** using drag-and-drop interface
6. **Report is saved and can be exported** as PDF or shared

## Constraints & Guidelines

- Maintain existing code patterns and conventions
- Follow established naming conventions
- Add appropriate tests for new functionality
- Update documentation where necessary
- Consider backward compatibility
- Use existing error handling patterns
- Follow the established project structure
- Ensure GrapesJS doesn't conflict with existing React components
- Implement proper TypeScript types for all new components

## Quality Gates

- [ ] Code passes linting (`make lint`)
- [ ] All tests pass (`make test`)
- [ ] Code is properly formatted (`make format`)
- [ ] Documentation is updated
- [ ] No breaking changes to existing APIs
- [ ] GrapesJS integration doesn't break existing UI
- [ ] Report builder is responsive and accessible
- [ ] Export functionality works correctly
- [ ] AI agent integration is functional
- [ ] Template system is working properly
