"""
File upload API routes for Canopy Copilot
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from fastapi.responses import JSONResponse
from typing import List, Optional
import aiofiles
import os
import uuid
from datetime import datetime

from db.database import get_mongo_db
from db.models import Project, ProjectStatus
from utils.storage import storage_manager
from utils.config import settings

router = APIRouter()


@router.post("/images")
async def upload_images(
    files: List[UploadFile] = File(...),
    project_name: str = Form(...),
    project_description: Optional[str] = Form(None),
    user_id: str = Form(...)  # TODO: Get from auth token
):
    """
    Upload drone images and create a new project
    """
    try:
        # Validate files
        if not files:
            raise HTTPException(status_code=400, detail="No files provided")
        
        if len(files) < 3:
            raise HTTPException(
                status_code=400, 
                detail="At least 3 images required for photogrammetry"
            )
        
        # Validate file types and sizes
        for file in files:
            if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid file type: {file.content_type}"
                )
            
            if file.size > settings.MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail=f"File too large: {file.filename}"
                )
        
        # Create project
        db = get_mongo_db()
        project = Project(
            name=project_name,
            description=project_description,
            created_by=user_id,
            status=ProjectStatus.UPLOADING
        )
        
        # Insert project into database
        result = await db.projects.insert_one(project.dict(by_alias=True))
        project_id = str(result.inserted_id)
        
        # Upload files to S3
        uploaded_files = []
        for file in files:
            # Generate S3 key
            s3_key = storage_manager.generate_s3_key(
                project_id, "images", file.filename
            )
            
            # Save file temporarily
            temp_path = os.path.join(settings.TEMP_DIR, f"temp_{uuid.uuid4()}")
            async with aiofiles.open(temp_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            # Upload to S3
            upload_result = await storage_manager.upload_file(
                temp_path, s3_key, file.content_type
            )
            
            # Clean up temp file
            os.remove(temp_path)
            
            uploaded_files.append(upload_result["s3_key"])
        
        # Update project with file references
        await db.projects.update_one(
            {"_id": result.inserted_id},
            {
                "$set": {
                    "image_files": uploaded_files,
                    "status": ProjectStatus.PROCESSING,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # TODO: Trigger ODM processing job
        # await trigger_odm_processing(project_id, uploaded_files)
        
        return JSONResponse({
            "project_id": project_id,
            "message": "Images uploaded successfully",
            "files_uploaded": len(uploaded_files),
            "status": "processing"
        })
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/status/{project_id}")
async def get_upload_status(project_id: str):
    """
    Get upload and processing status for a project
    """
    try:
        db = get_mongo_db()
        project = await db.projects.find_one({"_id": project_id})
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        return {
            "project_id": project_id,
            "status": project["status"],
            "files_count": len(project.get("image_files", [])),
            "created_at": project["created_at"],
            "updated_at": project["updated_at"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get status: {str(e)}")


@router.delete("/project/{project_id}")
async def delete_project(project_id: str):
    """
    Delete a project and all associated files
    """
    try:
        db = get_mongo_db()
        
        # Get project
        project = await db.projects.find_one({"_id": project_id})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Delete files from S3
        files_to_delete = []
        files_to_delete.extend(project.get("image_files", []))
        
        if project.get("orthomosaic_file"):
            files_to_delete.append(project["orthomosaic_file"])
        if project.get("ndvi_file"):
            files_to_delete.append(project["ndvi_file"])
        if project.get("gndvi_file"):
            files_to_delete.append(project["gndvi_file"])
        if project.get("elevation_file"):
            files_to_delete.append(project["elevation_file"])
        
        # Delete files from S3
        for s3_key in files_to_delete:
            await storage_manager.delete_file(s3_key)
        
        # Delete project from database
        await db.projects.delete_one({"_id": project_id})
        
        return {"message": "Project deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete project: {str(e)}")