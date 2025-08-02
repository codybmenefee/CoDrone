# CoDrone - AI-First Drone Data Copilot

🚁 A modular, AI-first drone data copilot with spatial analysis, interactive mapping, and intelligent report generation. Built with React, FastAPI/Next.js, and Vercel AI SDK.

## 🏗️ Architecture

```text
CoDrone/
├── apps/
│   ├── frontend/             # React + Vite, chat UI, interactive maps
│   └── api-server/           # FastAPI/Next.js hybrid with AI SDK
├── packages/
│   └── agent-tools/          # Spatial analysis tools
├── data/
│   └── storage/              # File uploads and processing
├── scripts/                  # Setup and deployment automation
└── docs/                     # Documentation and guides
```

## 🚀 Key Features

- ✅ **Interactive Chat**: AI-powered spatial analysis with streaming responses
- ✅ **Spatial Analysis**: Volume calculation, area measurement, elevation analysis
- ✅ **Interactive Mapping**: Leaflet-based maps with polygon drawing
- ✅ **File Processing**: Upload and analyze DSM, orthomosaic, point clouds
- ✅ **Report Generation**: AI-assisted report creation with GrapesJS editor
- ✅ **Session Management**: Persistent conversations with KV storage

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+ with virtual environment
- OpenAI API key

### Installation
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

### Access
- **Frontend**: http://localhost:3000
- **API Server**: http://localhost:8000

## 🛠️ Development

### Commands
```bash
make start              # Start both frontend and backend
make test              # Run all tests with coverage
make quality-check     # Run lint, test, security checks
make format            # Format all code
```

### Tech Stack
- **Backend**: FastAPI/Next.js, Vercel AI SDK, GDAL
- **Frontend**: React, TypeScript, Vite, Leaflet
- **AI**: OpenAI GPT-4 with streaming and tool calling
- **Storage**: File system with KV session storage

## 📚 Documentation

- **[Migration Guide](docs/MIGRATION.md)** - Vercel AI SDK migration details
- **[Testing Guide](docs/TESTING.md)** - Comprehensive testing information
- **[Project Summary](docs/PROJECT_SUMMARY.md)** - Detailed project overview
- **[Development Guide](docs/development/)** - Development workflows and guides

## 🧪 Usage Examples

### Spatial Analysis
1. Upload drone data (DSM, orthomosaic)
2. Draw polygons on interactive map
3. Ask AI: "Calculate volume and area for this region"
4. Get detailed measurements and analysis

### Report Generation
1. Analyze drone data through chat interface
2. Ask AI: "Generate a crop health report"
3. Customize report with visual editor
4. Export as PDF or HTML

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `make test`
5. Submit a pull request

## 📄 License

[Your License Here]

---

**Built for efficient drone data analysis with AI-powered insights and professional reporting capabilities.**
