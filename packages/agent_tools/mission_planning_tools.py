"""
Mission Planning Tools for CoDrone AI Agent.

This module provides AI-powered mission planning tools that integrate with
the LangChain agent system. These tools enable conversational mission planning,
weather-aware flight planning, and intelligent parameter optimization.
"""

import json
from datetime import datetime
from typing import Any, Dict, List, Optional

from langchain_core.tools import tool


@tool  # type: ignore[misc]
def plan_drone_mission(
    boundary_coordinates: str,
    mission_type: str,
    location_lat: float,
    location_lon: float,
    quality_level: str = "standard",
    priority: str = "medium",
    mission_name: str = "AI Generated Mission",
) -> str:
    """
    Plan a comprehensive drone mission with AI optimization and weather analysis.

    This tool creates an intelligent mission plan that considers weather conditions,
    flight patterns, risk assessment, and regulatory compliance. It's the primary
    tool for end-to-end mission planning.

    Args:
        boundary_coordinates: GeoJSON polygon as string defining survey area
        mission_type: Type of mission ('survey', 'inspection', 'mapping', 'monitoring', 'search_rescue')
        location_lat: Latitude of mission location
        location_lon: Longitude of mission location
        quality_level: Quality level ('draft', 'standard', 'high', 'survey_grade')
        priority: Mission priority ('low', 'medium', 'high')
        mission_name: Name for the mission

    Returns:
        JSON string with complete mission plan including flight plan, weather windows,
        risk assessment, costs, and AI recommendations

    Example:
        User: "Plan a survey mission for this agricultural field at coordinates 40.7,-74.0"
        Tool: plan_drone_mission(polygon_coords, "survey", 40.7, -74.0, "high", "medium", "Farm Survey")
        Result: Complete mission plan with optimized flight pattern, weather analysis, and recommendations
    """
    try:
        # Parse boundary coordinates
        boundary_data = json.loads(boundary_coordinates)

        # Validate inputs
        if not _validate_boundary(boundary_data):
            return json.dumps(
                {
                    "error": "Invalid boundary coordinates. Must be valid GeoJSON polygon",
                    "boundary": boundary_coordinates[:100] + "..."
                    if len(boundary_coordinates) > 100
                    else boundary_coordinates,
                }
            )

        if mission_type not in [
            "survey",
            "inspection",
            "mapping",
            "monitoring",
            "search_rescue",
        ]:
            return json.dumps(
                {
                    "error": f"Invalid mission type: {mission_type}. Use: survey, inspection, mapping, monitoring, search_rescue"
                }
            )

        if quality_level not in ["draft", "standard", "high", "survey_grade"]:
            return json.dumps(
                {
                    "error": f"Invalid quality level: {quality_level}. Use: draft, standard, high, survey_grade"
                }
            )

        # Create mission plan using the backend service
        mission_plan = _create_mission_plan(
            boundary_data,
            mission_type,
            location_lat,
            location_lon,
            quality_level,
            priority,
            mission_name,
        )

        return json.dumps(mission_plan, indent=2)

    except Exception as e:
        return json.dumps(
            {
                "error": f"Mission planning failed: {str(e)}",
                "boundary": boundary_coordinates[:100] + "..."
                if len(boundary_coordinates) > 100
                else boundary_coordinates,
                "mission_type": mission_type,
                "location": f"{location_lat}, {location_lon}",
            }
        )


@tool  # type: ignore[misc]
def check_weather_conditions(
    location_lat: float,
    location_lon: float,
    mission_duration: int = 30,
    mission_type: str = "survey",
) -> str:
    """
    Check current weather conditions and find optimal flight windows.

    This tool provides weather analysis specifically for drone operations,
    including flight suitability assessment and recommended time windows.

    Args:
        location_lat: Latitude of mission location
        location_lon: Longitude of mission location
        mission_duration: Expected mission duration in minutes
        mission_type: Type of mission for weather optimization

    Returns:
        JSON string with current weather, flight assessment, and optimal windows

    Example:
        User: "What are the weather conditions for flying at coordinates 40.7,-74.0?"
        Tool: check_weather_conditions(40.7, -74.0, 30, "survey")
        Result: Weather analysis with flight suitability and recommended windows
    """
    try:
        # Get current weather and forecast
        weather_data = _get_weather_data(location_lat, location_lon, mission_duration)

        # Assess flight conditions
        flight_assessment = _assess_flight_conditions(weather_data, mission_type)

        # Find optimal flight windows
        flight_windows = _find_flight_windows(weather_data, mission_duration)

        result = {
            "location": {"lat": location_lat, "lon": location_lon},
            "current_weather": weather_data["current"],
            "flight_assessment": flight_assessment,
            "optimal_flight_windows": flight_windows,
            "mission_duration": mission_duration,
            "recommendations": _generate_weather_recommendations(
                flight_assessment, flight_windows
            ),
            "timestamp": datetime.now().isoformat(),
        }

        return json.dumps(result, indent=2)

    except Exception as e:
        return json.dumps(
            {
                "error": f"Weather check failed: {str(e)}",
                "location": f"{location_lat}, {location_lon}",
                "mission_duration": mission_duration,
            }
        )


