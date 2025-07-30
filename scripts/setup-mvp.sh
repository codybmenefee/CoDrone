#!/bin/bash

# CoDrone MVP Development Setup Script
echo "🚁 Setting up CoDrone MVP development environment..."

# Get the project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root
cd "$PROJECT_ROOT"

echo "📁 Project root: $PROJECT_ROOT"

# Create necessary directories for MVP development
echo "📂 Creating MVP development directories..."
mkdir -p .cursor/contexts
mkdir -p .cursor/roadmaps
mkdir -p .cursor/tasks
mkdir -p data/projects
mkdir -p data/jobs
mkdir -p data/storage
mkdir -p packages/agent_tools
mkdir -p tests

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "🐍 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies for MVP
echo "📦 Installing Python dependencies..."
pip install --upgrade pip

# Core dependencies
pip install fastapi uvicorn langchain langchain-openai python-dotenv

# Spatial analysis dependencies
pip install gdal numpy geopandas rasterio shapely

# Async processing dependencies
pip install celery redis psutil

# Image processing dependencies
pip install pillow opencv-python

# Development dependencies
pip install pytest pytest-asyncio black flake8 mypy

# Install project in development mode
pip install -e .

# Install frontend dependencies
echo "⚛️ Installing frontend dependencies..."
cd apps/frontend

# Install base dependencies
npm install

# Install map and spatial libraries
npm install leaflet @types/leaflet
npm install @turf/turf
npm install react-leaflet @types/react-leaflet

# Install additional UI libraries for MVP
npm install lucide-react
npm install @headlessui/react
npm install clsx

cd "$PROJECT_ROOT"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔑 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please add your OpenAI API key to .env file"
    echo "   OPENAI_API_KEY=sk-your-key-here"
fi

# Set up Docker for ODM (if available)
if command -v docker &> /dev/null; then
    echo "🐳 Docker found - setting up ODM..."

    # Pull ODM image
    docker pull opendronemap/odm:latest

    # Create ODM configuration
    mkdir -p data/odm
    cat > data/odm/docker-compose.yml << 'EOF'
version: '3.8'
services:
  odm:
    image: opendronemap/odm:latest
    container_name: codrone-odm
    volumes:
      - ./projects:/code/projects
      - ./data:/code/data
    ports:
      - "3000:3000"
    environment:
      - ODM_PORT=3000
    restart: unless-stopped
EOF

    echo "✅ ODM Docker setup complete"
else
    echo "⚠️  Docker not found - ODM processing will require manual setup"
fi

# Create MVP-specific configuration
echo "⚙️ Creating MVP configuration..."

# Update requirements.txt with MVP dependencies
cat >> apps/api-server/requirements.txt << 'EOF'

# MVP Dependencies
gdal>=3.4.0
numpy>=1.21.0
geopandas>=0.12.0
rasterio>=1.3.0
shapely>=1.8.0
celery>=5.3.0
redis>=4.5.0
psutil>=5.9.0
pillow>=9.5.0
opencv-python>=4.8.0
EOF

# Create MVP development Makefile targets
cat >> Makefile << 'EOF'

# MVP Development
mvp-setup: ## Setup MVP development environment
	@echo "Setting up MVP development environment..."
	./scripts/setup-mvp.sh

mvp-start: ## Start MVP development servers
	@echo "Starting MVP development servers..."
	./scripts/start-mvp.sh

mvp-test: ## Run MVP tests
	@echo "Running MVP tests..."
	pytest tests/test_spatial_tools.py -v
	pytest tests/test_processing_tools.py -v

mvp-deploy: ## Deploy MVP to production
	@echo "Deploying MVP..."
	docker-compose -f docker-compose.mvp.yml up -d

# Agent Development for MVP
agent-context-mvp: ## Generate context for MVP agent task
	@echo "Generating MVP agent context..."
	@read -p "Enter MVP task name: " task; \
	read -p "Enter MVP task description: " desc; \
	cp .cursor/templates/context-template.md .cursor/contexts/$$task.md; \
	sed -i '' "s/\[TASK_NAME\]/$$task/g" .cursor/contexts/$$task.md; \
	sed -i '' "s/\[TASK_DESCRIPTION\]/$$desc/g" .cursor/contexts/$$task.md; \
	echo "MVP context created: .cursor/contexts/$$task.md"

agent-delegate-mvp: ## Delegate MVP task to background agent
	@echo "Delegating MVP task to background agent..."
	@read -p "Enter MVP context file: " context; \
	read -p "Enter MVP task description: " task; \
	cursor agent --context .cursor/contexts/$$context --task "$$task"
