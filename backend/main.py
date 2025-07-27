"""
Canopy Copilot - Main FastAPI Application
AI-first photogrammetry platform for drone prosumers
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
from contextlib import asynccontextmanager

from api.routes import upload, projects, maps, canvas, agent, auth
from db.database import init_db
from utils.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print("🚀 Starting Canopy Copilot...")
    await init_db()
    print("✅ Database initialized")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down Canopy Copilot...")


# Create FastAPI app
app = FastAPI(
    title="Canopy Copilot",
    description="AI-first photogrammetry platform for drone prosumers",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploaded images
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include API routes
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(upload.router, prefix="/api/upload", tags=["File Upload"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(maps.router, prefix="/api/maps", tags=["Maps"])
app.include_router(canvas.router, prefix="/api/canvas", tags=["Canvas"])
app.include_router(agent.router, prefix="/api/agent", tags=["AI Agent"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Canopy Copilot 🌱",
        "version": "1.0.0",
        "docs": "/docs",
        "description": "AI-first photogrammetry platform for drone prosumers"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "canopy-copilot"}


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Global HTTP exception handler"""
    return {
        "error": exc.detail,
        "status_code": exc.status_code,
        "path": request.url.path
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )