#!/bin/bash

# Canopy Copilot Development Startup Script
echo "🚁 Starting Canopy Copilot in development mode..."

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
    exit 1
fi

# Create data directory
mkdir -p data/storage

echo "🚀 Starting backend and frontend servers..."

# Function to kill background processes on exit
cleanup() {
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}
trap cleanup EXIT

# Start backend
echo "🐍 Starting FastAPI backend on http://localhost:8000"
cd apps/api-server
python -m uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ../..

# Wait a moment for backend to start
sleep 2

# Start frontend
echo "⚛️  Starting React frontend on http://localhost:3000"
cd apps/frontend
npm run dev &
FRONTEND_PID=$!
cd ../..

echo ""
echo "✅ Servers started!"
echo "🌐 Frontend: http://localhost:3000"
echo "📡 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait