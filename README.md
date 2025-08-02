# Canopy Copilot - AI-First Drone Data Copilot

A modular, AI-first drone data copilot that can handle rich interactions, automate drone workflows, and provide clean chat UX with AI reasoning and multi-modal input.

## 🏗️ Architecture

```text
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

## 🤖 Agentic Development

This project is optimized for **agentic development** using Cursor background agents. We've established a comprehensive workflow for AI-assisted feature development.

### Quick Start for Agentic Development

```bash
# Setup agentic development environment
make agent-setup

# Create context for a task
make agent-context

# Delegate to background agent
make agent-delegate

# Review agent work
make agent-review
```

### 📚 Agentic Development Resources

- **[Quick Start Guide](docs/development/AGENTIC_QUICKSTART.md)** - Get started in 5 minutes
- **[Full Framework](docs/development/AGENTIC_DEVELOPMENT.md)** - Comprehensive workflow guide
- **[Development Roadmap](.cursor/roadmaps/development-roadmap.md)** - Feature planning and tracking
- **[Task Board](.cursor/tasks/task-board.md)** - Current tasks and status

### 📖 Documentation

- **[Documentation Index](docs/README.md)** - Complete documentation guide
- **[Project Summary](docs/PROJECT_SUMMARY.md)** - Detailed project overview
- **[Demo Guide](docs/user-guides/DEMO.md)** - How to explore features

### 🎯 Agentic Development Benefits

- **AI Companion Planning**: Use AI to plan features and break down tasks
- **Context Curation**: Create detailed contexts for background agents
- **Task Delegation**: Delegate specific tasks to AI agents
- **Progress Tracking**: Monitor development progress with structured roadmaps
- **Quality Assurance**: Automated code review and testing

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

### Option 1: Quick Setup (Recommended)

```bash
# 1. Run setup script
./scripts/setup.sh

# 2. Add your OpenAI API key to .env
echo "OPENAI_API_KEY=sk-your-key-here" >> .env

# 3. Start everything
./scripts/start.sh
```

### Option 2: Manual Setup

```bash
# 1. Install dependencies
make install-dev

# 2. Environment setup
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# 3. Start servers
make start
```

### Option 3: Docker

```bash
# Add OPENAI_API_KEY to .env first
make docker-run
```

### 🚀 Access Points

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

## 🛠️ Development

### Quality Assurance

This project includes comprehensive quality assurance tools:

```bash
# Run all quality checks
make quality-check

# Individual checks
make lint          # Run all linters
make test          # Run all tests
make security-check # Run security scans
make format        # Format all code
```

### Testing

```bash
# Backend tests
make test-backend

# Frontend tests
make test-frontend

# With coverage
make test  # Includes coverage reports
```

### Code Quality

```bash
# Format code
make format

# Check formatting
make format-check

# Security scanning
make security-scan  # Bandit scan
make security-check-full  # Full security audit
```

### Docker Development

```bash
# Build and run with Docker
make docker-build
make docker-run

# View logs
make docker-logs

# Stop containers
make docker-stop
```

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

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to:

- Set up your development environment
- Follow our coding standards
- Submit pull requests
- Use our agentic development workflow

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
