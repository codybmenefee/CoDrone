"""
Configuration settings for Canopy Copilot API Server
"""

import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = True
    log_level: str = "INFO"
    
    # OpenAI Configuration
    openai_api_key: str
    openai_model: str = "gpt-4"
    openai_temperature: float = 0.1
    
    # File Upload Configuration
    upload_dir: Path = Path("./data/storage")
    max_file_size: int = 50 * 1024 * 1024  # 50MB
    allowed_file_types: List[str] = [
        ".jpg", ".jpeg", ".png", ".tiff", ".tif",
        ".pdf", ".txt", ".csv", ".json", ".geojson",
        ".shp", ".kml", ".kmz"
    ]
    
    # CORS Configuration
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ]
    
    # Session Configuration
    session_timeout: int = 3600  # 1 hour
    max_sessions: int = 1000
    
    # Future Database Configuration
    database_url: str = ""
    redis_url: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Create global settings instance
settings = Settings()

# Ensure upload directory exists
settings.upload_dir.mkdir(parents=True, exist_ok=True)