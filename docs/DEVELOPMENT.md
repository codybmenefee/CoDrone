# Canopy Copilot - Development Guide

## 🌱 Overview

Canopy Copilot is an AI-first photogrammetry platform designed for drone prosumers. This guide covers the development setup, architecture, and contribution guidelines.

## 🏗️ Architecture

### Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | React + Vite | Modern web interface |
| **Backend** | FastAPI (Python) | RESTful API server |
| **Database** | MongoDB + PostgreSQL | Document + Spatial data |
| **Storage** | MinIO (S3-compatible) | File storage |
| **Processing** | OpenDroneMap | Photogrammetry |
| **AI** | LangChain + LangGraph | Agent orchestration |
| **Maps** | MapboxGL | Interactive mapping |
| **Reports** | GrapesJS | Visual editor |

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Processing    │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (OpenDroneMap)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MapboxGL      │    │   AI Agent      │    │   Storage       │
│   (Maps)        │    │   (LangChain)   │    │   (MinIO/S3)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GrapesJS      │    │   MongoDB       │    │   PostgreSQL    │
│   (Reports)     │    │   (Documents)   │    │   (Spatial)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- Python 3.11+
- Git

### 1. Clone Repository

```bash
git clone <repository-url>
cd canopy-copilot
```

### 2. Run Setup Script

```bash
./scripts/setup.sh
```

This script will:
- Create necessary directories
- Generate environment files
- Start all Docker services
- Configure MinIO bucket

### 3. Configure Environment

Edit the generated environment files:

**Backend** (`backend/.env`):
```env
OPENAI_API_KEY=your_openai_api_key_here
MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

**Frontend** (`frontend/.env`):
```env
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **MinIO Console**: http://localhost:9001

## 🛠️ Development Workflow

### Backend Development

1. **Install Dependencies**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Run Development Server**:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

3. **Run Tests**:
```bash
pytest
```

### Frontend Development

1. **Install Dependencies**:
```bash
cd frontend
npm install
```

2. **Run Development Server**:
```bash
npm run dev
```

3. **Build for Production**:
```bash
npm run build
```

### Database Management

**MongoDB** (Documents):
- Connection: `mongodb://admin:password@localhost:27017`
- Database: `canopy_copilot`

**PostgreSQL** (Spatial Data):
- Connection: `postgresql://user:password@localhost:5432/canopy_copilot`
- Extensions: PostGIS enabled

### Storage Management

**MinIO** (S3-compatible):
- Endpoint: http://localhost:9000
- Console: http://localhost:9001
- Credentials: `minioadmin` / `minioadmin`
- Bucket: `canopy-copilot`

## 📁 Project Structure

```
canopy-copilot/
├── backend/                 # FastAPI backend
│   ├── api/                # API routes
│   │   ├── routes/         # Route modules
│   │   └── __init__.py
│   ├── agent/              # AI agent components
│   │   ├── tools.py        # Agent tools
│   │   ├── workflow.py     # Agent workflow
│   │   └── __init__.py
│   ├── db/                 # Database models
│   │   ├── database.py     # Connection setup
│   │   └── models.py       # Data models
│   ├── jobs/               # Background jobs
│   ├── odm/                # OpenDroneMap integration
│   ├── raster/             # Raster processing
│   ├── utils/              # Utilities
│   │   ├── config.py       # Configuration
│   │   └── storage.py      # S3/MinIO utilities
│   ├── main.py             # FastAPI app
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utilities
│   │   ├── store/          # State management
│   │   ├── types/          # TypeScript types
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── package.json        # Node dependencies
│   └── Dockerfile
├── infra/                  # Infrastructure
│   ├── docker/            # Docker configurations
│   ├── odm-server/        # OpenDroneMap server
│   └── terraform/         # Infrastructure as code
├── data/                  # Sample data
│   ├── sample_images/     # Test drone images
│   └── test_rasters/      # Test raster files
├── scripts/               # Development scripts
│   └── setup.sh           # Setup script
├── docs/                  # Documentation
├── docker-compose.yml     # Development environment
└── README.md
```

## 🔧 Configuration

### Environment Variables

**Backend** (`backend/.env`):
```env
# Database
MONGODB_URL=mongodb://admin:password@localhost:27017
POSTGRES_URL=postgresql://user:password@localhost:5432/canopy_copilot

# Storage
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=canopy-copilot

# AI
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4

# Maps
MAPBOX_ACCESS_TOKEN=your_mapbox_token

# Processing
ODM_URL=http://localhost:3000
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:8000
VITE_MAPBOX_TOKEN=your_mapbox_token
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest
pytest --cov=app tests/
pytest --cov=app --cov-report=html tests/
```