@tool  # type: ignore[misc]
def optimize_flight_parameters(
    mission_type: str,
    quality_level: str,
    area_hectares: float,
    constraints: str = "{}",
    drone_model: str = "generic",
) -> str:
    """
    Optimize flight parameters for specific mission requirements.

    This tool uses AI to determine optimal altitude, speed, overlap, and other
    flight parameters based on mission type, quality requirements, and constraints.

    Args:
        mission_type: Type of mission ('survey', 'inspection', 'mapping', 'monitoring', 'search_rescue')
        quality_level: Required quality ('draft', 'standard', 'high', 'survey_grade')
        area_hectares: Size of survey area in hectares
        constraints: JSON string with mission constraints (max flight time, weather, etc.)
        drone_model: Drone model for platform-specific optimization

    Returns:
        JSON string with optimized flight parameters and rationale

    Example:
        User: "What are the best flight parameters for a high-quality survey of 10 hectares?"
        Tool: optimize_flight_parameters("survey", "high", 10.0, "{}", "dji-mavic-3")
        Result: Optimized parameters with altitude, speed, overlap, and explanation
    """
    try:
        # Parse constraints
        constraint_data = json.loads(constraints) if constraints.strip() else {}

        # Validate inputs
        if mission_type not in [
            "survey",
            "inspection",
            "mapping",
            "monitoring",
            "search_rescue",
        ]:
            return json.dumps(
                {
                    "error": f"Invalid mission type: {mission_type}. Use: survey, inspection, mapping, monitoring, search_rescue"
                }
            )

        if quality_level not in ["draft", "standard", "high", "survey_grade"]:
            return json.dumps(
                {
                    "error": f"Invalid quality level: {quality_level}. Use: draft, standard, high, survey_grade"
                }
            )

        if area_hectares <= 0:
            return json.dumps(
                {
                    "error": f"Invalid area: {area_hectares}. Must be positive number of hectares"
                }
            )

        # Get drone specifications
        drone_specs = _get_drone_specifications(drone_model)

        # Optimize parameters
        optimized_params = _optimize_parameters(
            mission_type, quality_level, area_hectares, constraint_data, drone_specs
        )

        return json.dumps(optimized_params, indent=2)

    except Exception as e:
        return json.dumps(
            {
                "error": f"Parameter optimization failed: {str(e)}",
                "mission_type": mission_type,
                "quality_level": quality_level,
                "area_hectares": area_hectares,
            }
        )


@tool  # type: ignore[misc]
def estimate_mission_cost(
    flight_time_minutes: float,
    mission_type: str,
    quality_level: str,
    location_lat: float,
    location_lon: float,
    includes_processing: bool = True,
) -> str:
    """
    Estimate the cost and resource requirements for a drone mission.

    This tool calculates estimated costs including flight time, equipment,
    processing, and deliverable preparation based on mission parameters.

    Args:
        flight_time_minutes: Estimated flight time in minutes
        mission_type: Type of mission for cost calculation
        quality_level: Quality level affecting processing costs
        location_lat: Mission latitude for location-based pricing
        location_lon: Mission longitude for location-based pricing
        includes_processing: Whether to include data processing costs

    Returns:
        JSON string with detailed cost breakdown and resource estimates

    Example:
        User: "How much would a 45-minute high-quality survey mission cost?"
        Tool: estimate_mission_cost(45, "survey", "high", 40.7, -74.0, True)
        Result: Detailed cost breakdown with flight, equipment, and processing costs
    """
    try:
        if flight_time_minutes <= 0:
            return json.dumps(
                {
                    "error": f"Invalid flight time: {flight_time_minutes}. Must be positive number of minutes"
                }
            )

        if mission_type not in [
            "survey",
            "inspection",
            "mapping",
            "monitoring",
            "search_rescue",
        ]:
            return json.dumps(
                {
                    "error": f"Invalid mission type: {mission_type}. Use: survey, inspection, mapping, monitoring, search_rescue"
                }
            )

        # Calculate cost breakdown
        cost_breakdown = _calculate_mission_costs(
            flight_time_minutes,
            mission_type,
            quality_level,
            location_lat,
            location_lon,
            includes_processing,
        )

        return json.dumps(cost_breakdown, indent=2)

    except Exception as e:
        return json.dumps(
            {
                "error": f"Cost estimation failed: {str(e)}",
                "flight_time": flight_time_minutes,
                "mission_type": mission_type,
            }
        )


