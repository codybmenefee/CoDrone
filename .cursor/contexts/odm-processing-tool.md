# Agent Context: ODM Processing Tool

## 🎯 Task Objective

Implement an ODM (OpenDroneMap) processing tool that orchestrates photogrammetry workflows through natural language commands. The tool should:

- Accept uploaded drone images
- Configure and start ODM processing jobs
- Monitor processing status and progress
- Generate orthomosaics, DSMs, and 3D models
- Return results with preview capabilities

## 📋 Requirements

### Core Functionality

- [ ] **Image Upload Handling**: Process uploaded drone images
- [ ] **ODM Job Configuration**: Set up processing parameters
- [ ] **Async Processing**: Handle long-running photogrammetry jobs
- [ ] **Status Monitoring**: Track job progress and completion
- [ ] **Result Generation**: Generate orthomosaics, DSMs, point clouds
- [ ] **Preview Generation**: Create thumbnails and preview images

### User Experience

- [ ] **Natural Language**: "Process these images into an orthomosaic" → ODM job
- [ ] **Progress Tracking**: Real-time status updates during processing
- [ ] **Result Preview**: Show generated outputs in map viewer
- [ ] **Error Recovery**: Handle processing failures gracefully
- [ ] **Quality Assessment**: Basic quality checks on results

### Technical Requirements

- [ ] **ODM Integration**: Use NodeODM or ODM CLI for processing
- [ ] **Async Architecture**: Background job processing with status updates
- [ ] **File Management**: Organize uploaded images and generated outputs
- [ ] **Resource Management**: Monitor CPU/memory usage during processing
- [ ] **Error Handling**: Comprehensive error handling and recovery

## 🏗️ Implementation Approach

### 1. Tool Structure

```python
@tool
def process_images_with_odm(
    image_paths: List[str],           # List of uploaded image paths
    processing_type: str = "orthomosaic",  # orthomosaic, dsm, 3d_model
    quality_settings: str = "medium",  # low, medium, high, ultra
    project_name: str = None          # Optional project name
) -> str:
    """
    Process drone images using OpenDroneMap to generate photogrammetry outputs.

    Args:
        image_paths: List of paths to uploaded drone images
        processing_type: Type of processing (orthomosaic, dsm, 3d_model)
        quality_settings: Processing quality level
        project_name: Optional name for the project

    Returns:
        JSON string with job status and result paths
    """
```

### 2. Processing Pipeline

1. **Input Validation**: Validate image files and formats
2. **Project Setup**: Create ODM project directory structure
3. **Job Configuration**: Set up ODM parameters based on requirements
4. **Processing Start**: Launch ODM processing job
5. **Status Monitoring**: Track job progress and completion
6. **Result Processing**: Generate outputs and previews
7. **Integration**: Make results available in map viewer

### 3. Result Format

```json
{
  "job_id": "odm_job_12345",
  "status": "completed",
  "project_name": "Farm A Survey",
  "processing_type": "orthomosaic",
  "quality_settings": "high",
  "results": {
    "orthomosaic": "/data/projects/odm_job_12345/odm_orthophoto/orthophoto.tif",
    "dsm": "/data/projects/odm_job_12345/odm_dem/dem.tif",
    "point_cloud": "/data/projects/odm_job_12345/odm_georeferencing/odm_georeferenced_model.laz",
    "preview": "/data/projects/odm_job_12345/preview.jpg"
  },
  "metadata": {
    "image_count": 342,
    "processing_time_minutes": 45,
    "coverage_area_hectares": 45.7,
    "resolution_cm_per_pixel": 2.3,
    "quality_score": 87
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🔧 Files to Modify

### New Files

- `packages/agent_tools/processing_tools.py` - Main processing tools
- `apps/api-server/odm_manager.py` - ODM job management
- `apps/api-server/job_queue.py` - Background job processing
- `tests/test_processing_tools.py` - Unit tests for processing
- `apps/frontend/src/components/ProcessingStatus.tsx` - Status display
- `apps/frontend/src/components/ResultPreview.tsx` - Result preview

### Existing Files to Update

- `packages/agent_tools/tool_registry.py` - Add new tools to registry
- `apps/api-server/main.py` - Register new tools and job endpoints
- `apps/frontend/src/App.tsx` - Integrate processing UI
- `requirements.txt` - Add ODM and async dependencies
- `docker-compose.yml` - Add ODM service

## 🧪 Testing Strategy

### Unit Tests

- [ ] **Valid Images**: Test with valid drone images
- [ ] **Invalid Images**: Test error handling for corrupted files
- [ ] **Job Management**: Test job creation and status tracking
- [ ] **Result Generation**: Test output file generation
- [ ] **Error Recovery**: Test handling of processing failures

### Integration Tests

- [ ] **End-to-End**: Complete workflow from upload to result
- [ ] **Async Processing**: Test background job handling
- [ ] **Status Updates**: Test real-time progress updates
- [ ] **Result Integration**: Test result display in map viewer

## 📚 Dependencies

### Python Libraries

```python
# Add to requirements.txt
celery>=5.3.0  # For async job processing
redis>=4.5.0   # For job queue
psutil>=5.9.0  # For system monitoring
pillow>=9.5.0  # For image processing
```

### System Dependencies

```bash
# Install ODM dependencies
sudo apt-get update
sudo apt-get install -y docker.io docker-compose
sudo usermod -aG docker $USER

