#!/bin/bash

# Canopy Copilot Setup Script
echo "🚁 Setting up Canopy Copilot..."

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3.11+ is required but not found"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 18+ is required but not found"
    exit 1
fi

# Check for .env file
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your OPENAI_API_KEY"
fi

# Install backend dependencies
echo "🐍 Installing backend dependencies..."
cd apps/api-server
pip install -r requirements.txt
cd ../..

# Install frontend dependencies
echo "⚛️  Installing frontend dependencies..."
cd apps/frontend
npm install
cd ../..

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the application:"
echo "  1. Edit .env and add your OPENAI_API_KEY"
echo "  2. Run: ./scripts/start.sh"
echo "  3. Or use Docker: docker-compose up"
echo ""
echo "📖 Check README.md for detailed instructions"