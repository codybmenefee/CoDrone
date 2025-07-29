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
    filename: str = Field(..., description="Uploaded file name")
    filepath: str = Field(..., description="File path on server")
    size: int = Field(..., description="File size in bytes")
    upload_time: datetime = Field(default_factory=datetime.now)


# In-memory storage for sessions
session_memories: Dict[str, ConversationBufferMemory] = {}


def get_available_tools() -> List[Any]:
    """Get available tools for the agent."""
    try:
        from agent_tools.tool_registry import tools

        return tools
    except ImportError:
        # If import fails, create an empty tools list
        return []


def get_or_create_memory(session_id: str) -> ConversationBufferMemory:
    """Get or create a conversation memory for a session."""
    if session_id not in session_memories:
        session_memories[session_id] = ConversationBufferMemory(
            memory_key="chat_history", return_messages=True, output_key="output"
        )
    return session_memories[session_id]


def create_agent_executor(session_id: str) -> AgentExecutor:
    """Create an agent executor for a session."""
    memory = get_or_create_memory(session_id)

    llm = ChatOpenAI(model="gpt-4", temperature=0.1)

    system_message = """You are Canopy Copilot, an AI assistant specialized in
    drone data analysis and agricultural insights.

    You help users with:
    - Analyzing drone imagery and data
    - Processing orthomosaics and NDVI data
    - Calculating field areas and measurements
    - Generating reports and insights
    - Estimating processing times
    - Managing drone workflows

    Be helpful, precise, and use the available tools when appropriate.
    """

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_message),
            MessagesPlaceholder(variable_name="chat_history"),
            ("user", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ]
    )

    available_tools = get_available_tools()
    agent = create_openai_functions_agent(llm, available_tools, prompt)

    return AgentExecutor(
        agent=agent,
        tools=available_tools,
        memory=memory,
        verbose=True,
        return_intermediate_steps=True,
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
    """Process chat messages and return AI response with tool calls."""
    try:
        # Get or create session memory
        session_id = request.session_id or "default"
        memory = get_or_create_memory(session_id)

        # Add user messages to memory
        for msg in request.messages:
            if msg.role == "user":
                memory.chat_memory.add_user_message(msg.content)

        # Create agent executor
        agent_executor = create_agent_executor(session_id)

        # Get the last user message
        last_message = request.messages[-1].content if request.messages else ""

        # Run the agent
        result = await agent_executor.ainvoke({"input": last_message})

        # Extract tool calls from the result
        tool_calls = []
        if hasattr(result, "intermediate_steps"):
            for step in result.intermediate_steps:
                if len(step) >= 2:
                    tool_calls.append(
                        {
                            "tool": step[0].tool,
                            "input": step[0].tool_input,
                            "output": str(step[1]),
                        }
                    )

        return ChatResponse(
            message=result["output"],
            tool_calls=tool_calls,
            session_id=session_id,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat processing error: {str(e)}")


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
        for filepath in UPLOAD_DIR.glob("*"):
            if filepath.is_file():
                stat = filepath.stat()
                files.append(
                    {
                        "filename": filepath.name,
                        "filepath": str(filepath),
                        "size": stat.st_size,
                        "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    }
                )
        return files
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing files: {str(e)}")


@app.get("/sessions")  # type: ignore
async def list_sessions() -> List[str]:
    """List active session IDs."""
    return list(session_memories.keys())


@app.delete("/sessions/{session_id}")  # type: ignore
async def clear_session(session_id: str) -> Dict[str, str]:
    """Clear a specific session's memory."""
    if session_id in session_memories:
        del session_memories[session_id]
        return {"message": f"Session {session_id} cleared"}
    else:
        raise HTTPException(status_code=404, detail="Session not found")


@app.get("/tools")  # type: ignore
async def list_tools() -> List[Dict[str, Any]]:
    """List available tools."""
    available_tools = get_available_tools()
    return [
        {
            "name": tool.name,
            "description": tool.description,
            "args_schema": (
                str(tool.args_schema) if hasattr(tool, "args_schema") else None
            ),
        }
        for tool in available_tools
    ]


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
    """Background task for processing drone data."""
    # Placeholder implementation
    print(f"Processing {task_type} for files: {file_paths}")
    # Add actual processing logic here


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=API_PORT,
        reload=True,
        log_level="info",
    )
