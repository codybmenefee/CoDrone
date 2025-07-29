"""
Canopy Copilot API Server

FastAPI backend with LangChain agent integration for drone data analysis.
Supports chat, tool calling, memory, and file uploads.
"""

import os
import sys
import json
import aiofiles
from pathlib import Path
from typing import List, Optional, Dict, Any
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Add packages to path for tool imports
sys.path.append(str(Path(__file__).parent.parent.parent / "packages"))

from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.memory import ConversationBufferMemory
from langchain_openai import ChatOpenAI
from langchain.schema import BaseMessage, HumanMessage, AIMessage
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder

# Import our custom tools
from agent_tools.tool_registry import tools

# Load environment variables
load_dotenv()

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
    version="1.0.0"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
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
    session_id: Optional[str] = Field(default="default", description="Session identifier")
    file_attachments: Optional[List[str]] = Field(default=[], description="Uploaded file paths")

class ChatResponse(BaseModel):
    message: str = Field(..., description="AI response message")
    tool_calls: List[Dict[str, Any]] = Field(default=[], description="Tool calls made")
    session_id: str = Field(..., description="Session identifier")
    timestamp: datetime = Field(default_factory=datetime.now)

class FileUploadResponse(BaseModel):
    filename: str
    filepath: str
    size: int
    upload_time: datetime

# Initialize LangChain components
llm = ChatOpenAI(
    model="gpt-4",
    temperature=0.1,
    openai_api_key=OPENAI_API_KEY
)

# Create agent prompt with system message
system_message = """You are Canopy Copilot, an AI assistant specialized in drone data analysis and agricultural insights.

You help users with:
- Analyzing drone imagery and data
- Processing orthomosaics and NDVI data  
- Calculating field areas and measurements
- Generating reports and insights
- Estimating processing times
- Managing drone workflows

Be helpful, precise, and use the available tools when appropriate. Always explain your reasoning when using tools.

When users upload files, acknowledge them and offer relevant analysis options.
"""

prompt = ChatPromptTemplate.from_messages([
    ("system", system_message),
    MessagesPlaceholder(variable_name="chat_history"),
    ("user", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

# Create agent
agent = create_openai_functions_agent(llm, tools, prompt)

# In-memory session storage (replace with Redis/DB in production)
sessions: Dict[str, ConversationBufferMemory] = {}

def get_or_create_memory(session_id: str) -> ConversationBufferMemory:
    """Get or create conversation memory for a session."""
    if session_id not in sessions:
        sessions[session_id] = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True,
            output_key="output"
        )
    return sessions[session_id]

def create_agent_executor(session_id: str) -> AgentExecutor:
    """Create agent executor with session memory."""
    memory = get_or_create_memory(session_id)
    return AgentExecutor(
        agent=agent,
        tools=tools,
        memory=memory,
        verbose=True,
        return_intermediate_steps=True,
        handle_parsing_errors=True
    )

# API Routes

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "Canopy Copilot API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "tools_available": len(tools),
        "sessions_active": len(sessions)
    }

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Main chat endpoint for conversing with the AI agent.
    """
    try:
        # Create agent executor for this session
        agent_executor = create_agent_executor(request.session_id)
        
        # Get the latest user message
        if not request.messages:
            raise HTTPException(status_code=400, detail="No messages provided")
        
        latest_message = request.messages[-1]
        
        # Add file context if attachments exist
        input_text = latest_message.content
        if request.file_attachments:
            file_context = f"\n\nAttached files: {', '.join(request.file_attachments)}"
            input_text += file_context
        
        # Execute agent
        result = await agent_executor.ainvoke({"input": input_text})
        
        # Extract tool calls from intermediate steps
        tool_calls = []
        if "intermediate_steps" in result:
            for step in result["intermediate_steps"]:
                if len(step) >= 2:
                    action, observation = step
                    tool_calls.append({
                        "tool": action.tool,
                        "input": action.tool_input,
                        "output": observation
                    })
        
        return ChatResponse(
            message=result["output"],
            tool_calls=tool_calls,
            session_id=request.session_id
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

@app.post("/upload", response_model=FileUploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """
    Upload file endpoint for multi-modal input.
    """
    try:
        # Validate file size
        if file.size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413, 
                detail=f"File too large. Maximum size: {MAX_FILE_SIZE/1024/1024:.1f}MB"
            )
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{file.filename}"
        filepath = UPLOAD_DIR / filename
        
        # Save file
        async with aiofiles.open(filepath, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        return FileUploadResponse(
            filename=file.filename,
            filepath=str(filepath),
            size=len(content),
            upload_time=datetime.now()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")

@app.get("/files")
async def list_files():
    """List uploaded files."""
    try:
        files = []
        for file_path in UPLOAD_DIR.iterdir():
            if file_path.is_file():
                stat = file_path.stat()
                files.append({
                    "filename": file_path.name,
                    "size": stat.st_size,
                    "created": datetime.fromtimestamp(stat.st_ctime),
                    "path": str(file_path)
                })
        return {"files": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing files: {str(e)}")

@app.get("/sessions")
async def list_sessions():
    """List active chat sessions."""
    session_info = {}
    for session_id, memory in sessions.items():
        messages = memory.chat_memory.messages
        session_info[session_id] = {
            "message_count": len(messages),
            "last_activity": datetime.now().isoformat(),  # In production, track this properly
            "memory_size": len(str(messages))
        }
    return {"sessions": session_info}

@app.delete("/sessions/{session_id}")
async def clear_session(session_id: str):
    """Clear a specific chat session."""
    if session_id in sessions:
        del sessions[session_id]
        return {"message": f"Session {session_id} cleared"}
    else:
        raise HTTPException(status_code=404, detail="Session not found")

@app.get("/tools")
async def list_tools():
    """List available agent tools."""
    tool_info = []
    for tool in tools:
        tool_info.append({
            "name": tool.name,
            "description": tool.description,
            "parameters": getattr(tool, "args_schema", {})
        })
    return {"tools": tool_info}

# Background task for async processing (placeholder for Phase 2)
@app.post("/process/async")
async def start_async_processing(
    background_tasks: BackgroundTasks,
    task_type: str,
    file_paths: List[str]
):
    """
    Start asynchronous processing task (placeholder for Phase 2).
    """
    # This will be implemented in Phase 2 with Celery/Temporal
    return {
        "task_id": f"task_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "status": "queued",
        "message": "Async processing will be implemented in Phase 2"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=API_PORT,
        reload=True,
        log_level="info"
    )