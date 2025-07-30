"""
Tests for processing tools in CoDrone MVP.
"""

import json
from unittest.mock import MagicMock, patch

from packages.agent_tools.processing_tools import process_images_with_odm


class TestProcessingTools:
    """Test processing tools."""

    def test_process_images_valid_input(self):
        """Test ODM processing with valid images."""
        image_paths = ["/path/to/image1.jpg", "/path/to/image2.jpg"]

        with patch("subprocess.Popen") as mock_popen:
            mock_process = MagicMock()
            mock_process.pid = 12345
            mock_popen.return_value = mock_process

            result = process_images_with_odm.invoke(
                {
                    "image_paths": image_paths,
                    "processing_type": "orthomosaic",
                    "quality_settings": "high",
                    "project_name": "Test Project",
                }
            )

            result_data = json.loads(result)
            assert "job_id" in result_data
            assert result_data["status"] == "started"
            assert result_data["image_count"] == 2

    def test_process_images_no_images(self):
        """Test ODM processing with no images."""
        result = process_images_with_odm.invoke(
            {"image_paths": [], "processing_type": "orthomosaic"}
        )

        result_data = json.loads(result)
        assert "error" in result_data

    def test_process_images_invalid_type(self):
        """Test ODM processing with invalid processing type."""
        image_paths = ["/path/to/image1.jpg"]

        result = process_images_with_odm.invoke(
            {"image_paths": image_paths, "processing_type": "invalid_type"}
        )

        result_data = json.loads(result)
        # Should still work but with default settings
        assert "job_id" in result_data