@tool  # type: ignore[misc]
def generate_kml_export(
    flight_plan_data: str,
    platform: str = "generic",
    mission_name: str = "AI Generated Mission",
) -> str:
    """
    Generate KML/KMZ export for drone flight controllers.

    This tool converts flight plans into KML/KMZ format compatible with
    various drone platforms and flight planning applications.

    Args:
        flight_plan_data: JSON string containing flight plan with waypoints
        platform: Target platform ('dji', 'autel', 'litchi', 'pix4d', 'generic')
        mission_name: Name for the exported mission file

    Returns:
        JSON string with KML content and export metadata

    Example:
        User: "Export this flight plan for DJI drone"
        Tool: generate_kml_export(flight_plan_json, "dji", "Farm Survey Mission")
        Result: KML file content ready for drone controller
    """
    try:
        # Parse flight plan data
        flight_plan = json.loads(flight_plan_data)

        # Validate flight plan
        if not _validate_flight_plan(flight_plan):
            return json.dumps(
                {
                    "error": "Invalid flight plan data. Must contain waypoints array",
                    "received_keys": list(flight_plan.keys())
                    if isinstance(flight_plan, dict)
                    else "not_dict",
                }
            )

        # Generate KML export
        kml_export = _generate_kml_content(flight_plan, platform, mission_name)

        return json.dumps(kml_export, indent=2)

    except Exception as e:
        return json.dumps(
            {
                "error": f"KML export failed: {str(e)}",
                "platform": platform,
                "mission_name": mission_name,
            }
        )


@tool  # type: ignore[misc]
def assess_mission_risks(
    flight_plan_data: str,
    location_lat: float,
    location_lon: float,
    weather_data: str = "{}",
    pilot_experience: str = "intermediate",
) -> str:
    """
    Assess risks and provide safety recommendations for a drone mission.

    This tool analyzes various risk factors including weather, technical,
    regulatory, and operational risks to provide comprehensive safety assessment.

    Args:
        flight_plan_data: JSON string containing flight plan details
        location_lat: Mission latitude for regulatory and environmental analysis
        location_lon: Mission longitude for regulatory and environmental analysis
        weather_data: JSON string with weather conditions (optional)
        pilot_experience: Pilot experience level ('beginner', 'intermediate', 'advanced', 'commercial')

    Returns:
        JSON string with detailed risk assessment and mitigation recommendations

    Example:
        User: "What are the risks for this mission plan?"
        Tool: assess_mission_risks(flight_plan_json, 40.7, -74.0, weather_json, "intermediate")
        Result: Comprehensive risk analysis with safety recommendations
    """
    try:
        # Parse input data
        flight_plan = json.loads(flight_plan_data)
        weather = json.loads(weather_data) if weather_data.strip() else {}

        # Validate inputs
        if not _validate_flight_plan(flight_plan):
            return json.dumps({"error": "Invalid flight plan data"})

        if pilot_experience not in [
            "beginner",
            "intermediate",
            "advanced",
            "commercial",
        ]:
            return json.dumps(
                {
                    "error": f"Invalid pilot experience: {pilot_experience}. Use: beginner, intermediate, advanced, commercial"
                }
            )

        # Assess risks
        risk_assessment = _assess_comprehensive_risks(
            flight_plan, location_lat, location_lon, weather, pilot_experience
        )

        return json.dumps(risk_assessment, indent=2)

    except Exception as e:
        return json.dumps(
            {
                "error": f"Risk assessment failed: {str(e)}",
                "location": f"{location_lat}, {location_lon}",
                "pilot_experience": pilot_experience,
            }
        )


