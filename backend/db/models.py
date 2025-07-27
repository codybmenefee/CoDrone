"""
Database models for Canopy Copilot
"""

from datetime import datetime
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
from bson import ObjectId
from enum import Enum
import uuid


class PyObjectId(ObjectId):
    """Custom ObjectId for MongoDB"""
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


class ProjectStatus(str, Enum):
    """Project processing status"""
    UPLOADING = "uploading"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class ProcessingType(str, Enum):
    """Types of processing available"""
    ORTHOMOSAIC = "orthomosaic"
    NDVI = "ndvi"
    GNDVI = "gndvi"
    ELEVATION = "elevation"


# MongoDB Models (Canvas/Reports)

class CanvasBlock(BaseModel):
    """Individual block in a report canvas"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # text, image, chart, map, measurement
    content: Dict[str, Any]
    position: Dict[str, int]  # x, y coordinates
    size: Dict[str, int]  # width, height
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Report(BaseModel):
    """Report document stored in MongoDB"""
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    project_id: str
    title: str
    description: Optional[str] = None
    blocks: List[CanvasBlock] = []
    metadata: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str
    is_public: bool = False

    class Config:
        allow_population_by_field_name = True
        json_encoders = {ObjectId: str}


class Project(BaseModel):
    """Project document stored in MongoDB"""
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    description: Optional[str] = None
    status: ProjectStatus = ProjectStatus.UPLOADING
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # File references
    image_files: List[str] = []  # S3 keys
    orthomosaic_file: Optional[str] = None
    ndvi_file: Optional[str] = None
    gndvi_file: Optional[str] = None
    elevation_file: Optional[str] = None
    
    # Processing metadata
    processing_jobs: List[str] = []  # Celery job IDs
    processing_metadata: Dict[str, Any] = {}
    
    # Project settings
    settings: Dict[str, Any] = {}

    class Config:
        allow_population_by_field_name = True
        json_encoders = {ObjectId: str}


class User(BaseModel):
    """User document stored in MongoDB"""
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    email: str
    username: str
    full_name: Optional[str] = None
    hashed_password: str
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # User preferences
    preferences: Dict[str, Any] = {}
    
    # Subscription/plan info
    plan: str = "free"
    plan_expires_at: Optional[datetime] = None

    class Config:
        allow_population_by_field_name = True
        json_encoders = {ObjectId: str}


# PostgreSQL Models (Spatial Data)

class Polygon(BaseModel):
    """Spatial polygon for measurements"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    name: str
    description: Optional[str] = None
    geometry: str  # GeoJSON string
    properties: Dict[str, Any] = {}
    created_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Measurement(BaseModel):
    """Measurement data for polygons"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    polygon_id: str
    measurement_type: str  # area, volume, ndvi_avg, etc.
    value: float
    unit: str
    metadata: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Layer(BaseModel):
    """Raster layer metadata"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    name: str
    layer_type: str  # orthomosaic, ndvi, gndvi, elevation
    file_path: str  # S3 key
    bounds: List[float]  # [min_lat, min_lng, max_lat, max_lng]
    resolution: Optional[float] = None
    crs: str = "EPSG:4326"
    metadata: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)