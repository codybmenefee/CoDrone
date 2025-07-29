# Canopy Copilot - AI-First Drone Data Copilot

A modular, AI-first drone data copilot that can handle rich interactions, automate drone workflows, and provide clean chat UX with AI reasoning and multi-modal input.

## 🏗️ Architecture

```
canopy-copilot/
├── apps/
│   ├── frontend/             # React + Chat UI
│   └── api-server/           # FastAPI + LangChain backend
├── packages/
│   ├── agent-tools/          # Tool registry for LangChain
│   ├── report-editor/        # Future GrapesJS wrapper
│   └── chat-ui/              # Chat UI components
├── data/
│   └── storage/              # Temporary file uploads
├── scripts/
├── docker-compose.yml
└── README.md
```

## 🚀 Features

- ✅ **Rich Chat Interface**: Multi-modal chat with file uploads
- ✅ **AI Agent**: LangChain-powered agent with tool calling
- ✅ **Memory & History**: Persistent conversation memory
- ✅ **Tool Visualization**: Show AI reasoning and tool usage
- 🔜 **Background Jobs**: Async drone data processing
- 🔜 **Report Building**: GrapesJS-based report editor
- 🔜 **Spatial Tools**: Map drawing and polygon analysis

## 🛠️ Tech Stack

- **Backend**: FastAPI, LangChain, OpenAI
- **Frontend**: React, TypeScript
- **Agent**: LangChain with OpenAI Functions
- **Memory**: ConversationBufferMemory (Redis planned)
- **Files**: Multi-modal upload support

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- OpenAI API key

### Setup

**Option 1: Quick Setup (Recommended)**
```bash
# 1. Run setup script
./scripts/setup.sh

# 2. Add your OpenAI API key to .env
echo "OPENAI_API_KEY=sk-your-key-here" >> .env

# 3. Start everything
./scripts/start.sh
```

**Option 2: Manual Setup**
```bash
# 1. Install dependencies
cd apps/api-server && pip install -r requirements.txt && cd ../..
cd apps/frontend && npm install && cd ../..

# 2. Environment setup
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# 3. Start servers
./scripts/start.sh
```

**Option 3: Docker (Coming Soon)**
```bash
# Add OPENAI_API_KEY to .env first
docker-compose up
```

### 🚀 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000  
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 📁 Phase 1 Implementation ✅

**Complete working demo with:**
- [x] Modular project structure (`apps/`, `packages/`, `data/`)
- [x] FastAPI backend with LangChain agent integration
- [x] 5 demo tools for drone data analysis
- [x] File upload support (multi-modal input)
- [x] Conversation memory with session management
- [x] Modern React chat UI with tool visualization
- [x] Docker development setup
- [x] Setup and startup scripts

## 🛣️ Roadmap

### Phase 2: Drone Workflow Automation
- [ ] Async background job queue (Celery/Temporal)
- [ ] ODM integration for image processing
- [ ] NDVI analysis tools
- [ ] GeoTIFF generation

### Phase 3: Report Building
- [ ] GrapesJS integration
- [ ] Template system
- [ ] PDF export
- [ ] Custom report components

### Phase 4: Spatial Intelligence
- [ ] Map-based polygon drawing
- [ ] Area calculations
- [ ] Layer annotations
- [ ] GeoJSON storage

## 🧭 Vision

Create a comprehensive drone data copilot that seamlessly blends conversational AI with powerful automation tools, enabling users to go from raw drone imagery to actionable insights through natural language interactions.