# Helper functions for tool implementations
def _validate_boundary(boundary_data: Dict[str, Any]) -> bool:
    """Validate GeoJSON boundary polygon."""
    try:
        return (
            boundary_data.get("type") == "Polygon"
            and isinstance(boundary_data.get("coordinates"), list)
            and len(boundary_data["coordinates"]) > 0
            and len(boundary_data["coordinates"][0]) >= 4
        )
    except Exception:
        return False


def _validate_flight_plan(flight_plan: Dict[str, Any]) -> bool:
    """Validate flight plan structure."""
    try:
        return (
            isinstance(flight_plan, dict)
            and "waypoints" in flight_plan
            and isinstance(flight_plan["waypoints"], list)
            and len(flight_plan["waypoints"]) > 0
        )
    except Exception:
        return False


def _create_mission_plan(
    boundary_data: Dict[str, Any],
    mission_type: str,
    location_lat: float,
    location_lon: float,
    quality_level: str,
    priority: str,
    mission_name: str,
) -> Dict[str, Any]:
    """Create comprehensive mission plan."""
    # This would integrate with the backend mission planning service
    # For now, return a mock comprehensive plan

    area_hectares = _estimate_area_from_boundary(boundary_data)
    estimated_flight_time = _estimate_flight_time(
        area_hectares, mission_type, quality_level
    )

    return {
        "mission_id": f"mission_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "mission_name": mission_name,
        "mission_type": mission_type,
        "quality_level": quality_level,
        "priority": priority,
        "location": {"lat": location_lat, "lon": location_lon},
        "boundary": boundary_data,
        "estimated_area_hectares": area_hectares,
        "estimated_flight_time_minutes": estimated_flight_time,
        "flight_parameters": _get_optimal_parameters(mission_type, quality_level),
        "weather_assessment": {
            "status": "pending",
            "recommendation": "Check weather conditions before flight",
        },
        "risk_assessment": {
            "overall": "medium",
            "factors": {
                "weather": "unknown",
                "technical": "low",
                "regulatory": "medium",
                "operational": "low",
            },
            "recommendations": [
                "Verify weather conditions before flight",
                "Check local airspace restrictions",
                "Ensure battery capacity is sufficient",
            ],
        },
        "estimated_cost": _estimate_basic_cost(
            estimated_flight_time, mission_type, quality_level
        ),
        "ai_recommendations": [
            f"Optimal mission type for {mission_type} operations",
            f"Recommended quality level: {quality_level}",
            "Consider weather conditions and local regulations",
            "Plan for sufficient battery capacity and backup equipment",
        ],
        "created_at": datetime.now().isoformat(),
        "confidence": 0.85,
    }


def _get_weather_data(lat: float, lon: float, duration: int) -> Dict[str, Any]:
    """Get weather data for location."""
    # Mock weather data - in production would integrate with weather service
    return {
        "current": {
            "temperature": 22,
            "humidity": 65,
            "wind_speed": 8,
            "wind_direction": 270,
            "visibility": 10,
            "cloud_cover": 30,
            "precipitation": 0,
            "conditions": "partly_cloudy",
        },
        "forecast": [],
        "location": {"lat": lat, "lon": lon},
    }


def _assess_flight_conditions(
    weather: Dict[str, Any], mission_type: str
) -> Dict[str, Any]:
    """Assess flight suitability based on weather."""
    current = weather.get("current", {})
    wind_speed = current.get("wind_speed", 0)
    precipitation = current.get("precipitation", 0)
    visibility = current.get("visibility", 10)

    warnings = []
    recommendations = []

    if wind_speed > 12:
        warnings.append("High wind speeds may affect flight stability")
    elif wind_speed > 8:
        recommendations.append("Monitor wind conditions during flight")

    if precipitation > 0:
        warnings.append("Precipitation present - not recommended for flight")

    if visibility < 3:
        warnings.append("Poor visibility conditions")

    suitable = len(warnings) == 0 and wind_speed <= 12
    safety_level = (
        "excellent" if suitable and wind_speed <= 5 else "good" if suitable else "poor"
    )

    return {
        "suitable": suitable,
        "safety_level": safety_level,
        "warnings": warnings,
        "recommendations": recommendations,
        "wind_speed": wind_speed,
        "conditions": current.get("conditions", "unknown"),
    }


