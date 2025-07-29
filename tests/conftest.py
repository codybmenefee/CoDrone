"""Pytest configuration and common fixtures."""

import asyncio
import importlib.util
import sys
from pathlib import Path
from typing import AsyncGenerator, Generator

import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient

# Add the project root to the Python path for local development
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Import the app directly from the file
spec = importlib.util.spec_from_file_location(
    "main", project_root / "apps" / "api-server" / "main.py"
)
if spec is None:
    raise ImportError("Could not create module spec")
main_module = importlib.util.module_from_spec(spec)
if spec.loader is None:
    raise ImportError("Could not get module loader")
spec.loader.exec_module(main_module)
app = main_module.app


@pytest.fixture(scope="session")  # type: ignore
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture  # type: ignore
def client() -> TestClient:
    """Create a test client for the FastAPI application."""
    return TestClient(app)


@pytest.fixture  # type: ignore
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """Create an async test client for the FastAPI application."""
    async with AsyncClient(base_url="http://test") as ac:
        yield ac


@pytest.fixture  # type: ignore
def sample_file_content() -> str:
    """Sample file content for testing."""
    return """
def hello_world():
    print("Hello, World!")
    return "Hello, World!"

if __name__ == "__main__":
    hello_world()
"""


@pytest.fixture  # type: ignore
def sample_chat_message() -> dict:
    """Sample chat message for testing."""
    return {
        "role": "user",
        "content": "Hello, how are you?",
        "timestamp": "2024-01-01T00:00:00Z",
    }
