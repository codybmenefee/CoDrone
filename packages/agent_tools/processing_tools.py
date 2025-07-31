"""
Processing tools for CoDrone MVP.

This module contains tools for ODM processing, job management,
and result generation.
"""

import json
from datetime import datetime
from pathlib import Path
from typing import List, Optional

from langchain.tools import tool


@tool  # type: ignore[misc]
def process_images_with_odm(
    image_paths: List[str],
    processing_type: str = "orthomosaic",
    quality_settings: str = "medium",
    project_name: Optional[str] = None,
) -> str:
    """
    Process drone images using OpenDroneMap to generate photogrammetry outputs.

    This tool takes uploaded drone images and processes them using ODM to generate
    orthomosaics, DSMs, and 3D models. Processing happens asynchronously with
    status updates.

    Args:
        image_paths: List of paths to uploaded drone images
        processing_type: Type of processing (orthomosaic, dsm, 3d_model)
        quality_settings: Processing quality level (low, medium, high, ultra)
        project_name: Optional name for the project

    Returns:
        JSON string with job status and result paths

    Example:
        User: "Process these images into an orthomosaic"
        Tool: process_images_with_odm(image_paths, "orthomosaic", "high", "Farm A")
        Result: {"job_id": "odm_job_12345", "status": "started", ...}
    """
    try:
        # Validate inputs
        if not image_paths:
            return json.dumps(
                {
                    "error": "No image paths provided",
                    "suggestion": "Please upload drone images first",
                }
            )

        # Generate project name if not provided
        if not project_name:
            project_name = f"ODM_Project_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        # Create ODM project
        project_dir = Path(f"data/projects/{project_name}")
        project_dir.mkdir(parents=True, exist_ok=True)

        # Start ODM processing (simplified for MVP)
        job_id = _start_odm_processing(
            project_dir, image_paths, processing_type, quality_settings
        )

        # Return initial status
        result = {
            "job_id": job_id,
            "status": "started",
            "project_name": project_name,
            "processing_type": processing_type,
            "quality_settings": quality_settings,
            "image_count": len(image_paths),
            "timestamp": datetime.now().isoformat(),
            "estimated_time_minutes": _estimate_processing_time(
                len(image_paths), quality_settings
            ),
        }

        return json.dumps(result, indent=2)

    except Exception as e:
        return json.dumps(
            {
                "error": f"ODM processing failed: {str(e)}",
                "image_count": len(image_paths) if image_paths else 0,
            }
        )


def _start_odm_processing(
    project_dir: Path,
    image_paths: List[str],
    processing_type: str,
    quality_settings: str,
) -> str:
    """Start ODM processing job."""
    job_id = f"odm_job_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    # Store job information
    job_info = {
        "job_id": job_id,
        "project_dir": str(project_dir),
        "start_time": datetime.now().isoformat(),
        "image_count": len(image_paths),
        "processing_type": processing_type,
        "quality_settings": quality_settings,
    }

    # Save job info for status tracking
    jobs_dir = Path("data/jobs")
    jobs_dir.mkdir(exist_ok=True)

    with open(jobs_dir / f"{job_id}.json", "w") as f:
        json.dump(job_info, f, indent=2)

    return job_id


def _estimate_processing_time(image_count: int, quality_settings: str) -> int:
    """Estimate processing time based on image count and quality."""
    base_time = image_count * 0.5  # 30 seconds per image base

    quality_multipliers = {"low": 0.5, "medium": 1.0, "high": 2.0, "ultra": 4.0}

    multiplier = quality_multipliers.get(quality_settings, 1.0)
    return int(base_time * multiplier)
