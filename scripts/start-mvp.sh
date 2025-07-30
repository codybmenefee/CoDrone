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