# Install NodeODM (optional)
git clone https://github.com/OpenDroneMap/NodeODM.git
cd NodeODM
docker-compose up -d
```

## 🎭 Code Examples

### Tool Implementation Pattern

```python
import json
import asyncio
import subprocess
from typing import List, Dict, Any, Optional
from datetime import datetime
from langchain.tools import tool
from pathlib import Path

@tool
def process_images_with_odm(
    image_paths: List[str],
    processing_type: str = "orthomosaic",
    quality_settings: str = "medium",
    project_name: str = None
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
            return json.dumps({
                "error": "No image paths provided",
                "suggestion": "Please upload drone images first"
            })

        # Generate project name if not provided
        if not project_name:
            project_name = f"ODM_Project_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        # Create ODM project
        project_dir = Path(f"data/projects/{project_name}")
        project_dir.mkdir(parents=True, exist_ok=True)

        # Copy images to project directory
        images_dir = project_dir / "images"
        images_dir.mkdir(exist_ok=True)

        for image_path in image_paths:
            # Copy image to project directory
            pass

        # Configure ODM parameters
        odm_config = {
            "pc-quality": quality_settings,
            "mesh-octree-depth": 9 if quality_settings == "high" else 8,
            "mesh-samples": 300000 if quality_settings == "high" else 150000,
            "dtm": True if processing_type in ["dsm", "orthomosaic"] else False,
            "dsm": True if processing_type in ["dsm", "orthomosaic"] else False,
            "orthophoto-resolution": 2.0 if quality_settings == "high" else 3.0
        }

        # Start ODM processing
        job_id = start_odm_processing(project_dir, odm_config)

        # Return initial status
        result = {
            "job_id": job_id,
            "status": "started",
            "project_name": project_name,
            "processing_type": processing_type,
            "quality_settings": quality_settings,
            "image_count": len(image_paths),
            "timestamp": datetime.now().isoformat(),
            "estimated_time_minutes": estimate_processing_time(len(image_paths), quality_settings)
        }

        return json.dumps(result, indent=2)

    except Exception as e:
        return json.dumps({
            "error": f"ODM processing failed: {str(e)}",
            "image_count": len(image_paths) if image_paths else 0
        })

def start_odm_processing(project_dir: Path, config: Dict[str, Any]) -> str:
    """Start ODM processing job."""
    job_id = f"odm_job_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    # Build ODM command
    cmd = [
        "docker", "run", "-i", "--rm",
        "-v", f"{project_dir}:/code/project",
        "opendronemap/odm:latest",
        "python3", "run.py"
    ]

    # Add configuration parameters
    for key, value in config.items():
        cmd.extend([f"--{key}", str(value)])

    # Start processing in background
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    # Store job information
    job_info = {
        "job_id": job_id,
        "project_dir": str(project_dir),
        "process_id": process.pid,
        "start_time": datetime.now().isoformat(),
        "config": config
    }

    # Save job info for status tracking
    with open(f"data/jobs/{job_id}.json", "w") as f:
        json.dump(job_info, f, indent=2)

    return job_id
```

### Frontend Integration

```typescript
// ProcessingStatus.tsx
interface ProcessingJob {
  job_id: string;
  status: 'started' | 'processing' | 'completed' | 'failed';
  project_name: string;
  processing_type: string;
  quality_settings: string;
  image_count: number;
  timestamp: string;
  estimated_time_minutes?: number;
  progress_percent?: number;
}

const ProcessingStatus: React.FC<{ job: ProcessingJob }> = ({ job }) => {
  return (
    <div className="processing-status">
      <h3>Processing: {job.project_name}</h3>
      <div className="status-info">
        <div>Status: {job.status}</div>
        <div>Type: {job.processing_type}</div>
        <div>Quality: {job.quality_settings}</div>
        <div>Images: {job.image_count}</div>
        {job.progress_percent && (
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${job.progress_percent}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
```

## 🚨 Error Handling

### Common Error Scenarios

1. **Invalid Images**: Corrupted or unsupported image formats
2. **Insufficient Images**: Too few images for photogrammetry
3. **Processing Failures**: ODM processing errors or timeouts
4. **Resource Issues**: Insufficient disk space or memory
5. **Docker Issues**: ODM container problems

### Error Response Format

```json
{
  "error": "Error description",
  "error_type": "validation|processing|resource|docker",
  "suggestion": "How to fix the error",
  "job_id": "odm_job_12345",
  "image_count": 342
}
```

## 📈 Success Criteria

### Functional Requirements

- [ ] Tool accepts valid drone images
- [ ] Tool starts ODM processing jobs successfully
- [ ] Tool tracks job progress and completion
- [ ] Tool generates expected outputs (orthomosaic, DSM, etc.)
- [ ] Tool integrates results with map viewer

### Performance Requirements

- [ ] Job startup completes in < 30 seconds
- [ ] Status updates every 30 seconds during processing
- [ ] Results available within 5 minutes of completion
- [ ] Support for up to 1000 images per job

### User Experience Requirements

- [ ] Natural language commands work intuitively
- [ ] Progress updates are clear and informative
- [ ] Results are easily accessible in map viewer
- [ ] Error messages are helpful and actionable

## 🎯 Integration Points

### With Existing System

- **Tool Registry**: Add to existing tool registry pattern
- **File Upload**: Work with existing file upload system
- **Chat Interface**: Integrate with existing chat message handling
- **Session Management**: Store processing history in session memory

### With Map System

- **Result Display**: Show generated orthomosaics and DSMs on map
- **Layer Management**: Add processing results as map layers
- **Preview Generation**: Create thumbnails for quick preview

This context provides everything needed to implement the ODM processing tool using your existing agentic development framework! 🚀