def _find_flight_windows(
    weather: Dict[str, Any], duration: int
) -> List[Dict[str, Any]]:
    """Find optimal flight windows."""
    # Mock flight windows - in production would analyze forecast
    return [
        {
            "start_time": "2025-01-02T09:00:00Z",
            "end_time": "2025-01-02T11:00:00Z",
            "duration_minutes": 120,
            "safety_level": "excellent",
            "score": 95,
            "conditions": "Clear skies, light winds",
        },
        {
            "start_time": "2025-01-02T14:00:00Z",
            "end_time": "2025-01-02T16:00:00Z",
            "duration_minutes": 120,
            "safety_level": "good",
            "score": 85,
            "conditions": "Partly cloudy, moderate winds",
        },
    ]


def _generate_weather_recommendations(
    assessment: Dict[str, Any], windows: List[Dict[str, Any]]
) -> List[str]:
    """Generate weather-based recommendations."""
    recommendations = []

    if assessment["suitable"]:
        recommendations.append("Current conditions are suitable for flight operations")
    else:
        recommendations.append(
            "Current conditions are not suitable - wait for better weather"
        )

    if len(windows) > 0:
        best_window = max(windows, key=lambda w: w["score"])
        recommendations.append(
            f"Best flight window: {best_window['start_time']} - {best_window['end_time']}"
        )

    if assessment["wind_speed"] > 8:
        recommendations.append("Monitor wind conditions closely during flight")

    return recommendations


def _optimize_parameters(
    mission_type: str,
    quality_level: str,
    area_hectares: float,
    constraints: Dict[str, Any],
    drone_specs: Dict[str, Any],
) -> Dict[str, Any]:
    """Optimize flight parameters."""
    # Base parameters
    params = {
        "altitude": 120,  # meters
        "speed": 10,  # m/s
        "overlap_forward": 70,  # percentage
        "overlap_side": 60,  # percentage
        "image_interval": 2,  # seconds
        "camera_angle": 0,  # degrees (nadir)
    }

    # Optimize based on mission type
    if mission_type == "survey":
        params.update(
            {
                "overlap_forward": 80,
                "overlap_side": 70,
                "altitude": min(150, params["altitude"]),
            }
        )
    elif mission_type == "inspection":
        params.update(
            {
                "altitude": min(50, params["altitude"]),
                "speed": min(5, params["speed"]),
                "overlap_forward": 90,
                "camera_angle": -30,
            }
        )
    elif mission_type == "mapping":
        params.update({"overlap_forward": 85, "overlap_side": 75, "speed": 8})

    # Optimize based on quality level
    if quality_level == "survey_grade":
        params.update(
            {
                "overlap_forward": max(85, params["overlap_forward"]),
                "overlap_side": max(75, params["overlap_side"]),
                "speed": min(8, params["speed"]),
            }
        )
    elif quality_level == "draft":
        params.update(
            {
                "overlap_forward": min(60, params["overlap_forward"]),
                "overlap_side": min(50, params["overlap_side"]),
                "speed": max(12, params["speed"]),
            }
        )

    # Calculate derived metrics
    gsd = _calculate_gsd(params["altitude"], drone_specs.get("camera_specs", {}))
    estimated_flight_time = _estimate_flight_time_from_params(area_hectares, params)

    return {
        "optimized_parameters": params,
        "derived_metrics": {
            "ground_sample_distance_cm": gsd,
            "estimated_flight_time_minutes": estimated_flight_time,
            "estimated_photos": _estimate_photo_count(area_hectares, params),
            "battery_usage_percent": min(
                100,
                estimated_flight_time / drone_specs.get("max_flight_time", 30) * 100,
            ),
        },
        "optimization_rationale": _generate_optimization_rationale(
            mission_type, quality_level, params
        ),
        "constraints_applied": list(constraints.keys()),
        "drone_model": drone_specs.get("model", "generic"),
        "confidence": 0.9,
    }


def _get_drone_specifications(drone_model: str) -> Dict[str, Any]:
    """Get drone specifications for optimization."""
    specs = {
        "dji-mavic-3": {
            "model": "DJI Mavic 3",
            "max_flight_time": 46,
            "max_speed": 19,
            "camera_specs": {
                "sensor_width": 17.3,
                "sensor_height": 13.0,
                "focal_length": 24,
                "megapixels": 20,
            },
        },
        "dji-phantom-4": {
            "model": "DJI Phantom 4",
            "max_flight_time": 28,
            "max_speed": 20,
            "camera_specs": {
                "sensor_width": 6.17,
                "sensor_height": 4.55,
                "focal_length": 8.8,
                "megapixels": 20,
            },
        },
        "generic": {
            "model": "Generic Drone",
            "max_flight_time": 30,
            "max_speed": 15,
            "camera_specs": {
                "sensor_width": 6.17,
                "sensor_height": 4.55,
                "focal_length": 8.8,
                "megapixels": 20,
            },
        },
    }

    return specs.get(drone_model, specs["generic"])


