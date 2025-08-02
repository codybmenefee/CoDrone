#!/bin/bash
# CoDrone Vercel AI SDK Migration Startup Script

set -e

echo "🚀 Starting CoDrone with Vercel AI SDK Migration..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if dependencies are installed
check_dependencies() {
    echo -e "${BLUE}📋 Checking dependencies...${NC}"

    # Check Node.js version
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
        exit 1
    fi

    NODE_VERSION=$(node --version | cut -d'v' -f2)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)

    if [ "$MAJOR_VERSION" -lt 18 ]; then
        echo -e "${RED}❌ Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 18+${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ Node.js version $NODE_VERSION${NC}"

    # Check if npm packages are installed
    if [ ! -d "apps/api-server/node_modules" ]; then
        echo -e "${YELLOW}📦 Installing API server dependencies...${NC}"
        cd apps/api-server && npm install && cd ../..
    fi

    if [ ! -d "apps/frontend/node_modules" ]; then
        echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
        cd apps/frontend && npm install && cd ../..
    fi

    echo -e "${GREEN}✅ Dependencies checked${NC}"
}

# Function to check environment variables
check_environment() {
    echo -e "${BLUE}🔧 Checking environment configuration...${NC}"

    if [ ! -f "apps/api-server/.env" ]; then
        echo -e "${YELLOW}⚠️  Creating .env file from template...${NC}"
        cp apps/api-server/.env.example apps/api-server/.env
        echo -e "${YELLOW}📝 Please edit apps/api-server/.env and set your OPENAI_API_KEY${NC}"
    fi

    if [ ! -f "apps/frontend/.env" ]; then
        echo -e "${YELLOW}⚠️  Creating frontend .env file...${NC}"
        cat > apps/frontend/.env << EOF
# API Configuration
VITE_API_URL=http://localhost:8000

# Development Environment
NODE_ENV=development
EOF
    fi

    echo -e "${GREEN}✅ Environment configuration checked${NC}"
}

# Function to create storage directories
create_directories() {
    echo -e "${BLUE}📁 Creating storage directories...${NC}"

    mkdir -p data/storage
    mkdir -p apps/api-server/data/storage

    echo -e "${GREEN}✅ Storage directories created${NC}"
}

# Function to start the services
start_services() {
    echo -e "${BLUE}🚀 Starting services...${NC}"

    # Create a function to handle cleanup
    cleanup() {
        echo -e "\n${YELLOW}🛑 Shutting down services...${NC}"
        jobs -p | xargs -r kill
        exit 0
    }

    # Set up signal handlers
    trap cleanup SIGINT SIGTERM

    echo -e "${GREEN}🖥️  Starting Next.js API Server (port 8000)...${NC}"
    cd apps/api-server
    npm run dev &
    API_PID=$!
    cd ../..

    echo -e "${GREEN}🌐 Starting React Frontend (port 5173)...${NC}"
    cd apps/frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ../..

    echo -e "${GREEN}✅ Services started successfully!${NC}"
    echo ""
    echo -e "${BLUE}📊 Service Status:${NC}"
    echo -e "  🖥️  API Server:  ${GREEN}http://localhost:8000${NC}"
    echo -e "  🌐 Frontend:    ${GREEN}http://localhost:5173${NC}"
    echo ""
    echo -e "${BLUE}📚 API Endpoints:${NC}"
    echo -e "  💬 Chat:        ${GREEN}http://localhost:8000/api/chat${NC}"
    echo -e "  📐 Volume:      ${GREEN}http://localhost:8000/api/spatial/volume${NC}"
    echo -e "  📏 Area:        ${GREEN}http://localhost:8000/api/spatial/area${NC}"
    echo -e "  📁 Files:       ${GREEN}http://localhost:8000/api/files${NC}"
    echo -e "  🔄 Sessions:    ${GREEN}http://localhost:8000/api/sessions${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Remember to set your OPENAI_API_KEY in apps/api-server/.env${NC}"
    echo -e "${BLUE}🔧 Press Ctrl+C to stop all services${NC}"
    echo ""

    # Wait for services to be ready
    sleep 3

    # Check if services are running
    echo -e "${BLUE}🔍 Checking service health...${NC}"

    # Wait for API server to be ready
    for i in {1..30}; do
        if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ API Server is ready${NC}"
            break
        fi
        if [ $i -eq 30 ]; then
            echo -e "${RED}❌ API Server failed to start${NC}"
        fi
        sleep 1
    done

    # Check frontend
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is ready${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend may still be starting...${NC}"
    fi

    echo ""
    echo -e "${GREEN}🎉 CoDrone with Vercel AI SDK is now running!${NC}"
    echo -e "${BLUE}🌐 Open your browser to: ${GREEN}http://localhost:5173${NC}"
    echo ""

    # Wait for both services
    wait
}

# Main execution
main() {
    echo -e "${GREEN}🎯 CoDrone - Vercel AI SDK Migration${NC}"
    echo -e "${BLUE}======================================${NC}"
    echo ""

    check_dependencies
    check_environment
    create_directories
    start_services
}

# Check if we're in the right directory
if [ ! -f "apps/api-server/package.json" ] || [ ! -f "apps/frontend/package.json" ]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

# Run main function
main