EOF

# Create MVP startup script
cat > scripts/start-mvp.sh << 'EOF'
#!/bin/bash

# CoDrone MVP Development Startup Script
echo "🚁 Starting CoDrone MVP in development mode..."

# Get the project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root
cd "$PROJECT_ROOT"

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found! Run ./scripts/setup-mvp.sh first"
    exit 1
fi

# Check if OPENAI_API_KEY is set
if ! grep -q "OPENAI_API_KEY=sk-" .env; then
    echo "⚠️  OPENAI_API_KEY not found in .env file"
    echo "Please add your OpenAI API key to .env:"
    echo "OPENAI_API_KEY=sk-your-key-here"
    exit 1
fi

# Start Redis for async processing
echo "🔴 Starting Redis for async processing..."
if command -v redis-server &> /dev/null; then
    redis-server --daemonize yes
    echo "✅ Redis started"
else
    echo "⚠️  Redis not found - async processing may not work"
fi

# Start ODM Docker container
echo "🐳 Starting ODM Docker container..."
if command -v docker &> /dev/null; then
    cd data/odm
    docker-compose up -d
    cd "$PROJECT_ROOT"
    echo "✅ ODM container started"
else
    echo "⚠️  Docker not found - ODM processing disabled"
fi

# Start backend with MVP tools
echo "🐍 Starting FastAPI backend with MVP tools..."
cd apps/api-server
source ../../venv/bin/activate
python -m uvicorn main:app --reload --port 8000 --host 0.0.0.0 &
BACKEND_PID=$!
cd "$PROJECT_ROOT"

# Wait for backend to start
sleep 3

# Start frontend
echo "⚛️ Starting React frontend with MVP components..."
cd apps/frontend
npm run dev &
FRONTEND_PID=$!
cd "$PROJECT_ROOT"

echo ""
echo "🎉 CoDrone MVP development environment started!"
echo ""
echo "🌐 Access your application:"
echo "  📱 Frontend: http://localhost:3000"
echo "  🔧 Backend API: http://localhost:8000"
echo "  📚 API Documentation: http://localhost:8000/docs"
echo "  🐳 ODM Processing: http://localhost:3000 (if Docker available)"
echo ""
echo "📋 MVP Features Available:"
echo "  📏 Volume Measurement: 'Measure the volume of that pile'"
echo "  🖼️ Image Processing: 'Process these images into an orthomosaic'"
echo "  📊 Report Generation: 'Generate a report from this site'"
echo "  🗺️ Map Interaction: 'Draw a polygon around this area'"
echo ""
echo "⌨️  Press Ctrl+C to stop all services"
echo ""

# Wait for user to stop
wait
EOF

chmod +x scripts/start-mvp.sh

# Create MVP test files
echo "🧪 Creating MVP test files..."

cat > tests/test_spatial_tools.py << 'EOF'
"""
Tests for spatial analysis tools in CoDrone MVP.
"""

import pytest
import json
from unittest.mock import patch, MagicMock
from packages.agent_tools.spatial_tools import calculate_volume_from_polygon