### Frontend Tests

```bash
cd frontend
npm test
npm run test:coverage
```

## 🚀 Deployment

### Production Build

1. **Build Images**:
```bash
docker-compose -f docker-compose.prod.yml build
```

2. **Deploy**:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables

Set production environment variables:
- `DEBUG=false`
- `SECRET_KEY=secure_random_key`
- `OPENAI_API_KEY=your_production_key`
- `MAPBOX_ACCESS_TOKEN=your_production_token`

## 🤖 AI Agent Development

### Adding New Tools

1. **Define Tool in `backend/agent/tools.py`**:
```python
async def new_tool(self, param1: str, param2: int) -> Dict[str, Any]:
    """Description of what the tool does"""
    try:
        # Tool implementation
        result = await self._process_data(param1, param2)
        return {
            "success": True,
            "result": result,
            "message": "Tool executed successfully"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
```

2. **Add Tool to Workflow in `backend/agent/workflow.py`**:
```python
def _analyze_intent(self, message: str) -> Dict[str, Any]:
    # Add intent detection logic
    if "new_tool_keyword" in message.lower():
        return {
            "type": "new_tool",
            "confidence": 0.8,
            "requires_param1": True
        }
```

3. **Add API Route in `backend/api/routes/agent.py`**:
```python
@router.post("/tools/new_tool")
async def new_tool(tool_input: Dict[str, Any]):
    """Agent tool: New tool description"""
    # Implementation
```

### Agent Workflow

1. **Message Processing**: User message → Intent analysis → Tool selection
2. **Tool Execution**: Tool parameters → Tool execution → Result processing
3. **Response Generation**: Results → Response formatting → User feedback

## 📊 Data Flow

### Image Upload Flow

1. **Upload**: Frontend → Backend API → S3/MinIO
2. **Processing**: Backend → OpenDroneMap → Orthomosaic generation
3. **Analysis**: Raster processing → NDVI/GNDVI calculation
4. **Storage**: Results → S3/MinIO → Database metadata

### AI Agent Flow

1. **User Input**: Natural language → Intent analysis
2. **Tool Selection**: Intent → Appropriate tool selection
3. **Execution**: Tool parameters → Tool execution
4. **Response**: Results → Formatted response → User interface

## 🔍 Debugging

### Backend Debugging

1. **Enable Debug Mode**:
```env
DEBUG=true
```

2. **View Logs**:
```bash
docker-compose logs -f backend
```

3. **API Documentation**: http://localhost:8000/docs

### Frontend Debugging

1. **Browser DevTools**: F12 → Console/Network tabs
2. **React DevTools**: Browser extension
3. **Hot Reload**: Automatic on file changes

### Database Debugging

1. **MongoDB**:
```bash
docker exec -it canopy-mongodb mongosh
```

2. **PostgreSQL**:
```bash
docker exec -it canopy-postgres psql -U user -d canopy_copilot
```

## 📝 Contributing

### Code Style

**Backend (Python)**:
- Use Black for formatting
- Use isort for import sorting
- Follow PEP 8 guidelines

**Frontend (JavaScript/React)**:
- Use Prettier for formatting
- Use ESLint for linting
- Follow React best practices

### Git Workflow

1. **Create Feature Branch**:
```bash
git checkout -b feature/new-feature
```

2. **Make Changes**: Implement your feature

3. **Test**: Run tests and ensure they pass

4. **Commit**: Use conventional commit messages
```bash
git commit -m "feat: add new AI tool for polygon analysis"
```

5. **Push**: Push to your branch
```bash
git push origin feature/new-feature
```

6. **Create PR**: Submit pull request for review

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

## 🆘 Troubleshooting

### Common Issues

1. **Port Conflicts**: Change ports in `docker-compose.yml`
2. **Memory Issues**: Increase Docker memory allocation
3. **Permission Issues**: Check file permissions on mounted volumes
4. **Network Issues**: Restart Docker network

### Getting Help

1. Check the logs: `docker-compose logs -f`
2. Review this documentation
3. Check GitHub issues
4. Create a new issue with detailed information

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [OpenDroneMap Documentation](https://docs.opendronemap.org/)
- [LangChain Documentation](https://python.langchain.com/)
- [MapboxGL Documentation](https://docs.mapbox.com/mapbox-gl-js/)
- [GrapesJS Documentation](https://grapesjs.com/docs/)

---

**Canopy Copilot** - The first intelligent copilot for photogrammetry. 🌱