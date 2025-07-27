"""
AI Agent API routes for Canopy Copilot
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
import json

from agent.tools import AgentTools
from agent.workflow import AgentWorkflow

router = APIRouter()


@router.post("/chat")
async def chat_with_agent(message: Dict[str, Any]):
    """Chat with the AI agent"""
    try:
        user_message = message.get("message", "")
        project_id = message.get("project_id")
        context = message.get("context", {})
        
        if not user_message:
            raise HTTPException(status_code=400, detail="Message is required")
        
        # Initialize agent workflow
        workflow = AgentWorkflow(project_id=project_id)
        
        # Process message through agent
        response = await workflow.process_message(user_message, context)
        
        return {
            "response": response["response"],
            "actions": response.get("actions", []),
            "suggestions": response.get("suggestions", [])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent chat failed: {str(e)}")


@router.post("/tools/draw_polygon")
async def draw_polygon(tool_input: Dict[str, Any]):
    """Agent tool: Draw polygon on map"""
    try:
        coordinates = tool_input.get("coordinates", [])
        label = tool_input.get("label", "Measurement Zone")
        project_id = tool_input.get("project_id")
        
        if not coordinates or not project_id:
            raise HTTPException(status_code=400, detail="Coordinates and project_id required")
        
        # Use agent tools
        tools = AgentTools(project_id)
        result = await tools.draw_polygon(coordinates, label)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Draw polygon failed: {str(e)}")


@router.post("/tools/measure_polygon")
async def measure_polygon(tool_input: Dict[str, Any]):
    """Agent tool: Measure polygon"""
    try:
        polygon_id = tool_input.get("polygon_id")
        measurement_type = tool_input.get("measurement_type", "area")
        
        if not polygon_id:
            raise HTTPException(status_code=400, detail="Polygon ID required")
        
        # Use agent tools
        tools = AgentTools()
        result = await tools.measure_polygon(polygon_id, measurement_type)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Measure polygon failed: {str(e)}")


@router.post("/tools/get_layer_stats")
async def get_layer_stats(tool_input: Dict[str, Any]):
    """Agent tool: Get layer statistics"""
    try:
        layer_id = tool_input.get("layer_id")
        bounds = tool_input.get("bounds")
        project_id = tool_input.get("project_id")
        
        if not layer_id or not project_id:
            raise HTTPException(status_code=400, detail="Layer ID and project_id required")
        
        # Use agent tools
        tools = AgentTools(project_id)
        result = await tools.get_layer_stats(layer_id, bounds)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Get layer stats failed: {str(e)}")


@router.post("/tools/update_canvas_block")
async def update_canvas_block(tool_input: Dict[str, Any]):
    """Agent tool: Update canvas block"""
    try:
        block_id = tool_input.get("block_id")
        content = tool_input.get("content", {})
        project_id = tool_input.get("project_id")
        
        if not block_id or not project_id:
            raise HTTPException(status_code=400, detail="Block ID and project_id required")
        
        # Use agent tools
        tools = AgentTools(project_id)
        result = await tools.update_canvas_block(block_id, content)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Update canvas block failed: {str(e)}")


@router.post("/tools/remix_report")
async def remix_report(tool_input: Dict[str, Any]):
    """Agent tool: Remix/regenerate report"""
    try:
        goal = tool_input.get("goal", "")
        project_id = tool_input.get("project_id")
        
        if not project_id:
            raise HTTPException(status_code=400, detail="Project ID required")
        
        # Use agent tools
        tools = AgentTools(project_id)
        result = await tools.remix_report(goal)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Remix report failed: {str(e)}")


@router.post("/tools/generate_caption")
async def generate_caption(tool_input: Dict[str, Any]):
    """Agent tool: Generate image caption"""
    try:
        image_url = tool_input.get("image_url", "")
        context = tool_input.get("context", "")
        
        if not image_url:
            raise HTTPException(status_code=400, detail="Image URL required")
        
        # Use agent tools
        tools = AgentTools()
        result = await tools.generate_caption(image_url, context)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generate caption failed: {str(e)}")


@router.post("/tools/export_pdf")
async def export_pdf(tool_input: Dict[str, Any]):
    """Agent tool: Export report to PDF"""
    try:
        report_id = tool_input.get("report_id")
        options = tool_input.get("options", {})
        
        if not report_id:
            raise HTTPException(status_code=400, detail="Report ID required")
        
        # Use agent tools
        tools = AgentTools()
        result = await tools.export_pdf(report_id, options)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export PDF failed: {str(e)}")


@router.get("/tools")
async def list_available_tools():
    """List all available agent tools"""
    return {
        "tools": [
            {
                "name": "draw_polygon",
                "description": "Draw a polygon on the map for measurements",
                "parameters": ["coordinates", "label", "project_id"]
            },
            {
                "name": "measure_polygon",
                "description": "Calculate measurements for a polygon",
                "parameters": ["polygon_id", "measurement_type"]
            },
            {
                "name": "get_layer_stats",
                "description": "Get statistics for a raster layer",
                "parameters": ["layer_id", "bounds", "project_id"]
            },
            {
                "name": "update_canvas_block",
                "description": "Update content in a canvas block",
                "parameters": ["block_id", "content", "project_id"]
            },
            {
                "name": "remix_report",
                "description": "Regenerate report based on goal",
                "parameters": ["goal", "project_id"]
            },
            {
                "name": "generate_caption",
                "description": "Generate caption for an image",
                "parameters": ["image_url", "context"]
            },
            {
                "name": "export_pdf",
                "description": "Export report to PDF",
                "parameters": ["report_id", "options"]
            }
        ]
    }