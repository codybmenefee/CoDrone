#!/bin/bash

# Canopy Copilot Setup Script
echo "🚁 Setting up Canopy Copilot..."

# Get the project root directory (parent of scripts directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root
cd "$PROJECT_ROOT"

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3.11+ is required but not found"
    echo "Please install Python 3.11 or later: https://www.python.org/downloads/"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 18+ is required but not found"
    echo "Please install Node.js 18 or later: https://nodejs.org/"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not found"
    echo "Please install npm (usually comes with Node.js)"
    exit 1
fi

# Check for .env file
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "⚠️  Please edit .env and add your OPENAI_API_KEY"
        echo "   You can find your API key at: https://platform.openai.com/api-keys"
    else
        echo "❌ .env.example not found"
        exit 1
    fi
else
    echo "✅ .env file already exists"
fi

# Create Python virtual environment
echo "🐍 Creating Python virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "❌ Failed to create virtual environment"
        exit 1
    fi
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Install backend dependencies
echo "🐍 Installing backend dependencies..."
if [ -d "apps/api-server" ]; then
    # Activate virtual environment
    source venv/bin/activate

    # Upgrade pip first
    pip install --upgrade pip --break-system-packages

    # Install requirements
    pip install --break-system-packages -r apps/api-server/requirements.txt
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install backend dependencies"
        deactivate
        exit 1
    fi

    deactivate
    echo "✅ Backend dependencies installed"
else
    echo "❌ apps/api-server directory not found"
    exit 1
fi

# Install frontend dependencies
echo "⚛️  Installing frontend dependencies..."
if [ -d "apps/frontend" ]; then
    cd apps/frontend

    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        echo "❌ package.json not found in apps/frontend"
        cd "$PROJECT_ROOT"
        exit 1
    fi

    # Install dependencies
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install frontend dependencies"
        cd "$PROJECT_ROOT"
        exit 1
    fi

    cd "$PROJECT_ROOT"
    echo "✅ Frontend dependencies installed"
else
    echo "❌ apps/frontend directory not found"
    exit 1
fi

# Create data directory
echo "📁 Creating data directories..."
mkdir -p data/storage
echo "✅ Data directories created"

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x scripts/setup.sh scripts/start.sh
echo "✅ Scripts are now executable"

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the application:"
echo "  1. Edit .env and add your OPENAI_API_KEY"
echo "  2. Run: ./scripts/start.sh"
echo "  3. Or use Docker: docker-compose up"
echo ""
echo "📖 Check README.md for detailed instructions"
echo ""
echo "🌐 Once started, you can access:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:8000"
echo "  - API Docs: http://localhost:8000/docs"
