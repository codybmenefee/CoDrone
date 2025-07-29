# Agent Context Template

## Project Context

**Project**: CoDrone - AI-First Drone Data Copilot
**Architecture**: Modular monorepo with FastAPI backend + React frontend
**Current Phase**: Phase 1 (Core AI Agent + Chat UI)

## Technical Stack

- **Backend**: FastAPI, LangChain, OpenAI, Python 3.11+
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Agent**: LangChain with OpenAI Functions
- **Tools**: Decorator-based tool registry
- **Storage**: In-memory sessions (Redis planned)

## Code Standards

- **Python**: Black formatting, 88 char line length, type hints
- **TypeScript**: ESLint + Prettier, strict mode
- **Testing**: pytest for backend, vitest for frontend
- **Documentation**: Docstrings, README updates

## Current Architecture

```
apps/
├── api-server/     # FastAPI backend
├── frontend/       # React frontend
packages/
├── agent-tools/    # LangChain tools
data/
└── storage/        # File uploads
```

## Task: Celery Configuration Setup

**Description**: Set up Celery with Redis broker for async background job processing
**Type**: Backend/Infrastructure
**Complexity**: Medium
**Estimated Time**: 4 hours

### 🎯 Task Objective

Implement Celery configuration with Redis broker to enable async background job processing for drone data analysis tasks.

### 📋 Requirements

- [ ] Install Celery and Redis dependencies
- [ ] Configure Celery with Redis broker
- [ ] Set up Celery worker configuration
- [ ] Create basic task structure
- [ ] Integrate with existing FastAPI application
- [ ] Add health check endpoints for Celery
- [ ] Update docker-compose.yml for Redis
- [ ] Add environment variables for Celery configuration

### 🏗️ Implementation Approach

#### 1. Dependencies Installation

Add to `apps/api-server/requirements.txt`:

```
celery[redis]>=5.3.0
redis>=4.5.0
```

#### 2. Celery Configuration

Create `apps/api-server/celery_app.py`:

```python
from celery import Celery
from config import settings

celery_app = Celery(
    "codrone",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["apps.api_server.tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
)
```

#### 3. Task Structure

Create `apps/api-server/tasks/__init__.py` and basic task files:

```python
# apps/api-server/tasks/__init__.py
from .drone_analysis import analyze_drone_data
from .file_processing import process_uploaded_file

__all__ = ["analyze_drone_data", "process_uploaded_file"]
```

#### 4. FastAPI Integration

Update `apps/api-server/main.py` to include Celery health checks:

```python
@app.get("/health/celery")
async def celery_health():
    try:
        # Test Celery connection
        celery_app.control.inspect().active()
        return {"status": "healthy", "celery": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "celery": str(e)}
```

### 🔧 Files to Modify

- `apps/api-server/requirements.txt` - Add Celery and Redis dependencies
- `apps/api-server/config.py` - Add Redis configuration
- `apps/api-server/celery_app.py` - Create new Celery configuration file
- `apps/api-server/tasks/__init__.py` - Create new tasks package
- `apps/api-server/tasks/drone_analysis.py` - Create drone analysis tasks
- `apps/api-server/tasks/file_processing.py` - Create file processing tasks
- `apps/api-server/main.py` - Add Celery health check endpoint
- `docker-compose.yml` - Add Redis service
- `.env.example` - Add Redis environment variables

### 🧪 Testing Requirements

- [ ] Unit tests for Celery configuration
- [ ] Integration tests for task execution
- [ ] Manual testing of Redis connection
- [ ] Test Celery health check endpoint
- [ ] Verify task queue functionality

### 📚 References

- [Celery Documentation](https://docs.celeryq.dev/)
- [Redis Python Client](https://redis-py.readthedocs.io/)
- [FastAPI Background Tasks](https://fastapi.tiangolo.com/tutorial/background-tasks/)
- [Celery with FastAPI](https://docs.celeryq.dev/en/stable/getting-started/first-steps-with-celery.html)

## Constraints & Guidelines

- Maintain existing code patterns and conventions
- Follow established naming conventions
- Add appropriate tests for new functionality
- Update documentation where necessary
- Consider backward compatibility
- Use existing error handling patterns
- Follow the established project structure
- Ensure Redis connection is properly configured
- Add proper logging for Celery tasks
- Include task retry logic for failed jobs

## Quality Gates

- [ ] Code passes linting (`make lint`)
- [ ] All tests pass (`make test`)
- [ ] Code is properly formatted (`make format`)
- [ ] Documentation is updated
- [ ] No breaking changes to existing APIs
- [ ] Redis connection is stable
- [ ] Celery workers can start and process tasks
- [ ] Health check endpoint returns correct status
