#!/bin/bash

# Canopy Copilot Development Setup Script
echo "🌱 Setting up Canopy Copilot development environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p backend/static
mkdir -p backend/data
mkdir -p data/sample_images
mkdir -p data/test_rasters

# Create .env file for backend
echo "⚙️ Creating environment configuration..."
cat > backend/.env << EOF
# Database
MONGODB_URL=mongodb://admin:password@localhost:27017
MONGODB_DB=canopy_copilot
POSTGRES_URL=postgresql://user:password@localhost:5432/canopy_copilot

# Storage
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=canopy-copilot
S3_REGION=us-east-1
S3_SECURE=false

# Redis
REDIS_URL=redis://localhost:6379/0

# OpenDroneMap
ODM_URL=http://localhost:3000

# Authentication
SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI/OpenAI (add your keys)
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4

# Mapbox (add your token)
MAPBOX_ACCESS_TOKEN=

# Development
DEBUG=true
ALLOWED_ORIGINS=["http://localhost:3000","http://localhost:5173"]
EOF

# Create .env file for frontend
cat > frontend/.env << EOF
VITE_API_URL=http://localhost:8000
VITE_MAPBOX_TOKEN=
EOF

echo "🐳 Starting Docker services..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 30

echo "🔧 Setting up MinIO bucket..."
# Create MinIO bucket using mc client
docker run --rm --network canopy-copilot_canopy-network \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/mc:latest \
  mb minio/canopy-copilot --ignore-existing

echo "✅ Setup complete!"
echo ""
echo "🚀 Services running:"
echo "  • Frontend: http://localhost:3000"
echo "  • Backend API: http://localhost:8000"
echo "  • API Docs: http://localhost:8000/docs"
echo "  • MinIO Console: http://localhost:9001"
echo "  • MongoDB: localhost:27017"
echo "  • PostgreSQL: localhost:5432"
echo "  • Redis: localhost:6379"
echo "  • OpenDroneMap: http://localhost:3000"
echo ""
echo "📝 Next steps:"
echo "  1. Add your OpenAI API key to backend/.env"
echo "  2. Add your Mapbox token to frontend/.env"
echo "  3. Visit http://localhost:3000 to start using Canopy Copilot"
echo ""
echo "🛠️ Development commands:"
echo "  • View logs: docker-compose logs -f"
echo "  • Stop services: docker-compose down"
echo "  • Restart services: docker-compose restart"