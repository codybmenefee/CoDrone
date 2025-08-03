"""
Tool Registry for LangChain Agent

This module defines all the tools available to the AI agent.
Tools are organized by category and can be extended as needed.
"""

import json
from datetime import datetime
from typing import Optional

from langchain_core.tools import tool

# Import new MVP tools
from .processing_tools import process_images_with_odm

# Import report generation tools
from .report_tools import (
    create_custom_report,
    export_report_to_format,
    generate_ai_powered_report,
    generate_report_from_template,
    list_available_report_templates,
)
from .spatial_tools import (
    analyze_elevation_profile,
    calculate_polygon_area,
    calculate_volume_from_polygon,
)

# Import mission planning tools
from .mission_planning_tools import (
    assess_mission_risks,
    check_weather_conditions,
    estimate_mission_cost,
    generate_kml_export,
    optimize_flight_parameters,
    plan_drone_mission,
)


@tool  # type: ignore
def simulate_drone_analysis(input_description: str) -> str:
    """
    Simulate drone data analysis for testing purposes.

    Args:
        input_description: Description of the data to analyze
        (e.g., "orthomosaic from July 1")

    Returns:
        Simulated analysis results
    """
    return f"""
Analysis complete for: {input_description}

Simulated Results:
- Coverage Area: 45.7 hectares
- Image Resolution: 2.3 cm/pixel
- Number of Images: 342
- Flight Duration: 23 minutes
- Weather Conditions: Clear, 12 mph wind
- Quality Score: 87/100

Key Insights:
- High resolution imagery captured
- Minimal cloud interference
- Suitable for NDVI analysis
- Ready for orthomosaic processing
    """.strip()


@tool  # type: ignore
def calculate_field_area(polygon_coordinates: str) -> str:
    """
    Calculate the area of a field based on polygon coordinates.

    Args:
        polygon_coordinates: JSON string of polygon coordinates [[lat, lon], ...]

    Returns:
        Calculated area in hectares and acres
    """
    try:
        coords = json.loads(polygon_coordinates)
        # Simplified area calculation (not geodesically accurate)
        num_points = len(coords)
        simulated_area_hectares = num_points * 2.3  # Mock calculation
        simulated_area_acres = simulated_area_hectares * 2.471

        return f"""
Field Area Calculation:
- Polygon Points: {num_points}
- Area: {simulated_area_hectares:.2f} hectares ({simulated_area_acres:.2f} acres)
- Perimeter: {num_points * 150:.0f} meters (estimated)
- Shape Regularity: 82% (good for analysis)
        """.strip()
    except (json.JSONDecodeError, ValueError):
        return (
            "Error: Invalid polygon coordinates format. Please provide as JSON array."
        )


@tool  # type: ignore
def estimate_processing_time(task_type: str, image_count: int = 100) -> str:
    """
    Estimate processing time for different drone data tasks.

    Args:
        task_type: Type of processing (orthomosaic, ndvi, 3d_model, etc.)
        image_count: Number of images to process

    Returns:
        Time estimates for the requested task
    """
    time_multipliers = {
        "orthomosaic": 2.5,
        "ndvi": 1.2,
        "3d_model": 4.8,
        "elevation_map": 3.1,
        "volume_calculation": 2.8,
    }

    base_time = image_count * time_multipliers.get(task_type, 2.0)

    return f"""
Processing Time Estimate:
- Task: {task_type.replace('_', ' ').title()}
- Images: {image_count}
- Estimated Time: {base_time:.0f} minutes
- GPU Acceleration: Available (reduces time by 60%)
- Queue Position: 2nd in line
- Expected Start: {datetime.now().strftime("%H:%M")}
    """.strip()


@tool  # type: ignore
def generate_report_preview(report_type: str, data_summary: str) -> str:
    """
    Generate a preview of what a report would contain.

    Args:
        report_type: Type of report (crop_health, survey, inspection, etc.)
        data_summary: Brief summary of the data to include

    Returns:
        Preview of report contents and structure
    """
    return f"""
Report Preview: {report_type.replace('_', ' ').title()}

Data Summary: {data_summary}

Report Structure:
1. Executive Summary
   - Key findings and recommendations
   - Data quality assessment
   - Processing methodology

2. Technical Analysis
   - Image processing results
   - Statistical analysis
   - Quality metrics

3. Visualizations
   - Maps and charts
   - Before/after comparisons
   - Trend analysis

4. Recommendations
   - Action items
   - Follow-up requirements
   - Resource allocation

5. Appendices
   - Raw data tables
   - Processing parameters
   - Quality assurance logs

Estimated Report Length: 15-20 pages
Generation Time: 2-3 hours
    """.strip()


