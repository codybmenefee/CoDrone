#!/bin/bash

# Canopy Copilot Development Startup Script
echo "🚁 Starting Canopy Copilot in development mode..."

# Get the project root directory (parent of scripts directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root
cd "$PROJECT_ROOT"

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found! Run ./scripts/setup.sh first"
    exit 1
fi

# Check if OPENAI_API_KEY is set
if ! grep -q "OPENAI_API_KEY=sk-" .env; then
    echo "⚠️  OPENAI_API_KEY not found in .env file"
    echo "Please add your OpenAI API key to .env:"
    echo "OPENAI_API_KEY=sk-your-key-here"
    echo ""
    echo "You can find your API key at: https://platform.openai.com/api-keys"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found! Run ./scripts/setup.sh first"
    exit 1
fi

# Check if backend dependencies are installed
if [ ! -d "apps/api-server" ]; then
    echo "❌ apps/api-server directory not found! Run ./scripts/setup.sh first"
    exit 1
fi

# Check if frontend dependencies are installed
if [ ! -d "apps/frontend" ] || [ ! -d "apps/frontend/node_modules" ]; then
    echo "❌ Frontend dependencies not found! Run ./scripts/setup.sh first"
    exit 1
fi

# Create data directory
mkdir -p data/storage

# Function to check and kill processes on specific ports
check_and_kill_port() {
    local port=$1
    local service_name=$2

    echo "🔍 Checking port $port for conflicts..."
    local pids=$(lsof -ti:$port 2>/dev/null)

    if [ ! -z "$pids" ]; then
        echo "⚠️  Port $port is in use by process(es): $pids"
        echo "🔄 Killing existing $service_name processes..."
        echo "$pids" | xargs kill -9 2>/dev/null
        sleep 1
        echo "✅ Port $port cleared"
    else
        echo "✅ Port $port is available"
    fi
}

# Check and clear ports before starting
check_and_kill_port 8000 "backend"
check_and_kill_port 3000 "frontend"

echo "🚀 Starting backend and frontend servers..."

# Function to kill background processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ Backend stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ Frontend stopped"
    fi
    echo "👋 Goodbye!"
    exit
}

# Set up signal handlers
trap cleanup EXIT INT TERM

# Start backend
echo "🐍 Starting FastAPI backend on http://localhost:8000"
if [ -d "apps/api-server" ]; then
    cd apps/api-server

    # Activate virtual environment
    source ../../venv/bin/activate

    # Start the server
    python -m uvicorn main:app --reload --port 8000 --host 0.0.0.0 &
    BACKEND_PID=$!

    # Check if backend started successfully
    sleep 3
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo "❌ Backend failed to start"
        deactivate
        cd "$PROJECT_ROOT"
        exit 1
    fi

    deactivate
    cd "$PROJECT_ROOT"
    echo "✅ Backend started successfully (PID: $BACKEND_PID)"
else
    echo "❌ apps/api-server directory not found"
    exit 1
fi

# Wait a moment for backend to fully start
sleep 2

# Test backend health
echo "🔍 Testing backend health..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend is healthy"
else
    echo "⚠️  Backend health check failed, but continuing..."
fi

# Start frontend
echo "⚛️  Starting React frontend on http://localhost:3000"
if [ -d "apps/frontend" ]; then
    cd apps/frontend

    # Start the development server
    npm run dev &
    FRONTEND_PID=$!

    # Check if frontend started successfully
    sleep 3
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "❌ Frontend failed to start"
        cd "$PROJECT_ROOT"
        exit 1
    fi

    cd "$PROJECT_ROOT"
    echo "✅ Frontend started successfully (PID: $FRONTEND_PID)"
else
    echo "❌ apps/frontend directory not found"
    exit 1
fi

# Wait a moment for frontend to start
sleep 2

echo ""
echo "🎉 Servers started successfully!"
echo ""
echo "🌐 Access your application:"
echo "  📱 Frontend: http://localhost:3000"
echo "  🔧 Backend API: http://localhost:8000"
echo "  📚 API Documentation: http://localhost:8000/docs"
echo "  💚 Health Check: http://localhost:8000/health"
echo ""
echo "📋 Server Status:"
echo "  🐍 Backend: Running (PID: $BACKEND_PID)"
echo "  ⚛️  Frontend: Running (PID: $FRONTEND_PID)"
echo ""
echo "⌨️  Press Ctrl+C to stop both servers"
echo ""

# Wait for user to stop
wait
