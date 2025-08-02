#!/bin/bash

# CoDrone Fast Development Script
# Optimized for rapid iteration - skips all quality checks and validations

set -e

echo "🚀 Starting CoDrone in FAST development mode..."
echo "⚠️  Skipping quality checks for maximum speed"

# Set fast development environment
export DEV_MODE=fast
export NODE_ENV=development
export FLASK_ENV=development

# Kill any existing processes on our ports
echo "🧹 Cleaning up existing processes..."
pkill -f "uvicorn main:app" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true

# Function to start backend
start_backend() {
    echo "🐍 Starting FastAPI backend (port 8000)..."
    cd apps/api-server

    # Skip pre-flight checks in fast mode
    if [[ "$DEV_MODE" == "fast" ]]; then
        echo "   ⚡ Fast mode: Skipping dependency validation"
    fi

    # Start with minimal logging and maximum reload speed
    python -m uvicorn main:app \
        --reload \
        --host 0.0.0.0 \
        --port 8000 \
        --log-level warning \
        --reload-delay 0.25 \
        --access-log &

    BACKEND_PID=$!
    echo "   ✅ Backend started (PID: $BACKEND_PID)"
    cd ../..
}

# Function to start frontend
start_frontend() {
    echo "⚛️  Starting React frontend (port 3000)..."
    cd apps/frontend

    # Start Vite with optimized settings for speed
    npm run dev -- \
        --host 0.0.0.0 \
        --port 3000 \
        --no-open \
        --clearScreen false &

    FRONTEND_PID=$!
    echo "   ✅ Frontend started (PID: $FRONTEND_PID)"
    cd ../..
}

# Start services in background
start_backend
start_frontend

# Wait a moment for services to start
sleep 2

echo ""
echo "🎉 CoDrone is running in FAST mode!"
echo ""
echo "📍 Access points:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8000"
echo "   API Docs:  http://localhost:8000/docs"
echo ""
echo "⚡ Fast mode features:"
echo "   • No pre-commit hooks"
echo "   • Minimal logging"
echo "   • Skip quality checks"
echo "   • Maximum reload speed"
echo ""
echo "🔧 To stop: Ctrl+C or run 'pkill -f uvicorn && pkill -f vite'"
echo ""

# Trap Ctrl+C to clean up background processes
trap 'echo "🛑 Stopping services..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT

# Wait for user to stop
wait
