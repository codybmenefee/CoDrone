"""
Projects API routes for Canopy Copilot
"""

from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime

from db.database import get_mongo_db
from db.models import Project, ProjectStatus

router = APIRouter()


@router.get("/")
async def list_projects(user_id: str):
    """List all projects for a user"""
    try:
        db = get_mongo_db()
        projects = await db.projects.find(
            {"created_by": user_id}
        ).sort("created_at", -1).to_list(length=100)
        
        return {
            "projects": projects,
            "count": len(projects)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list projects: {str(e)}")


@router.get("/{project_id}")
async def get_project(project_id: str):
    """Get project details"""
    try:
        db = get_mongo_db()
        project = await db.projects.find_one({"_id": project_id})
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        return project
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get project: {str(e)}")


@router.put("/{project_id}")
async def update_project(project_id: str, updates: dict):
    """Update project metadata"""
    try:
        db = get_mongo_db()
        
        # Add updated_at timestamp
        updates["updated_at"] = datetime.utcnow()
        
        result = await db.projects.update_one(
            {"_id": project_id},
            {"$set": updates}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Project not found")
        
        return {"message": "Project updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update project: {str(e)}")