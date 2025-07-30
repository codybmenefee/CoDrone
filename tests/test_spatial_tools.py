"""
Tests for spatial analysis tools in CoDrone MVP.
"""

import json
from unittest.mock import MagicMock, patch

from packages.agent_tools.spatial_tools import calculate_volume_from_polygon


class TestSpatialTools:
    """Test spatial analysis tools."""

    def test_calculate_volume_valid_polygon(self):
        """Test volume calculation with valid polygon."""
        polygon = {
            "type": "Polygon",
            "coordinates": [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
        }

        with patch("packages.agent_tools.spatial_tools.gdal") as mock_gdal:
            mock_dataset = MagicMock()
            mock_gdal.Open.return_value = mock_dataset

            result = calculate_volume_from_polygon.invoke(
                {
                    "polygon_coordinates": json.dumps(polygon),
                    "dsm_file_path": "/path/to/dsm.tif",
                    "measurement_name": "Test Measurement",
                }
            )

            result_data = json.loads(result)
            assert "volume_cubic_meters" in result_data
            assert "area_square_meters" in result_data

    def test_calculate_volume_invalid_polygon(self):
        """Test volume calculation with invalid polygon."""
        result = calculate_volume_from_polygon.invoke(
            {"polygon_coordinates": "invalid json", "dsm_file_path": "/path/to/dsm.tif"}
        )

        result_data = json.loads(result)
        assert "error" in result_data

    def test_calculate_volume_missing_dsm(self):
        """Test volume calculation with missing DSM file."""
        polygon = {
            "type": "Polygon",
            "coordinates": [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
        }

        with patch("packages.agent_tools.spatial_tools.gdal") as mock_gdal:
            mock_gdal.Open.return_value = None

            result = calculate_volume_from_polygon.invoke(
                {
                    "polygon_coordinates": json.dumps(polygon),
                    "dsm_file_path": "/nonexistent/dsm.tif",
                }
            )

            result_data = json.loads(result)
            assert "error" in result_data
