"""
AI Agent Workflow for Canopy Copilot
"""

import json
from typing import Dict, Any, List, Optional
import logging

from .tools import AgentTools
from utils.config import settings

logger = logging.getLogger(__name__)


class AgentWorkflow:
    """AI Agent workflow orchestrator"""
    
    def __init__(self, project_id: Optional[str] = None):
        self.project_id = project_id
        self.tools = AgentTools(project_id)
        
        # Available tools
        self.available_tools = [
            "draw_polygon",
            "measure_polygon", 
            "get_layer_stats",
            "update_canvas_block",
            "remix_report",
            "generate_caption",
            "export_pdf"
        ]
    
    async def process_message(self, message: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Process a user message through the agent workflow"""
        try:
            # Analyze the message to determine intent
            intent = self._analyze_intent(message)
            
            # Generate response based on intent
            response = await self._generate_response(message, intent, context)
            
            return response
            
        except Exception as e:
            logger.error(f"Failed to process message: {e}")
            return {
                "response": "I'm sorry, I encountered an error processing your request. Please try again.",
                "actions": [],
                "suggestions": []
            }
    
    def _analyze_intent(self, message: str) -> Dict[str, Any]:
        """Analyze user message to determine intent"""
        message_lower = message.lower()
        
        # Simple keyword-based intent detection
        # TODO: Replace with more sophisticated NLP/LLM-based intent detection
        
        if any(word in message_lower for word in ["draw", "create", "add", "polygon"]):
            return {
                "type": "draw_polygon",
                "confidence": 0.8,
                "requires_coordinates": True
            }
        
        elif any(word in message_lower for word in ["measure", "calculate", "area", "volume"]):
            return {
                "type": "measure_polygon",
                "confidence": 0.7,
                "requires_polygon_id": True
            }
        
        elif any(word in message_lower for word in ["stats", "statistics", "analyze", "ndvi"]):
            return {
                "type": "get_layer_stats",
                "confidence": 0.8,
                "requires_layer_id": True
            }
        
        elif any(word in message_lower for word in ["update", "edit", "change", "modify"]):
            return {
                "type": "update_canvas_block",
                "confidence": 0.6,
                "requires_block_id": True
            }
        
        elif any(word in message_lower for word in ["remix", "regenerate", "create report", "generate report"]):
            return {
                "type": "remix_report",
                "confidence": 0.9,
                "requires_goal": True
            }
        
        elif any(word in message_lower for word in ["caption", "describe", "explain image"]):
            return {
                "type": "generate_caption",
                "confidence": 0.7,
                "requires_image_url": True
            }
        
        elif any(word in message_lower for word in ["export", "pdf", "download", "save"]):
            return {
                "type": "export_pdf",
                "confidence": 0.8,
                "requires_report_id": True
            }
        
        else:
            return {
                "type": "general_inquiry",
                "confidence": 0.5,
                "requires_clarification": True
            }
    
    async def _generate_response(self, message: str, intent: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate response based on intent"""
        intent_type = intent["type"]
        
        if intent_type == "draw_polygon":
            return await self._handle_draw_polygon(message, context)
        
        elif intent_type == "measure_polygon":
            return await self._handle_measure_polygon(message, context)
        
        elif intent_type == "get_layer_stats":
            return await self._handle_get_layer_stats(message, context)
        
        elif intent_type == "update_canvas_block":
            return await self._handle_update_canvas_block(message, context)
        
        elif intent_type == "remix_report":
            return await self._handle_remix_report(message, context)
        
        elif intent_type == "generate_caption":
            return await self._handle_generate_caption(message, context)
        
        elif intent_type == "export_pdf":
            return await self._handle_export_pdf(message, context)
        
        else:
            return await self._handle_general_inquiry(message, context)
    
    async def _handle_draw_polygon(self, message: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Handle polygon drawing request"""
        # Extract coordinates from context or message
        coordinates = context.get("coordinates") if context else None
        
        if not coordinates:
            return {
                "response": "I can help you draw a polygon! Please provide the coordinates for the polygon you'd like to create.",
                "actions": [],
                "suggestions": [
                    "Click on the map to draw a polygon",
                    "Provide coordinates in [lat, lng] format",
                    "Use the drawing tool in the map interface"
                ]
            }
        
        # Extract label from message or use default
        label = self._extract_label_from_message(message) or "Measurement Zone"
        
        # Execute tool
        result = await self.tools.draw_polygon(coordinates, label)
        
        if result["success"]:
            return {
                "response": f"✅ {result['message']}",
                "actions": [{
                    "type": "draw_polygon",
                    "data": result
                }],
                "suggestions": [
                    "Measure the area of this polygon",
                    "Analyze NDVI within this zone",
                    "Add this to your report"
                ]
            }
        else:
            return {
                "response": f"❌ Failed to draw polygon: {result['error']}",
                "actions": [],
                "suggestions": ["Try again with different coordinates"]
            }
    
    async def _handle_measure_polygon(self, message: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Handle polygon measurement request"""
        polygon_id = context.get("polygon_id") if context else None
        
        if not polygon_id:
            return {
                "response": "I can help you measure a polygon! Please select a polygon to measure.",
                "actions": [],
                "suggestions": [
                    "Select a polygon on the map",
                    "Provide a polygon ID",
                    "Draw a new polygon to measure"
                ]
            }
        
        # Determine measurement type from message
        measurement_type = self._extract_measurement_type(message)
        
        # Execute tool
        result = await self.tools.measure_polygon(polygon_id, measurement_type)
        
        if result["success"]:
            return {
                "response": f"📏 {result['message']}",
                "actions": [{
                    "type": "measure_polygon",
                    "data": result
                }],
                "suggestions": [
                    "Add this measurement to your report",
                    "Compare with other areas",
                    "Export the results"
                ]
            }
        else:
            return {
                "response": f"❌ Failed to measure polygon: {result['error']}",
                "actions": [],
                "suggestions": ["Try selecting a different polygon"]
            }
    
    async def _handle_get_layer_stats(self, message: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Handle layer statistics request"""
        layer_id = context.get("layer_id") if context else self._extract_layer_id(message)
        
        if not layer_id:
            return {
                "response": "I can analyze layer statistics! Which layer would you like to analyze?",
                "actions": [],
                "suggestions": [
                    "Analyze NDVI layer",
                    "Analyze GNDVI layer", 
                    "Analyze orthomosaic layer"
                ]
            }
        
        bounds = context.get("bounds") if context else None
        
        # Execute tool
        result = await self.tools.get_layer_stats(layer_id, bounds)
        
        if result["success"]:
            stats = result["stats"]
            return {
                "response": f"📊 Statistics for {layer_id} layer:\nMean: {stats['mean']:.3f}, Std: {stats['std']:.3f}, Min: {stats['min']:.3f}, Max: {stats['max']:.3f}",
                "actions": [{
                    "type": "get_layer_stats",
                    "data": result
                }],
                "suggestions": [
                    "Add these statistics to your report",
                    "Compare with other layers",
                    "Create a visualization"
                ]
            }
        else:
            return {
                "response": f"❌ Failed to get layer stats: {result['error']}",
                "actions": [],
                "suggestions": ["Try a different layer"]
            }
    
    async def _handle_update_canvas_block(self, message: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Handle canvas block update request"""
        block_id = context.get("block_id") if context else None
        
        if not block_id:
            return {
                "response": "I can help you update canvas blocks! Please specify which block to update.",
                "actions": [],
                "suggestions": [
                    "Select a block in the canvas",
                    "Provide a block ID",
                    "Create a new block"
                ]
            }
        
        # Extract content from message or context
        content = context.get("content") if context else {"text": message}
        
        # Execute tool
        result = await self.tools.update_canvas_block(block_id, content)
        
        if result["success"]:
            return {
                "response": f"✏️ {result['message']}",
                "actions": [{
                    "type": "update_canvas_block",
                    "data": result
                }],
                "suggestions": [
                    "Preview the updated block",
                    "Add more content",
                    "Save the report"
                ]
            }
        else:
            return {
                "response": f"❌ Failed to update block: {result['error']}",
                "actions": [],
                "suggestions": ["Try a different block"]
            }
    
    async def _handle_remix_report(self, message: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Handle report remix request"""
        goal = context.get("goal") if context else self._extract_goal_from_message(message)
        
        if not goal:
            return {
                "response": "I can help you remix your report! What's your goal for the new report?",
                "actions": [],
                "suggestions": [
                    "Create a summary report",
                    "Focus on NDVI analysis",
                    "Generate a client presentation"
                ]
            }
        
        # Execute tool
        result = await self.tools.remix_report(goal)
        
        if result["success"]:
            return {
                "response": f"🔄 {result['message']}",
                "actions": [{
                    "type": "remix_report",
                    "data": result
                }],
                "suggestions": [
                    "Review the new report",
                    "Make further adjustments",
                    "Export to PDF"
                ]
            }
        else:
            return {
                "response": f"❌ Failed to remix report: {result['error']}",
                "actions": [],
                "suggestions": ["Try a different goal"]
            }
    
    async def _handle_generate_caption(self, message: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Handle image caption generation request"""
        image_url = context.get("image_url") if context else None
        
        if not image_url:
            return {
                "response": "I can help you generate image captions! Please provide an image URL.",
                "actions": [],
                "suggestions": [
                    "Upload an image",
                    "Provide an image URL",
                    "Select an image from your project"
                ]
            }
        
        context_text = context.get("context") if context else ""
        
        # Execute tool
        result = await self.tools.generate_caption(image_url, context_text)
        
        if result["success"]:
            return {
                "response": f"🖼️ {result['caption']}",
                "actions": [{
                    "type": "generate_caption",
                    "data": result
                }],
                "suggestions": [
                    "Add this caption to your report",
                    "Generate a different caption",
                    "Analyze the image further"
                ]
            }
        else:
            return {
                "response": f"❌ Failed to generate caption: {result['error']}",
                "actions": [],
                "suggestions": ["Try a different image"]
            }
    
    async def _handle_export_pdf(self, message: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Handle PDF export request"""
        report_id = context.get("report_id") if context else None
        
        if not report_id:
            return {
                "response": "I can help you export your report to PDF! Please specify which report to export.",
                "actions": [],
                "suggestions": [
                    "Select a report",
                    "Create a new report",
                    "Use the current project report"
                ]
            }
        
        options = context.get("options") if context else {}
        
        # Execute tool
        result = await self.tools.export_pdf(report_id, options)
        
        if result["success"]:
            return {
                "response": f"📄 {result['message']}. Download at: {result['pdf_url']}",
                "actions": [{
                    "type": "export_pdf",
                    "data": result
                }],
                "suggestions": [
                    "Download the PDF",
                    "Share the report",
                    "Create another report"
                ]
            }
        else:
            return {
                "response": f"❌ Failed to export PDF: {result['error']}",
                "actions": [],
                "suggestions": ["Try again later"]
            }
    
    async def _handle_general_inquiry(self, message: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Handle general inquiries"""
        return {
            "response": "I'm here to help you with your photogrammetry project! I can help you draw polygons, measure areas, analyze data, create reports, and more. What would you like to do?",
            "actions": [],
            "suggestions": [
                "Draw a polygon for measurements",
                "Analyze NDVI data",
                "Create a report",
                "Export your work to PDF"
            ]
        }
    
    def _extract_label_from_message(self, message: str) -> Optional[str]:
        """Extract label from message"""
        # Simple extraction - look for quoted text
        import re
        matches = re.findall(r'"([^"]*)"', message)
        return matches[0] if matches else None
    
    def _extract_measurement_type(self, message: str) -> str:
        """Extract measurement type from message"""
        message_lower = message.lower()
        
        if "area" in message_lower:
            return "area"
        elif "volume" in message_lower:
            return "volume"
        elif "ndvi" in message_lower:
            return "ndvi_avg"
        else:
            return "area"  # default
    
    def _extract_layer_id(self, message: str) -> Optional[str]:
        """Extract layer ID from message"""
        message_lower = message.lower()
        
        if "ndvi" in message_lower:
            return "ndvi"
        elif "gndvi" in message_lower:
            return "gndvi"
        elif "orthomosaic" in message_lower or "ortho" in message_lower:
            return "orthomosaic"
        else:
            return None
    
    def _extract_goal_from_message(self, message: str) -> Optional[str]:
        """Extract goal from message"""
        # Look for goal indicators
        goal_indicators = ["goal:", "objective:", "purpose:", "create", "generate", "make"]
        
        for indicator in goal_indicators:
            if indicator in message.lower():
                # Extract text after indicator
                parts = message.lower().split(indicator)
                if len(parts) > 1:
                    return parts[1].strip()
        
        return None