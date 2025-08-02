"""
Canopy Copilot API Server

FastAPI backend with LangChain agent integration for drone data analysis.
Supports chat, tool calling, memory, and file uploads.
"""

import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import aiofiles  # type: ignore[import-untyped]
from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.memory import ConversationBufferMemory
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

# Load environment variables
load_dotenv()

# Add packages to path for tool imports
project_root = Path(__file__).parent.parent.parent
packages_path = project_root / "packages"
sys.path.insert(0, str(packages_path))

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "./data/storage"))
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
API_PORT = int(os.getenv("API_PORT", "8000"))

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is required")

# Ensure upload directory exists
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# FastAPI app setup
app = FastAPI(
    title="Canopy Copilot API",
    description="AI-first drone data copilot with chat and automation",
    version="1.0.0",
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
    ],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class ChatMessage(BaseModel):
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")
    timestamp: Optional[datetime] = Field(default_factory=datetime.now)


class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., description="Chat message history")
    session_id: Optional[str] = Field(
        default="default", description="Session identifier"
    )
    file_attachments: Optional[List[str]] = Field(
        default=[], description="Uploaded file paths"
    )


class ChatResponse(BaseModel):
    message: str = Field(..., description="AI response message")
    tool_calls: List[Dict[str, Any]] = Field(default=[], description="Tool calls made")
    session_id: str = Field(..., description="Session identifier")
    timestamp: datetime = Field(default_factory=datetime.now)


class FileUploadResponse(BaseModel):
    filename: str = Field(..., description="Original filename")
    filepath: str = Field(..., description="Stored file path")
    size: int = Field(..., description="File size in bytes")
    upload_time: datetime = Field(default_factory=datetime.now)


# Spatial processing models
class SpatialCalculationRequest(BaseModel):
    polygon_coordinates: str = Field(..., description="GeoJSON polygon as string")
    measurement_name: str = Field(
        default="Measurement", description="Name for the measurement"
    )


class VolumeCalculationRequest(SpatialCalculationRequest):
    dsm_file_path: str = Field(..., description="Path to DSM file")
    base_elevation: Optional[float] = Field(
        None, description="Base elevation for volume calculation"
    )


class AreaCalculationRequest(SpatialCalculationRequest):
    coordinate_system: str = Field(
        default="EPSG:4326", description="Coordinate system EPSG code"
    )


class ElevationAnalysisRequest(SpatialCalculationRequest):
    dsm_file_path: str = Field(..., description="Path to DSM file")


# Session management
sessions: Dict[str, ConversationBufferMemory] = {}


def get_available_tools() -> List[Any]:
    """Get available tools for the agent."""
    try:
        from agent_tools.tool_registry import tools

        return list(tools)
    except ImportError:
        return []


def get_or_create_memory(session_id: str) -> ConversationBufferMemory:
    """Get or create conversation memory for a session."""
    if session_id not in sessions:
        sessions[session_id] = ConversationBufferMemory(
            memory_key="chat_history", return_messages=True, output_key="output"
        )
    return sessions[session_id]


