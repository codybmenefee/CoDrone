"""
Canvas API routes for Canopy Copilot
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from datetime import datetime

from db.database import get_mongo_db
from db.models import Report, CanvasBlock

router = APIRouter()


@router.get("/{project_id}")
async def get_canvas(project_id: str):
    """Get canvas data for a project"""
    try:
        db = get_mongo_db()
        
        # Get or create report
        report = await db.reports.find_one({"project_id": project_id})
        
        if not report:
            # Create new report
            report = Report(
                project_id=project_id,
                title="Untitled Report",
                created_by="user_id"  # TODO: Get from auth
            )
            
            result = await db.reports.insert_one(report.dict(by_alias=True))
            report["_id"] = result.inserted_id
        
        return {
            "report_id": str(report["_id"]),
            "title": report["title"],
            "description": report.get("description"),
            "blocks": report.get("blocks", []),
            "metadata": report.get("metadata", {})
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get canvas: {str(e)}")


@router.put("/{project_id}")
async def update_canvas(project_id: str, canvas_data: Dict[str, Any]):
    """Update canvas data"""
    try:
        db = get_mongo_db()
        
        # Find existing report
        report = await db.reports.find_one({"project_id": project_id})
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Update report
        update_data = {
            "title": canvas_data.get("title", report["title"]),
            "description": canvas_data.get("description", report.get("description")),
            "blocks": canvas_data.get("blocks", report.get("blocks", [])),
            "metadata": canvas_data.get("metadata", report.get("metadata", {})),
            "updated_at": datetime.utcnow()
        }
        
        await db.reports.update_one(
            {"_id": report["_id"]},
            {"$set": update_data}
        )
        
        return {"message": "Canvas updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update canvas: {str(e)}")


@router.post("/{project_id}/blocks")
async def add_block(project_id: str, block_data: Dict[str, Any]):
    """Add a new block to the canvas"""
    try:
        db = get_mongo_db()
        
        # Find existing report
        report = await db.reports.find_one({"project_id": project_id})
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Create new block
        block = CanvasBlock(
            type=block_data["type"],
            content=block_data["content"],
            position=block_data.get("position", {"x": 0, "y": 0}),
            size=block_data.get("size", {"width": 200, "height": 200}),
            metadata=block_data.get("metadata")
        )
        
        # Add block to report
        blocks = report.get("blocks", [])
        blocks.append(block.dict())
        
        await db.reports.update_one(
            {"_id": report["_id"]},
            {
                "$set": {
                    "blocks": blocks,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return {
            "block_id": block.id,
            "message": "Block added successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add block: {str(e)}")


@router.put("/{project_id}/blocks/{block_id}")
async def update_block(project_id: str, block_id: str, block_data: Dict[str, Any]):
    """Update a specific block"""
    try:
        db = get_mongo_db()
        
        # Find existing report
        report = await db.reports.find_one({"project_id": project_id})
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Find and update block
        blocks = report.get("blocks", [])
        block_found = False
        
        for i, block in enumerate(blocks):
            if block["id"] == block_id:
                # Update block
                blocks[i].update(block_data)
                blocks[i]["updated_at"] = datetime.utcnow()
                block_found = True
                break
        
        if not block_found:
            raise HTTPException(status_code=404, detail="Block not found")
        
        # Update report
        await db.reports.update_one(
            {"_id": report["_id"]},
            {
                "$set": {
                    "blocks": blocks,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return {"message": "Block updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update block: {str(e)}")


@router.delete("/{project_id}/blocks/{block_id}")
async def delete_block(project_id: str, block_id: str):
    """Delete a specific block"""
    try:
        db = get_mongo_db()
        
        # Find existing report
        report = await db.reports.find_one({"project_id": project_id})
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Remove block
        blocks = report.get("blocks", [])
        blocks = [block for block in blocks if block["id"] != block_id]
        
        # Update report
        await db.reports.update_one(
            {"_id": report["_id"]},
            {
                "$set": {
                    "blocks": blocks,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return {"message": "Block deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete block: {str(e)}")