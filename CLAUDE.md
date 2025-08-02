# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Environment Setup
```bash
# Quick setup (recommended)
./scripts/setup.sh
echo "OPENAI_API_KEY=sk-your-key-here" >> .env
./scripts/start.sh

# Manual setup
make install-dev
cp .env.example .env  # Add your OPENAI_API_KEY
make start
```

### Development Servers
```bash
make start              # Start both frontend and backend
make start-frontend     # React dev server (port 3000)
make start-backend      # FastAPI server (port 8000)
```

### Testing
```bash
make test              # Run all tests with coverage
make test-backend      # Python tests only
make test-frontend     # React tests only
pytest tests/test_spatial_tools.py -v  # Run specific test file
```

### Code Quality
```bash
make quality-check     # Run lint, test, security checks
make lint              # Run all linters (Python + JS)
make format            # Format all code (black, isort, prettier)
make type-check        # TypeScript and mypy checks
```

Commands for individual apps:
- Backend: `cd apps/api-server && npm run lint && npm run type-check`
- Frontend: `cd apps/frontend && npm run lint && npm run type-check`

### Docker Development
```bash
make docker-build && make docker-run
make docker-logs       # View container logs
make docker-stop       # Stop containers
```

## Architecture Overview

**CoDrone** is an AI-first drone data copilot with a modular monorepo structure supporting spatial analysis, chat interface, and report generation.

### High-Level Architecture
```
Frontend (React/Vite) ←→ API Server (FastAPI/Next.js) ←→ LangChain Agent ←→ OpenAI GPT-4
                                    ↓
                              Spatial Tools (Python)
                                    ↓
                              File Storage & Processing
```

### Key Directories
- `apps/frontend/` - React TypeScript app with Vite, chat UI, interactive maps (Leaflet)
- `apps/api-server/` - FastAPI backend with Next.js hybrid architecture
- `packages/` - Shared tooling (agent-tools, chat-ui, report-editor)
- `data/` - File storage, projects, ODM processing data
- `scripts/` - Setup and deployment automation

### Core Components

**Backend (apps/api-server/)**:
- `main.py` - FastAPI server with LangChain agent integration
- `app/api/` - Next.js API routes for chat, file upload, spatial operations
- `app/lib/ai-sdk/` - Vercel AI SDK tools and memory management
- `app/lib/spatial/` - Spatial processing with GDAL

**Frontend (apps/frontend/)**:
- `src/App.tsx` - Main application with chat interface and map integration
- `src/components/` - React components (ChatInput, MapComponent, FileUpload)
- `src/lib/api.ts` - API client for backend communication

**Agent System**:
- LangChain OpenAI Functions Agent with conversation memory
- Tool registry in `packages/agent-tools/`
- Spatial analysis tools: volume calculation, area measurement, elevation analysis
- File upload and processing integration

### Spatial Analysis Pipeline
1. User uploads drone data (DSM, orthomosaic, point clouds) via frontend
2. Files stored in `data/storage/` with type detection
3. User draws polygons on interactive map (Leaflet + Leaflet Draw)
4. AI agent calls spatial tools with polygon coordinates and file paths
5. Python tools use GDAL for geospatial calculations
6. Results returned as JSON and displayed in UI

### Session Management
- Chat sessions with persistent memory via ConversationBufferMemory
- File attachments linked to chat messages
- Tool call results preserved in conversation context

### Testing Strategy
- Backend: pytest with coverage reports (`tests/` directory)
- Frontend: Vitest with React Testing Library
- Integration tests for spatial calculations
- Mock implementations for development (ODM processing)

### Deployment
- Docker Compose for local development
- Makefile targets for production builds
- Environment configuration via `.env` files
- Ready for container orchestration deployment

## Important Notes

- Requires OPENAI_API_KEY environment variable
- Spatial tools require valid GeoJSON polygon coordinates (not placeholder text)
- File uploads limited to 50MB, stored in `data/storage/`
- Frontend runs on port 3000, backend API on port 8000
- Uses OpenAI GPT-4 for agent reasoning and tool selection
