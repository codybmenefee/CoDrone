# Canopy Copilot 🌱

**AI-first photogrammetry platform for drone prosumers**

Canopy Copilot is designed for land consultants, regenerative farmers, and real estate surveyors who need powerful tools to turn raw aerial imagery into actionable insight and client-ready deliverables.

## 🚀 Features

- **Image Ingestion & Storage**: Seamless drone image upload and management
- **Orthomosaic Processing**: Automated photogrammetry with OpenDroneMap
- **Raster Analysis**: NDVI, GNDVI, and other vegetation indices
- **Interactive Mapping**: Draw polygons, measure areas, analyze zones
- **AI-Powered Reports**: Generate insights and narratives automatically
- **Agentic Automation**: AI copilot for spatial and narrative analysis

## 🏗️ Architecture

- **Frontend**: React + MapboxGL + GrapesJS
- **Backend**: FastAPI (Python)
- **Processing**: OpenDroneMap + Rasterio/GDAL
- **AI Layer**: LangChain + LangGraph
- **Storage**: S3 + MongoDB + PostGIS
- **Auth**: Clerk/Supabase

## 🛠️ Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.11+
- Node.js 18+

### Development Setup

1. **Clone and setup backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Setup frontend:**
```bash
cd frontend
npm install
```

3. **Start services:**
```bash
# Start backend
cd backend && uvicorn main:app --reload

# Start frontend
cd frontend && npm run dev

# Start ODM server (Docker)
docker-compose up odm-server
```

4. **Access the application:**
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs

## 📁 Project Structure

```
canopy-copilot/
├── backend/          # FastAPI application
├── frontend/         # React application
├── infra/           # Infrastructure & deployment
├── data/            # Sample data & test files
└── docs/            # Documentation
```

## 🤖 AI Agent Tools

The platform includes an AI agent with access to:
- `draw_polygon()` - Create measurement zones
- `measure_polygon()` - Calculate areas/volumes
- `get_layer_stats()` - Analyze raster data
- `update_canvas_block()` - Edit report content
- `remix_report()` - Regenerate reports
- `generate_caption()` - Create image descriptions
- `export_pdf()` - Generate client deliverables

## 📊 Data Flow

1. **Upload** → Drone images stored in S3
2. **Process** → OpenDroneMap creates orthomosaics
3. **Analyze** → Raster operations generate indices
4. **Interact** → Users draw polygons, measure areas
5. **Generate** → AI creates reports and insights
6. **Export** → PDF reports for clients

## 🎯 Use Cases

- **Land Consultants**: Site analysis and measurement
- **Regenerative Farmers**: Crop health monitoring
- **Real Estate Surveyors**: Property assessment and documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Canopy Copilot** - The first intelligent copilot for photogrammetry. 🌱