@tool  # type: ignore
def inspect_map_polygons(session_id: Optional[str] = None) -> str:
    """
    Inspect the current map state to see what polygons the user has drawn.

    This tool allows the AI agent to see all polygons currently drawn on the map,
    including their coordinates, which ones are selected, and metadata.

    Args:
        session_id: Optional session identifier to get polygons for specific session

    Returns:
        JSON string containing all drawn polygons with their GeoJSON coordinates
    """
    import json

    try:
        # Import map_states from the main module
        # Use sys to avoid circular imports
        import sys

        # Try to get map_states from the main module
        main_module = sys.modules.get("__main__")
        if main_module and hasattr(main_module, "map_states"):
            map_states = getattr(main_module, "map_states")
        else:
            # Fallback: try to import directly from main
            try:
                from main import map_states
            except ImportError:
                return "Map state storage not available. This tool requires the server to be running with map state management."

        # Use session_id or try to get from the current context
        session_key = (
            session_id or "test_session"
        )  # For now, use test_session as default

        # Get map state for this session
        if session_key not in map_states:
            return "No polygons are currently drawn on the map. The user needs to draw a polygon first before I can create a mission plan."

        map_data = map_states[session_key]
        polygons = map_data.get("polygons", [])
        selected_polygon_id = map_data.get("selectedPolygon")

        if not polygons:
            return "No polygons are currently drawn on the map. The user needs to draw a polygon first before I can create a mission plan."

        result = f"Map State Inspection:\n\n"
        result += f"Total polygons drawn: {len(polygons)}\n"
        result += f"Selected polygon ID: {selected_polygon_id or 'None'}\n\n"

        for i, polygon in enumerate(polygons, 1):
            result += f"Polygon {i}:\n"
            result += f"  ID: {polygon.get('id', 'unknown')}\n"
            result += f"  Name: {polygon.get('name', 'Unnamed')}\n"
            result += f"  Selected: {'Yes' if polygon.get('id') == selected_polygon_id else 'No'}\n"
            result += f"  Area: {polygon.get('area', 'Unknown')} hectares\n"
            result += f"  GeoJSON: {json.dumps(polygon.get('polygon', {}))}\n\n"

        # If there's a selected polygon, provide it prominently
        if selected_polygon_id:
            selected = next(
                (p for p in polygons if p.get("id") == selected_polygon_id), None
            )
            if selected:
                result += f"SELECTED POLYGON FOR MISSION PLANNING:\n"
                result += f"Use this GeoJSON for mission planning: {json.dumps(selected.get('polygon', {}))}\n"

        return result

    except Exception as e:
        return f"Error inspecting map polygons: {str(e)}. Make sure the map state is available."


@tool  # type: ignore
def list_available_datasets(location_filter: Optional[str] = None) -> str:
    """
    List available datasets for analysis.

    Args:
        location_filter: Optional location filter (e.g., "Farm A", "Region B")

    Returns:
        List of available datasets with metadata
    """
    datasets: list[dict[str, str | int]] = [
        {
            "id": "farm_a_july_2024",
            "name": "Farm A - July 2024 Survey",
            "location": "Farm A",
            "date": "2024-07-15",
            "type": "orthomosaic",
            "images": 342,
            "coverage": "45.7 hectares",
            "resolution": "2.3 cm/pixel",
        },
        {
            "id": "farm_b_august_2024",
            "name": "Farm B - August 2024 NDVI",
            "location": "Farm B",
            "date": "2024-08-20",
            "type": "ndvi",
            "images": 156,
            "coverage": "23.1 hectares",
            "resolution": "5.1 cm/pixel",
        },
        {
            "id": "region_c_september_2024",
            "name": "Region C - September 2024 3D Model",
            "location": "Region C",
            "date": "2024-09-10",
            "type": "3d_model",
            "images": 89,
            "coverage": "12.8 hectares",
            "resolution": "8.7 cm/pixel",
        },
    ]

    if location_filter:
        datasets = [
            d for d in datasets if location_filter.lower() in str(d["location"]).lower()
        ]

    if not datasets:
        return f"No datasets found for location: {location_filter}"

    result = (
        f"Available Datasets{f' for {location_filter}' if location_filter else ''}:\n\n"
    )
    for dataset in datasets:
        result += f"📊 {dataset['name']}\n"
        result += f"   Location: {dataset['location']}\n"
        result += f"   Date: {dataset['date']}\n"
        result += f"   Type: {str(dataset['type']).upper()}\n"
        result += f"   Images: {dataset['images']}\n"
        result += f"   Coverage: {dataset['coverage']}\n"
        result += f"   Resolution: {dataset['resolution']}\n"
        result += f"   ID: {dataset['id']}\n\n"

    return result.strip()


# Export the tools list
tools = [
    simulate_drone_analysis,
    calculate_field_area,
    estimate_processing_time,
    generate_report_preview,
    list_available_datasets,
    inspect_map_polygons,  # New map inspection tool
    calculate_volume_from_polygon,
    calculate_polygon_area,
    analyze_elevation_profile,
    process_images_with_odm,
    # Report generation tools
    generate_report_from_template,
    create_custom_report,
    list_available_report_templates,
    generate_ai_powered_report,
    export_report_to_format,
    # Mission planning tools
    plan_drone_mission,
    check_weather_conditions,
    optimize_flight_parameters,
    estimate_mission_cost,
    generate_kml_export,
    assess_mission_risks,
]
