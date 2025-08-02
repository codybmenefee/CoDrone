#!/bin/bash

# 🚀 Quick Setup Script for Report Generation Feature Testing
# This script sets up the testing environment for the report generation feature

set -e  # Exit on any error

echo "🚁 Setting up Canopy Copilot Report Generation Testing Environment"
echo "================================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js $(node --version) is installed"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

print_success "npm $(npm --version) is installed"

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
print_success "Python $PYTHON_VERSION is installed"

# Check if we're in the right directory
if [ ! -f "demo_report_generation.py" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_success "All prerequisites met!"

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd apps/frontend

if [ ! -d "node_modules" ]; then
    print_status "Installing npm packages (this may take a few minutes)..."
    npm install
    print_success "Frontend dependencies installed"
else
    print_success "Frontend dependencies already installed"
fi

cd ../..

# Check for virtual environment
print_status "Checking Python virtual environment..."

if [ -d "venv" ]; then
    print_success "Virtual environment found"
    source venv/bin/activate
else
    print_warning "No virtual environment found. Creating one..."
    python3 -m venv venv
    source venv/bin/activate
    print_success "Virtual environment created and activated"
fi

# Install backend dependencies
print_status "Installing backend dependencies..."
cd apps/api-server

# Check if requirements.txt exists and install from it
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
else
    # Install individual packages
    pip install fastapi uvicorn aiofiles python-multipart
    print_warning "weasyprint may require system dependencies. If PDF export fails, install system packages:"
    print_warning "Ubuntu/Debian: sudo apt-get install python3-cffi python3-brotli libpango-1.0-0 libharfbuzz0b libpangoft2-1.0-0"
    print_warning "macOS: brew install pango"
fi

print_success "Backend dependencies installed"
cd ../..

# Create data directories
print_status "Creating data directories..."
mkdir -p data/reports data/templates data/exports
print_success "Data directories created"

# Test the setup
print_status "Testing the setup..."

# Test frontend build
print_status "Testing frontend build..."
cd apps/frontend
if npm run build --silent; then
    print_success "Frontend builds successfully"
else
    print_error "Frontend build failed"
    exit 1
fi
cd ../..

# Test backend imports
print_status "Testing backend imports..."
cd apps/api-server
if python3 -c "import fastapi, aiofiles; print('Backend imports successful')" 2>/dev/null; then
    print_success "Backend imports successful"
else
    print_error "Backend imports failed"
    exit 1
fi
cd ../..

print_success "Setup completed successfully!"

# Create start script
print_status "Creating start script..."
cat > start_testing.sh << 'EOF'
#!/bin/bash

# Start script for testing the report generation feature

echo "🚁 Starting Canopy Copilot Report Generation Testing Environment"
echo "================================================================"

# Function to cleanup on exit
cleanup() {
    echo "Shutting down services..."
    pkill -f "python.*main.py" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend
echo "Starting backend API server..."
cd apps/api-server
python main.py &
BACKEND_PID=$!
cd ../..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "Starting frontend development server..."
cd apps/frontend
npm run dev &
FRONTEND_PID=$!
cd ../..

echo ""
echo "✅ Services started successfully!"
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for user to stop
wait
EOF

chmod +x start_testing.sh
print_success "Start script created: ./start_testing.sh"

# Create test data
print_status "Creating test data..."
cat > test_data.json << 'EOF'
{
  "test_reports": [
    {
      "id": "test_crop_health_001",
      "title": "Test Crop Health Report",
      "template_id": "crop-health-basic",
      "data": {
        "analysisResults": {
          "area": 45.7,
          "ndvi_average": 0.75,
          "vegetation_health": "Good"
        },
        "metadata": {
          "location": "Test Farm A",
          "date": "2024-01-15",
          "resolution": "2.3 cm/pixel",
          "imageCount": 342
        }
      }
    },
    {
      "id": "test_volume_001",
      "title": "Test Volume Measurement Report",
      "template_id": "volume-basic",
      "data": {
        "analysisResults": {
          "volume": 1234.5,
          "accuracy": "±2.5%",
          "material_type": "Gravel"
        },
        "metadata": {
          "location": "Test Quarry B",
          "date": "2024-01-16",
          "resolution": "3.1 cm/pixel",
          "imageCount": 156
        }
      }
    }
  ]
}
EOF

print_success "Test data created: test_data.json"

echo ""
echo "🎉 SETUP COMPLETE!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Run: ./start_testing.sh"
echo "2. Open: http://localhost:5173"
echo "3. Follow the testing guide: testing_guide.md"
echo ""
echo "Quick test commands:"
echo "• Test backend: curl http://localhost:8000/reports/templates"
echo "• Test frontend: open http://localhost:5173"
echo "• View API docs: open http://localhost:8000/docs"
echo ""
echo "Happy testing! 🚀"
