"""Basic tests to verify the setup is working."""

from fastapi.testclient import TestClient


def test_health_check(client: TestClient) -> None:
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data


def test_root_endpoint(client: TestClient) -> None:
    """Test the root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()


def test_tools_endpoint(client: TestClient) -> None:
    """Test the tools endpoint."""
    response = client.get("/tools")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