def create_agent_executor(session_id: str) -> AgentExecutor:
    """Create a LangChain agent executor with tools."""
    # Initialize LLM
    llm = ChatOpenAI(
        temperature=0.1, openai_api_key=OPENAI_API_KEY, model_name="gpt-4"
    )  # type: ignore[call-arg]

    # Get available tools
    available_tools = get_available_tools()

    # Create agent prompt
    system_prompt = """You are an AI-powered drone data analysis assistant with advanced spatial analysis capabilities. You have access to various tools for volume calculation, area measurement, and photogrammetry processing.  # noqa: E501

SPATIAL TOOLS USAGE:
The following tools require GeoJSON polygon coordinates in string format:

1. calculate_polygon_area(polygon_coordinates: str, coordinate_system: str,
   measurement_name: str)
   - polygon_coordinates: Must be a valid GeoJSON polygon as JSON string
   - Example: '{{"type": "Polygon", "coordinates": [[[lon1, lat1], [lon2, lat2], [lon3, lat3], [lon1, lat1]]]}}'  # noqa: E501
   - Returns area in square meters, hectares, and acres

2. calculate_volume_from_polygon(polygon_coordinates: str, dsm_file_path: str,
   base_elevation: float, measurement_name: str)
   - polygon_coordinates: Same GeoJSON format as above
   - dsm_file_path: Path to DSM (Digital Surface Model) file
   - base_elevation: Reference elevation for volume calculation
   - Returns volume in cubic meters with detailed statistics

3. analyze_elevation_profile(polygon_coordinates: str, dsm_file_path: str,
   measurement_name: str)
   - polygon_coordinates: Same GeoJSON format as above
   - dsm_file_path: Path to DSM file
   - Returns elevation statistics within the polygon

IMPORTANT RULES:
- NEVER use placeholder text like "Polygon 2" or "the polygon" as
  polygon_coordinates
- ALWAYS require actual GeoJSON coordinates from the user or map component
- If user mentions "measure the area of that polygon" or similar, ask them to
  provide the polygon coordinates
- If coordinates are not provided, explain that you need the actual polygon data
  to perform calculations
- For map-based interactions, the frontend should provide the coordinates
  automatically

EXAMPLE INTERACTIONS:
User: "Calculate the area of this polygon"
Assistant: "I need the actual polygon coordinates to calculate the area. Could you
  please provide the GeoJSON coordinates of the polygon you'd like me to measure?"

User: "Measure the volume of that pile"
Assistant: "I need the polygon coordinates that define the boundary of the pile,
  plus the path to the DSM file. Could you provide the polygon coordinates and
  DSM file path?"

User: "What's the area of polygon 2?"
Assistant: "I cannot calculate the area without the actual polygon coordinates.
  'Polygon 2' is not valid coordinate data. Please provide the GeoJSON
  coordinates of the polygon you want me to measure."

Be helpful, accurate, and explain technical concepts clearly. Always validate that
  you have proper coordinate data before attempting spatial calculations."""

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ]
    )

    # Create agent
    agent = create_openai_functions_agent(llm, available_tools, prompt)

    # Get memory for this session
    memory = get_or_create_memory(session_id)

    # Create agent executor
    return AgentExecutor(
        agent=agent,
        tools=available_tools,
        memory=memory,
        verbose=True,
        return_intermediate_steps=True,
        handle_parsing_errors=True,
        output_key="output",  # type: ignore[call-arg]
    )


@app.get("/")  # type: ignore
async def root() -> Dict[str, str]:
    """Root endpoint."""
    return {"message": "Canopy Copilot API is running"}


@app.get("/health")  # type: ignore
async def health_check() -> Dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.post("/chat", response_model=ChatResponse)  # type: ignore
async def chat_endpoint(request: ChatRequest) -> ChatResponse:
    """Process chat messages with the AI agent."""
    try:
        # Create agent executor for this session
        session_id = request.session_id or "default"
        agent_executor = create_agent_executor(session_id)

        # Get the latest user message
        if not request.messages:
            raise HTTPException(status_code=400, detail="No messages provided")

        latest_message = request.messages[-1]
        if latest_message.role != "user":
            raise HTTPException(
                status_code=400, detail="Latest message must be from user"
            )

        # Add context about file attachments if any
        context_message = latest_message.content
        if request.file_attachments:
            context_message += (
                f"\n\nAttached files: {', '.join(request.file_attachments)}"
            )

        # Run the agent
        result = agent_executor.invoke({"input": context_message})

        # Extract tool calls from intermediate steps
        tool_calls = []
        if "intermediate_steps" in result:
            for step in result["intermediate_steps"]:
                if len(step) >= 2:
                    action, observation = step[0], step[1]
                    tool_calls.append(
                        {
                            "tool": action.tool,
                            "input": action.tool_input,
                            "output": str(observation),
                        }
                    )

        return ChatResponse(
            message=result["output"],
            tool_calls=tool_calls,
            session_id=session_id,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat processing error: {str(e)}")


# Spatial processing endpoints
@app.post("/api/spatial/volume")  # type: ignore
async def calculate_volume_endpoint(
    request: VolumeCalculationRequest,
) -> Dict[str, Any]:
    """Calculate volume from polygon and DSM data."""
    try:
        from agent_tools.spatial_tools import calculate_volume_from_polygon

        # Call the spatial tool directly using invoke method
        result_str = calculate_volume_from_polygon.invoke(
            {
                "polygon_coordinates": request.polygon_coordinates,
                "dsm_file_path": request.dsm_file_path,
                "base_elevation": request.base_elevation,
                "measurement_name": request.measurement_name,
            }
        )

        # Parse the JSON result
        import json

        result: Dict[str, Any] = json.loads(result_str)

        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        return result

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Volume calculation error: {str(e)}"
        )