def _calculate_mission_costs(
    flight_time: float,
    mission_type: str,
    quality_level: str,
    lat: float,
    lon: float,
    includes_processing: bool,
) -> Dict[str, Any]:
    """Calculate detailed mission costs."""
    base_hourly_rate = 150  # USD per hour
    flight_hours = flight_time / 60

    # Mission type multipliers
    type_multipliers = {
        "survey": 1.0,
        "inspection": 1.2,
        "mapping": 1.1,
        "monitoring": 0.9,
        "search_rescue": 1.5,
    }

    # Quality level multipliers
    quality_multipliers = {
        "draft": 0.8,
        "standard": 1.0,
        "high": 1.3,
        "survey_grade": 1.6,
    }

    flight_cost = (
        flight_hours * base_hourly_rate * type_multipliers.get(mission_type, 1.0)
    )
    processing_cost = (
        flight_cost * 0.4 * quality_multipliers.get(quality_level, 1.0)
        if includes_processing
        else 0
    )
    equipment_cost = flight_cost * 0.2

    total_cost = flight_cost + processing_cost + equipment_cost

    return {
        "cost_breakdown": {
            "flight_operations": round(flight_cost, 2),
            "data_processing": round(processing_cost, 2),
            "equipment_rental": round(equipment_cost, 2),
            "total": round(total_cost, 2),
        },
        "time_breakdown": {
            "flight_time_hours": round(flight_hours, 2),
            "setup_time_hours": 0.5,
            "processing_time_hours": round(flight_hours * 2, 1)
            if includes_processing
            else 0,
            "total_time_hours": round(
                flight_hours + 0.5 + (flight_hours * 2 if includes_processing else 0), 1
            ),
        },
        "deliverables": _get_mission_deliverables(mission_type, quality_level),
        "pricing_factors": {
            "mission_type_multiplier": type_multipliers.get(mission_type, 1.0),
            "quality_multiplier": quality_multipliers.get(quality_level, 1.0),
            "includes_processing": includes_processing,
        },
        "currency": "USD",
        "estimated_date": datetime.now().isoformat(),
    }


def _generate_kml_content(
    flight_plan: Dict[str, Any], platform: str, mission_name: str
) -> Dict[str, Any]:
    """Generate KML export content."""
    waypoints = flight_plan.get("waypoints", [])

    # Mock KML generation - in production would use actual KML generator
    kml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>{mission_name}</name>
    <description>Generated by CoDrone AI for {platform} platform</description>
    <!-- {len(waypoints)} waypoints would be included here -->
  </Document>
