"""
Maps API routes for Canopy Copilot
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from datetime import datetime

from db.database import get_mongo_db, get_pg_session
from db.models import Polygon, Measurement, Layer

router = APIRouter()


@router.get("/{project_id}/layers")
async def get_project_layers(project_id: str):
    """Get all layers for a project"""
    try:
        db = get_mongo_db()
        project = await db.projects.find_one({"_id": project_id})
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        layers = []
        
        # Add orthomosaic layer if available
        if project.get("orthomosaic_file"):
            layers.append({
                "id": "orthomosaic",
                "name": "Orthomosaic",
                "type": "orthomosaic",
                "file_path": project["orthomosaic_file"],
                "visible": True
            })
        
        # Add NDVI layer if available
        if project.get("ndvi_file"):
            layers.append({
                "id": "ndvi",
                "name": "NDVI",
                "type": "ndvi",
                "file_path": project["ndvi_file"],
                "visible": False
            })
        
        # Add GNDVI layer if available
        if project.get("gndvi_file"):
            layers.append({
                "id": "gndvi",
                "name": "GNDVI",
                "type": "gndvi",
                "file_path": project["gndvi_file"],
                "visible": False
            })
        
        return {"layers": layers}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get layers: {str(e)}")


@router.post("/{project_id}/polygons")
async def create_polygon(project_id: str, polygon_data: Dict[str, Any]):
    """Create a new polygon for measurements"""
    try:
        # Validate project exists
        db = get_mongo_db()
        project = await db.projects.find_one({"_id": project_id})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Create polygon
        polygon = Polygon(
            project_id=project_id,
            name=polygon_data["name"],
            description=polygon_data.get("description"),
            geometry=polygon_data["geometry"],
            properties=polygon_data.get("properties", {}),
            created_by=polygon_data["created_by"]
        )
        
        # Store in PostgreSQL (for spatial queries)
        # TODO: Implement PostgreSQL storage
        
        return {
            "polygon_id": polygon.id,
            "message": "Polygon created successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create polygon: {str(e)}")


@router.get("/{project_id}/polygons")
async def get_project_polygons(project_id: str):
    """Get all polygons for a project"""
    try:
        # Validate project exists
        db = get_mongo_db()
        project = await db.projects.find_one({"_id": project_id})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # TODO: Get polygons from PostgreSQL
        polygons = []
        
        return {"polygons": polygons}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get polygons: {str(e)}")


@router.post("/polygons/{polygon_id}/measure")
async def measure_polygon(polygon_id: str, measurement_type: str):
    """Calculate measurements for a polygon"""
    try:
        # TODO: Implement measurement calculation
        # This would involve:
        # 1. Getting polygon geometry from PostgreSQL
        # 2. Loading raster data (NDVI, elevation, etc.)
        # 3. Calculating statistics within the polygon
        # 4. Storing results
        
        measurement = {
            "polygon_id": polygon_id,
            "measurement_type": measurement_type,
            "value": 0.0,
            "unit": "unknown",
            "metadata": {}
        }
        
        return measurement
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to measure polygon: {str(e)}")


@router.get("/polygons/{polygon_id}/measurements")
async def get_polygon_measurements(polygon_id: str):
    """Get all measurements for a polygon"""
    try:
        # TODO: Get measurements from database
        measurements = []
        
        return {"measurements": measurements}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get measurements: {str(e)}")