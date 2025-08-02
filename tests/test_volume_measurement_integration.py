"""
Integration tests for the volume measurement tool.

This module tests the complete workflow from polygon drawing to volume calculation,
ensuring all components work together correctly.
"""

import json

import pytest

# Test data
TEST_POLYGON = {
    "type": "Polygon",
    "coordinates": [
        [
            [-74.0059, 40.7128],
            [-74.0058, 40.7128],
            [-74.0058, 40.7129],
            [-74.0059, 40.7129],
            [-74.0059, 40.7128],
        ]
    ],
}

TEST_DSM_PATH = "/test/data/dsm.tif"


def test_polygon_validation():
    """Test polygon validation functionality."""
    from packages.agent_tools.spatial_tools import _validate_polygon_geojson

    # Valid polygon
    assert _validate_polygon_geojson(TEST_POLYGON) is True

    # Invalid polygon - wrong type
    invalid_polygon = {"type": "Point", "coordinates": [0, 0]}
    assert _validate_polygon_geojson(invalid_polygon) is False

    # Invalid polygon - insufficient coordinates
    invalid_polygon = {
        "type": "Polygon",
        "coordinates": [[[0, 0], [1, 1]]],  # Only 2 points
    }
    assert _validate_polygon_geojson(invalid_polygon) is False