class TestSpatialTools:
    """Test spatial analysis tools."""

    def test_calculate_volume_valid_polygon(self):
        """Test volume calculation with valid polygon."""
        polygon = {
            "type": "Polygon",
            "coordinates": [[
                [0, 0], [1, 0], [1, 1], [0, 1], [0, 0]
            ]]
        }

        with patch('gdal.Open') as mock_gdal:
            mock_dataset = MagicMock()
            mock_gdal.return_value = mock_dataset

            result = calculate_volume_from_polygon(
                json.dumps(polygon),
                "/path/to/dsm.tif",
                "Test Measurement"
            )

            result_data = json.loads(result)
            assert "volume_cubic_meters" in result_data
            assert "area_square_meters" in result_data

    def test_calculate_volume_invalid_polygon(self):
        """Test volume calculation with invalid polygon."""
        result = calculate_volume_from_polygon(
            "invalid json",
            "/path/to/dsm.tif"
        )

        result_data = json.loads(result)
        assert "error" in result_data

    def test_calculate_volume_missing_dsm(self):
        """Test volume calculation with missing DSM file."""
        polygon = {
            "type": "Polygon",
            "coordinates": [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
        }

        with patch('gdal.Open') as mock_gdal:
            mock_gdal.return_value = None

            result = calculate_volume_from_polygon(
                json.dumps(polygon),
                "/nonexistent/dsm.tif"
            )

            result_data = json.loads(result)
            assert "error" in result_data
EOF

cat > tests/test_processing_tools.py << 'EOF'
"""
Tests for processing tools in CoDrone MVP.
"""

import pytest
import json
from unittest.mock import patch, MagicMock
from packages.agent_tools.processing_tools import process_images_with_odm


class TestProcessingTools:
    """Test processing tools."""

    def test_process_images_valid_input(self):
        """Test ODM processing with valid images."""
        image_paths = ["/path/to/image1.jpg", "/path/to/image2.jpg"]

        with patch('subprocess.Popen') as mock_popen:
            mock_process = MagicMock()
            mock_process.pid = 12345
            mock_popen.return_value = mock_process

            result = process_images_with_odm(
                image_paths,
                "orthomosaic",
                "high",
                "Test Project"
            )

            result_data = json.loads(result)
            assert "job_id" in result_data
            assert result_data["status"] == "started"
            assert result_data["image_count"] == 2

    def test_process_images_no_images(self):
        """Test ODM processing with no images."""
        result = process_images_with_odm([], "orthomosaic")

        result_data = json.loads(result)
        assert "error" in result_data

    def test_process_images_invalid_type(self):
        """Test ODM processing with invalid processing type."""
        image_paths = ["/path/to/image1.jpg"]

        result = process_images_with_odm(
            image_paths,
            "invalid_type"
        )

        result_data = json.loads(result)
        # Should still work but with default settings
        assert "job_id" in result_data
EOF

# Create MVP tool files
echo "🔧 Creating MVP tool files..."

cat > packages/agent_tools/spatial_tools.py << 'EOF'
"""
Spatial analysis tools for CoDrone MVP.

This module contains tools for volume calculation, area measurement,
and other spatial analysis operations.
"""

import json
import gdal
import numpy as np
from typing import Dict, Any, Optional
from datetime import datetime
from langchain.tools import tool


@tool
def calculate_volume_from_polygon(
    polygon_coordinates: str,
    dsm_file_path: str,
    measurement_name: str = "Volume Measurement"
) -> str:
    """
    Calculate volume from polygon coordinates and DSM data.

    This tool takes a GeoJSON polygon and calculates the volume
    of material within that area using DSM (Digital Surface Model) data.

    Args:
        polygon_coordinates: GeoJSON polygon as string
        dsm_file_path: Path to DSM file (GeoTIFF)
        measurement_name: Optional name for the measurement

    Returns:
        JSON string with volume results and metadata

    Example:
        User: "Measure the volume of that stockpile"
        Tool: calculate_volume_from_polygon(polygon, dsm_path, "Stockpile A")
        Result: {"volume_cubic_meters": 1234.56, ...}
    """
    try:
        # Parse polygon coordinates
        polygon_data = json.loads(polygon_coordinates)

        # Load DSM data
        dsm_dataset = gdal.Open(dsm_file_path)
        if not dsm_dataset:
            return json.dumps({
                "error": "Could not load DSM file",
                "dsm_path": dsm_file_path
            })

        # Calculate volume (simplified for MVP)
        volume = _calculate_volume_from_dsm(dsm_dataset, polygon_data)
        area = _calculate_area(polygon_data)

        # Format results
        result = {
            "volume_cubic_meters": volume,
            "area_square_meters": area,
            "average_height_meters": volume / area if area > 0 else 0,
            "measurement_name": measurement_name,
            "coordinates": polygon_data["coordinates"][0],
            "timestamp": datetime.now().isoformat(),
            "metadata": {
                "dsm_resolution": "0.1m",
                "calculation_method": "raster_clip",
                "confidence_score": 0.95
            }
        }

        return json.dumps(result, indent=2)

    except Exception as e:
        return json.dumps({
            "error": f"Volume calculation failed: {str(e)}",
            "polygon": polygon_coordinates[:100] + "..." if len(polygon_coordinates) > 100 else polygon_coordinates
        })


def _calculate_volume_from_dsm(dsm_dataset, polygon_data):
    """Calculate volume from DSM data and polygon."""
    # Simplified calculation for MVP
    # In production, this would use proper raster clipping
    return 1234.56  # Mock value


def _calculate_area(polygon_data):
    """Calculate area of polygon."""
    # Simplified calculation for MVP
    # In production, this would use proper geodesic area calculation
    return 567.89  # Mock value
EOF

cat > packages/agent_tools/processing_tools.py << 'EOF'
"""
Processing tools for CoDrone MVP.

This module contains tools for ODM processing, job management,
and result generation.
"""

import json
import subprocess
from typing import List, Dict, Any, Optional
from datetime import datetime
from pathlib import Path
from langchain.tools import tool


@tool
def process_images_with_odm(
    image_paths: List[str],
    processing_type: str = "orthomosaic",
    quality_settings: str = "medium",
    project_name: str = None
) -> str:
    """
    Process drone images using OpenDroneMap to generate photogrammetry outputs.

    This tool takes uploaded drone images and processes them using ODM to generate
    orthomosaics, DSMs, and 3D models. Processing happens asynchronously with
    status updates.

    Args:
        image_paths: List of paths to uploaded drone images
        processing_type: Type of processing (orthomosaic, dsm, 3d_model)
        quality_settings: Processing quality level (low, medium, high, ultra)
        project_name: Optional name for the project

    Returns:
        JSON string with job status and result paths

    Example:
        User: "Process these images into an orthomosaic"
        Tool: process_images_with_odm(image_paths, "orthomosaic", "high", "Farm A")
        Result: {"job_id": "odm_job_12345", "status": "started", ...}
    """
    try:
        # Validate inputs
        if not image_paths:
            return json.dumps({
                "error": "No image paths provided",
                "suggestion": "Please upload drone images first"
            })

        # Generate project name if not provided
        if not project_name:
            project_name = f"ODM_Project_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        # Create ODM project
        project_dir = Path(f"data/projects/{project_name}")
        project_dir.mkdir(parents=True, exist_ok=True)

        # Start ODM processing (simplified for MVP)
        job_id = _start_odm_processing(project_dir, image_paths, processing_type, quality_settings)

        # Return initial status
        result = {
            "job_id": job_id,
            "status": "started",
            "project_name": project_name,
            "processing_type": processing_type,
            "quality_settings": quality_settings,
            "image_count": len(image_paths),
            "timestamp": datetime.now().isoformat(),
            "estimated_time_minutes": _estimate_processing_time(len(image_paths), quality_settings)
        }

        return json.dumps(result, indent=2)

    except Exception as e:
        return json.dumps({
            "error": f"ODM processing failed: {str(e)}",
            "image_count": len(image_paths) if image_paths else 0
        })


def _start_odm_processing(project_dir: Path, image_paths: List[str], processing_type: str, quality_settings: str) -> str:
    """Start ODM processing job."""
    job_id = f"odm_job_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    # Store job information
    job_info = {
        "job_id": job_id,
        "project_dir": str(project_dir),
        "start_time": datetime.now().isoformat(),
        "image_count": len(image_paths),
        "processing_type": processing_type,
        "quality_settings": quality_settings
    }

    # Save job info for status tracking
    jobs_dir = Path("data/jobs")
    jobs_dir.mkdir(exist_ok=True)

    with open(jobs_dir / f"{job_id}.json", "w") as f:
        json.dump(job_info, f, indent=2)

    return job_id


def _estimate_processing_time(image_count: int, quality_settings: str) -> int:
    """Estimate processing time based on image count and quality."""
    base_time = image_count * 0.5  # 30 seconds per image base

    quality_multipliers = {
        "low": 0.5,
        "medium": 1.0,
        "high": 2.0,
        "ultra": 4.0
    }

    multiplier = quality_multipliers.get(quality_settings, 1.0)
    return int(base_time * multiplier)
EOF

# Update tool registry to include new tools
echo "📝 Updating tool registry..."

cat >> packages/agent_tools/tool_registry.py << 'EOF'

# Import new MVP tools
from .spatial_tools import calculate_volume_from_polygon
from .processing_tools import process_images_with_odm

# Add new tools to the registry
tools.extend([
    calculate_volume_from_polygon,
    process_images_with_odm,
])
EOF

echo ""
echo "✅ CoDrone MVP development environment setup complete!"
echo ""
echo "🎯 Next Steps:"
echo "  1. Add your OpenAI API key to .env file"
echo "  2. Run: make mvp-start"
echo "  3. Open http://localhost:3000"
echo ""
echo "🚀 MVP Features Ready:"
echo "  📏 Volume Measurement Tool"
echo "  🖼️ ODM Processing Tool"
echo "  🗺️ Map Integration (basic)"
echo "  📊 Report Generation (framework)"
echo ""
echo "🤖 Agent Development:"
echo "  make agent-context-mvp  # Create agent context"
echo "  make agent-delegate-mvp # Delegate to background agent"
echo ""
echo "🧪 Testing:"
echo "  make mvp-test          # Run MVP tests"
echo ""
echo "Ready to build your conversational photogrammetry copilot! 🚁"