</kml>"""

    return {
        "kml_content": kml_content,
        "filename": f"{mission_name.replace(' ', '_')}_{platform}.kml",
        "platform": platform,
        "waypoint_count": len(waypoints),
        "file_size_bytes": len(kml_content.encode("utf-8")),
        "export_format": "kml",
        "generated_at": datetime.now().isoformat(),
        "compatible_apps": _get_platform_apps(platform),
    }


def _assess_comprehensive_risks(
    flight_plan: Dict[str, Any],
    lat: float,
    lon: float,
    weather: Dict[str, Any],
    pilot_experience: str,
) -> Dict[str, Any]:
    """Assess comprehensive mission risks."""
    waypoints = flight_plan.get("waypoints", [])
    max_altitude = max((wp.get("alt", 0) for wp in waypoints), default=0)
    flight_time = flight_plan.get(
        "estimatedFlightTime", flight_plan.get("estimated_flight_time", 30)
    )

    risks = {"weather": 0.2, "technical": 0.1, "regulatory": 0.3, "operational": 0.2}

    warnings = []
    mitigations = []

    # Weather risks
    if weather.get("current", {}).get("wind_speed", 0) > 10:
        risks["weather"] = 0.7
        warnings.append("High wind speeds increase flight risk")
        mitigations.append("Wait for calmer conditions or use wind-resistant equipment")

    # Technical risks
    if max_altitude > 120:
        risks["technical"] = 0.6
        warnings.append("High altitude operation")
        mitigations.append("Ensure proper altitude authorization")

    # Regulatory risks
    if max_altitude > 120:
        risks["regulatory"] = 0.8
        warnings.append("Flight altitude exceeds standard limits")
        mitigations.append("Obtain altitude waiver before flight")

    # Operational risks based on pilot experience
    experience_multipliers = {
        "beginner": 1.5,
        "intermediate": 1.0,
        "advanced": 0.7,
        "commercial": 0.5,
    }

    risks["operational"] *= experience_multipliers.get(pilot_experience, 1.0)

    if pilot_experience == "beginner" and flight_time > 20:
        warnings.append("Long flight duration for beginner pilot")
        mitigations.append("Consider shorter flight segments or additional supervision")

    overall_risk = max(risks.values())
    risk_level = (
        "critical"
        if overall_risk > 0.8
        else "high"
        if overall_risk > 0.6
        else "medium"
        if overall_risk > 0.4
        else "low"
    )

    return {
        "overall_risk": risk_level,
        "risk_factors": risks,
        "risk_score": round(overall_risk, 2),
        "warnings": warnings,
        "mitigations": mitigations,
        "pilot_experience": pilot_experience,
        "flight_parameters": {
            "max_altitude": max_altitude,
            "flight_time_minutes": flight_time,
            "waypoint_count": len(waypoints),
        },
        "recommendations": _generate_risk_recommendations(
            risk_level, risks, pilot_experience
        ),
        "assessment_timestamp": datetime.now().isoformat(),
    }


# Utility functions
def _estimate_area_from_boundary(boundary: Dict[str, Any]) -> float:
    """Estimate area in hectares from boundary polygon."""
    # Simplified area calculation
    coords = boundary.get("coordinates", [[]])[0]
    if len(coords) < 4:
        return 1.0  # Default 1 hectare

    # Very rough area estimation using bounding box
    lats = [coord[1] for coord in coords]
    lons = [coord[0] for coord in coords]

    lat_range = max(lats) - min(lats)
    lon_range = max(lons) - min(lons)

    # Convert to approximate hectares (very rough)
    area_deg_sq = lat_range * lon_range
    area_hectares = area_deg_sq * 12321  # Rough conversion

    return max(0.1, min(1000, area_hectares))  # Clamp between 0.1 and 1000 hectares


def _estimate_flight_time(
    area_hectares: float, mission_type: str, quality_level: str
) -> float:
    """Estimate flight time in minutes."""
    base_time_per_hectare = {
        "survey": 3.0,
        "inspection": 5.0,
        "mapping": 4.0,
        "monitoring": 2.0,
        "search_rescue": 2.5,
    }

    quality_multipliers = {
        "draft": 0.7,
        "standard": 1.0,
        "high": 1.4,
        "survey_grade": 1.8,
    }

    base_time = area_hectares * base_time_per_hectare.get(mission_type, 3.0)
    adjusted_time = base_time * quality_multipliers.get(quality_level, 1.0)

    return max(5, min(60, adjusted_time))  # Clamp between 5 and 60 minutes


def _get_optimal_parameters(mission_type: str, quality_level: str) -> Dict[str, Any]:
    """Get optimal flight parameters for mission type and quality."""
    params = {"altitude": 120, "speed": 10, "overlap_forward": 70, "overlap_side": 60}

    # Mission type adjustments
    if mission_type == "survey":
        params.update({"overlap_forward": 80, "overlap_side": 70})
    elif mission_type == "inspection":
        params.update({"altitude": 50, "speed": 5, "overlap_forward": 90})

    # Quality adjustments
    if quality_level == "survey_grade":
        params.update({"overlap_forward": 85, "overlap_side": 75, "speed": 8})
    elif quality_level == "draft":
        params.update({"overlap_forward": 60, "overlap_side": 50, "speed": 12})

    return params


def _estimate_basic_cost(
    flight_time: float, mission_type: str, quality_level: str
) -> Dict[str, Any]:
    """Estimate basic mission cost."""
    hourly_rate = 150
    hours = flight_time / 60
    base_cost = hours * hourly_rate

    multipliers = {
        "survey": 1.0,
        "inspection": 1.2,
        "mapping": 1.1,
        "monitoring": 0.9,
        "search_rescue": 1.5,
    }

    total_cost = base_cost * multipliers.get(mission_type, 1.0)

    return {
        "base_cost": round(base_cost, 2),
        "total_cost": round(total_cost, 2),
        "currency": "USD",
        "flight_hours": round(hours, 2),
    }


def _calculate_gsd(altitude: float, camera_specs: Dict[str, Any]) -> float:
    """Calculate Ground Sample Distance."""
    sensor_width = camera_specs.get("sensor_width", 6.17)
    focal_length = camera_specs.get("focal_length", 8.8)
    return (altitude * sensor_width) / (focal_length * 4000)  # cm/pixel


def _estimate_flight_time_from_params(
    area_hectares: float, params: Dict[str, Any]
) -> float:
    """Estimate flight time from parameters."""
    # Simplified calculation based on area and speed
    base_time = area_hectares * 3  # 3 minutes per hectare base
    speed_factor = 10 / params.get("speed", 10)  # Adjust for speed
    overlap_factor = params.get("overlap_forward", 70) / 70  # Adjust for overlap

    return base_time * speed_factor * overlap_factor


def _estimate_photo_count(area_hectares: float, params: Dict[str, Any]) -> int:
    """Estimate number of photos."""
    # Simplified calculation
    base_photos = area_hectares * 20  # 20 photos per hectare base
    overlap_factor = params.get("overlap_forward", 70) / 70
    return int(base_photos * overlap_factor)


def _generate_optimization_rationale(
    mission_type: str, quality_level: str, params: Dict[str, Any]
) -> List[str]:
    """Generate rationale for parameter optimization."""
    rationale = []

    rationale.append(f"Parameters optimized for {mission_type} mission type")
    rationale.append(
        f"Quality level {quality_level} requires {params['overlap_forward']}% forward overlap"
    )

    if params["altitude"] < 100:
        rationale.append("Low altitude selected for detailed inspection")
    elif params["altitude"] > 130:
        rationale.append("High altitude selected for efficient area coverage")

    if params["speed"] < 8:
        rationale.append("Reduced speed for better image quality")
    elif params["speed"] > 12:
        rationale.append("Increased speed for efficient coverage")

    return rationale


def _get_mission_deliverables(mission_type: str, quality_level: str) -> List[str]:
    """Get expected deliverables for mission."""
    base_deliverables = {
        "survey": ["orthomosaic", "dsm", "contour_map", "area_measurements"],
        "inspection": ["high_res_images", "video", "defect_report"],
        "mapping": ["orthomosaic", "dsm", "point_cloud", "cad_drawings"],
        "monitoring": ["time_series_images", "change_detection", "progress_report"],
        "search_rescue": [
            "thermal_images",
            "search_area_coverage",
            "coordinate_reports",
        ],
    }

    deliverables = base_deliverables.get(mission_type, ["images", "basic_report"])

    if quality_level in ["high", "survey_grade"]:
        deliverables.extend(["quality_report", "accuracy_assessment"])

    return deliverables


def _get_platform_apps(platform: str) -> List[str]:
    """Get compatible apps for platform."""
    apps = {
        "dji": ["DJI GO 4", "DJI Fly", "Litchi"],
        "autel": ["Autel Explorer", "Autel Sky"],
        "parrot": ["FreeFlight", "Pix4D Capture"],
        "litchi": ["Litchi"],
        "pix4d": ["Pix4D Capture"],
        "generic": ["Google Earth", "Mission Planner", "QGroundControl"],
    }

    return apps.get(platform, ["Generic KML Viewer"])


def _generate_risk_recommendations(
    risk_level: str, risks: Dict[str, float], pilot_experience: str
) -> List[str]:
    """Generate risk-based recommendations."""
    recommendations = []

    if risk_level in ["high", "critical"]:
        recommendations.append("Consider postponing mission until risks are mitigated")

    if risks["weather"] > 0.5:
        recommendations.append(
            "Monitor weather conditions closely before and during flight"
        )

    if risks["regulatory"] > 0.5:
        recommendations.append(
            "Verify all regulatory requirements and obtain necessary permissions"
        )

    if pilot_experience == "beginner":
        recommendations.append("Consider supervision by experienced pilot")
        recommendations.append("Practice mission in simulation before actual flight")

    recommendations.append("Ensure emergency procedures are in place")
    recommendations.append("Have backup equipment and contingency plans ready")

    return recommendations