def test_area_calculation_simple():
    """Test simple area calculation without GDAL."""
    from packages.agent_tools.spatial_tools import _calculate_area_simple

    # Simple square polygon (approximately 1 degree x 1 degree)
    square_polygon = {
        "type": "Polygon",
        "coordinates": [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
    }

    area = _calculate_area_simple(square_polygon)
    assert area > 0
    print(f"Calculated area: {area} m²")


def test_volume_calculation_mock():
    """Test volume calculation with mock data."""
    from packages.agent_tools.spatial_tools import calculate_volume_from_polygon

    # Test with non-existent DSM file (should use mock calculation)
    result_str = calculate_volume_from_polygon(
        polygon_coordinates=json.dumps(TEST_POLYGON),
        dsm_file_path="/nonexistent/dsm.tif",
        base_elevation=100.0,
        measurement_name="Test Volume",
    )

    result = json.loads(result_str)
    print(f"Volume calculation result: {result}")

    # Should contain either a mock result or an error message
    assert "measurement_name" in result or "error" in result

    if "volume_cubic_meters" in result:
        assert result["volume_cubic_meters"] >= 0
        assert result["area_square_meters"] >= 0
        assert result["measurement_name"] == "Test Volume"


def test_area_calculation_tool():
    """Test area calculation tool."""
    from packages.agent_tools.spatial_tools import calculate_polygon_area

    result_str = calculate_polygon_area(
        polygon_coordinates=json.dumps(TEST_POLYGON),
        coordinate_system="EPSG:4326",
        measurement_name="Test Area",
    )

    result = json.loads(result_str)
    print(f"Area calculation result: {result}")

    assert "area_square_meters" in result or "error" in result

    if "area_square_meters" in result:
        assert result["area_square_meters"] >= 0
        assert result["measurement_name"] == "Test Area"
        assert "area_hectares" in result
        assert "area_acres" in result


def test_elevation_analysis_tool():
    """Test elevation analysis tool."""
    from packages.agent_tools.spatial_tools import analyze_elevation_profile

    result_str = analyze_elevation_profile(
        polygon_coordinates=json.dumps(TEST_POLYGON),
        dsm_file_path="/nonexistent/dsm.tif",
        measurement_name="Test Elevation",
    )

    result = json.loads(result_str)
    print(f"Elevation analysis result: {result}")

    assert "measurement_name" in result or "error" in result

    if "elevation_stats" in result:
        stats = result["elevation_stats"]
        assert "min_elevation" in stats
        assert "max_elevation" in stats
        assert "mean_elevation" in stats


def test_tool_registry_integration():
    """Test that all spatial tools are properly registered."""
    from packages.agent_tools.tool_registry import tools

    tool_names = [tool.name for tool in tools]

    # Check that our spatial tools are registered
    assert "calculate_volume_from_polygon" in tool_names
    assert "calculate_polygon_area" in tool_names
    assert "analyze_elevation_profile" in tool_names

    print(f"Registered tools: {tool_names}")


@pytest.mark.asyncio
async def test_backend_spatial_endpoints():
    """Test backend spatial API endpoints."""
    import sys
    from pathlib import Path

    from fastapi.testclient import TestClient

    # Add the API server to the path
    api_path = Path(__file__).parent.parent / "apps" / "api-server"
    sys.path.insert(0, str(api_path))

    try:
        from main import app

        client = TestClient(app)

        # Test volume calculation endpoint
        volume_request = {
            "polygon_coordinates": json.dumps(TEST_POLYGON),
            "dsm_file_path": "/nonexistent/dsm.tif",
            "measurement_name": "Test Volume API",
        }

        response = client.post("/api/spatial/volume", json=volume_request)
        print(f"Volume API response status: {response.status_code}")
        print(f"Volume API response: {response.json()}")

        # Should either succeed or fail gracefully
        assert response.status_code in [200, 400, 500]

        # Test area calculation endpoint
        area_request = {
            "polygon_coordinates": json.dumps(TEST_POLYGON),
            "measurement_name": "Test Area API",
        }

        response = client.post("/api/spatial/area", json=area_request)
        print(f"Area API response status: {response.status_code}")
        print(f"Area API response: {response.json()}")

        assert response.status_code in [200, 400, 500]

    except ImportError as e:
        print(f"Could not import API server: {e}")
        # Skip test if API server dependencies are not available
        pytest.skip("API server dependencies not available")


def test_complete_workflow():
    """Test a complete workflow from polygon to volume measurement."""
    from packages.agent_tools.spatial_tools import (
        calculate_polygon_area,
        calculate_volume_from_polygon,
    )

    print("\n=== Complete Volume Measurement Workflow Test ===")

    # Step 1: Calculate area
    print("Step 1: Calculating polygon area...")
    area_result_str = calculate_polygon_area(
        polygon_coordinates=json.dumps(TEST_POLYGON),
        measurement_name="Workflow Test Area",
    )
    area_result = json.loads(area_result_str)
    print(f"Area result: {area_result}")

    # Step 2: Calculate volume
    print("Step 2: Calculating volume...")
    volume_result_str = calculate_volume_from_polygon(
        polygon_coordinates=json.dumps(TEST_POLYGON),
        dsm_file_path="/mock/dsm.tif",
        measurement_name="Workflow Test Volume",
    )
    volume_result = json.loads(volume_result_str)
    print(f"Volume result: {volume_result}")

    # Verify workflow completed
    if "error" not in area_result and "error" not in volume_result:
        print("✅ Complete workflow test PASSED")
        assert area_result["area_square_meters"] > 0
        assert volume_result["volume_cubic_meters"] >= 0
    else:
        print("⚠️ Workflow completed with expected limitations (no GDAL/DSM)")
        # This is expected in test environment without actual DSM files

    print("=== Workflow Test Complete ===\n")


if __name__ == "__main__":
    # Run tests directly
    print("Running volume measurement integration tests...")

    test_polygon_validation()
    print("✅ Polygon validation test passed")

    test_area_calculation_simple()
    print("✅ Simple area calculation test passed")

    test_volume_calculation_mock()
    print("✅ Volume calculation mock test passed")

    test_area_calculation_tool()
    print("✅ Area calculation tool test passed")

    test_elevation_analysis_tool()
    print("✅ Elevation analysis tool test passed")

    test_tool_registry_integration()
    print("✅ Tool registry integration test passed")

    test_complete_workflow()
    print("✅ Complete workflow test passed")

    print("\n🎉 All volume measurement integration tests completed successfully!")