@app.post("/api/spatial/area")  # type: ignore
async def calculate_area_endpoint(request: AreaCalculationRequest) -> Dict[str, Any]:
    """Calculate area from polygon coordinates."""
    try:
        from agent_tools.spatial_tools import calculate_polygon_area

        # Call the spatial tool directly using invoke method
        result_str = calculate_polygon_area.invoke(
            {
                "polygon_coordinates": request.polygon_coordinates,
                "coordinate_system": request.coordinate_system,
                "measurement_name": request.measurement_name,
            }
        )

        # Parse the JSON result
        import json

        result: Dict[str, Any] = json.loads(result_str)

        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Area calculation error: {str(e)}")


@app.post("/api/spatial/elevation")  # type: ignore
async def analyze_elevation_endpoint(
    request: ElevationAnalysisRequest,
) -> Dict[str, Any]:
    """Analyze elevation profile within polygon."""
    try:
        from agent_tools.spatial_tools import analyze_elevation_profile

        # Call the spatial tool directly using invoke method
        result_str = analyze_elevation_profile.invoke(
            {
                "polygon_coordinates": request.polygon_coordinates,
                "dsm_file_path": request.dsm_file_path,
                "measurement_name": request.measurement_name,
            }
        )

        # Parse the JSON result
        import json

        result: Dict[str, Any] = json.loads(result_str)

        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        return result

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Elevation analysis error: {str(e)}"
        )


@app.post("/upload", response_model=FileUploadResponse)  # type: ignore
async def upload_file(file: UploadFile = File(...)) -> FileUploadResponse:
    """Upload a file for processing."""
    try:
        # Validate file size
        if file.size and file.size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE} bytes",
            )

        # Create unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_filename = f"{timestamp}_{file.filename}"
        filepath = UPLOAD_DIR / safe_filename

        # Save file
        async with aiofiles.open(filepath, "wb") as f:
            content = await file.read()
            await f.write(content)

        return FileUploadResponse(
            filename=file.filename or "unknown",
            filepath=str(filepath),
            size=len(content),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload error: {str(e)}")


@app.get("/files")  # type: ignore
async def list_files() -> List[Dict[str, Any]]:
    """List uploaded files."""
    try:
        files = []
        if UPLOAD_DIR.exists():
            for file_path in UPLOAD_DIR.iterdir():
                if file_path.is_file():
                    stat = file_path.stat()
                    files.append(
                        {
                            "filename": file_path.name,
                            "filepath": str(file_path),
                            "size": stat.st_size,
                            "modified": datetime.fromtimestamp(
                                stat.st_mtime
                            ).isoformat(),
                        }
                    )
        return files
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File listing error: {str(e)}")


@app.delete("/files/{filename}")  # type: ignore
async def delete_file(filename: str) -> Dict[str, str]:
    """Delete an uploaded file."""
    try:
        file_path = UPLOAD_DIR / filename
        if file_path.exists() and file_path.is_file():
            file_path.unlink()
            return {"message": f"File {filename} deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="File not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File deletion error: {str(e)}")


@app.get("/tools")  # type: ignore
async def list_tools() -> List[Dict[str, Any]]:
    """List available tools."""
    available_tools = get_available_tools()
    return [
        {
            "name": tool.name,
            "description": tool.description,
            "parameters": getattr(tool, "args", {}),
        }
        for tool in available_tools
    ]


@app.get("/sessions")  # type: ignore
async def list_sessions() -> Dict[str, Any]:
    """List active chat sessions."""
    session_info = {}
    for session_id, memory in sessions.items():
        messages = memory.chat_memory.messages
        session_info[session_id] = {
            "message_count": len(messages),
            "last_activity": (
                messages[-1].additional_kwargs.get("timestamp", "unknown")
                if messages
                else "no messages"
            ),
            "memory_size": len(str(memory.buffer)),
        }
    return session_info


@app.delete("/sessions/{session_id}")  # type: ignore
async def clear_session(session_id: str) -> Dict[str, str]:
    """Clear a specific chat session."""
    if session_id in sessions:
        del sessions[session_id]
        return {"message": f"Session {session_id} cleared"}
    else:
        raise HTTPException(status_code=404, detail="Session not found")


@app.post("/process/async")  # type: ignore
async def start_async_processing(
    background_tasks: BackgroundTasks,
    task_type: str,
    file_paths: List[str],
) -> Dict[str, str]:
    """Start asynchronous processing of drone data."""
    # This is a placeholder for future async processing
    # In production, this would integrate with Celery, Temporal, or similar
    background_tasks.add_task(process_drone_data_async, task_type, file_paths)
    return {
        "message": f"Started async processing for {task_type}",
        "task_id": f"task_{datetime.now().timestamp()}",
    }


async def process_drone_data_async(task_type: str, file_paths: List[str]) -> None:
    """Async processing function placeholder."""
    # This would implement actual async processing logic
    pass


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=API_PORT)
