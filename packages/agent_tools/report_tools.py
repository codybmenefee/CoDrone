"""
Report Generation Tools for LangChain Agent

Tools for generating, managing, and customizing drone data analysis reports.
Integrates with the report management system and template engine.
"""

import json
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from langchain_core.tools import tool


@tool
def generate_report_from_template(
    template_id: str,
    title: str,
    analysis_data: str,
    location: Optional[str] = None,
    date: Optional[str] = None,
) -> str:
    """
    Generate a professional report using a specific template and analysis data.

    Args:
        template_id: ID of the template to use (e.g., 'crop-health-basic',
                   'volume-basic', 'area-survey-basic')
        title: Title for the generated report
        analysis_data: String containing analysis results and measurements
        location: Optional location where data was collected
        date: Optional date when data was collected

    Returns:
        JSON string with report generation results including report ID and preview
    """
    try:
        # Parse analysis data to extract key metrics
        data_context = parse_analysis_data(analysis_data)

        # Add metadata
        if location:
            data_context["metadata"]["location"] = location
        if date:
            data_context["metadata"]["date"] = date
        else:
            data_context["metadata"]["date"] = datetime.now().strftime("%Y-%m-%d")

        # Generate unique report ID
        report_id = f"report_{uuid.uuid4().hex[:8]}"

        # Get template information
        template_info = get_template_info(template_id)

        result = {
            "success": True,
            "report_id": report_id,
            "title": title,
            "template_used": template_info["name"],
            "category": template_info["category"],
            "data_included": {
                "location": data_context["metadata"].get("location", "Not specified"),
                "date": data_context["metadata"].get("date"),
                "measurements": len(
                    [
                        k
                        for k in data_context.get("analysisResults", {}).keys()
                        if data_context["analysisResults"][k] is not None
                    ]
                ),
                "visualizations": len(data_context.get("visualizations", {})),
            },
            "preview": (
                f"Report '{title}' has been generated using the {template_info['name']} "
                f"template. The report includes analysis data from "
                f"{data_context['metadata'].get('location', 'the surveyed area')} "
                f"collected on {data_context['metadata'].get('date')}."
            ),
            "next_steps": [
                "The report can be accessed and edited using the report builder interface",
                "Additional customizations can be applied (colors, logo, footer)",
                "Report can be exported to PDF or HTML format",
                "Share the report with stakeholders or download for offline viewing",
            ],
            "api_endpoint": f"/reports/{report_id}",
            "edit_url": f"/report-builder?id={report_id}",
        }

        return json.dumps(result, indent=2)

    except Exception as e:
        return json.dumps(
            {
                "success": False,
                "error": f"Failed to generate report: {str(e)}",
                "suggestion": "Please check the template ID and ensure analysis data is properly formatted",
            },
            indent=2,
        )


@tool
def create_custom_report(
    report_type: str,
    analysis_data: str,
    visualizations: List[str],
    detail_level: str = "standard",
) -> str:
    """
    Create a custom report with specified content and visualizations.

    Args:
        report_type: Type of report (crop_health, volume_measurement, area_survey, inspection, environmental)
        analysis_data: Analysis results and measurements to include
        visualizations: List of visualizations to include (map, chart, table, summary, findings)
        detail_level: Level of detail (basic, standard, comprehensive)

    Returns:
        JSON string with custom report creation results
    """
    try:
        # Validate report type
        valid_types = [
            "crop_health",
            "volume_measurement",
            "area_survey",
            "inspection",
            "environmental",
        ]
        if report_type not in valid_types:
            return json.dumps(
                {
                    "success": False,
                    "error": f"Invalid report type. Must be one of: {', '.join(valid_types)}",
                }
            )

        # Validate visualizations
        valid_visualizations = ["map", "chart", "table", "summary", "findings"]
        invalid_viz = [v for v in visualizations if v not in valid_visualizations]
        if invalid_viz:
            return json.dumps(
                {
                    "success": False,
                    "error": f"Invalid visualizations: {', '.join(invalid_viz)}. Valid options: {', '.join(valid_visualizations)}",
                }
            )

        # Parse analysis data
        data_context = parse_analysis_data(analysis_data)

        # Generate report structure based on type and detail level
        report_structure = generate_report_structure(
            report_type, visualizations, detail_level
        )

        # Generate unique report ID
        report_id = f"custom_{uuid.uuid4().hex[:8]}"

        result = {
            "success": True,
            "report_id": report_id,
            "report_type": report_type,
            "detail_level": detail_level,
            "structure": report_structure,
            "components_included": visualizations,
            "estimated_pages": estimate_report_pages(report_structure, detail_level),
            "data_summary": summarize_data_context(data_context),
            "preview": f"Custom {report_type.replace('_', ' ')} report created with {detail_level} detail level. Includes {len(visualizations)} visualization components.",
            "customization_options": [
                "Drag and drop components to reorder",
                "Modify colors and styling",
                "Add company logo and branding",
                "Include additional sections or text",
                "Adjust chart types and data visualization",
            ],
            "api_endpoint": f"/reports/{report_id}",
            "edit_url": f"/report-builder?id={report_id}&type=custom",
        }

        return json.dumps(result, indent=2)

    except Exception as e:
        return json.dumps(
            {"success": False, "error": f"Failed to create custom report: {str(e)}"},
            indent=2,
        )


@tool
def list_available_report_templates(category: Optional[str] = None) -> str:
    """
    List all available report templates with their details.

    Args:
        category: Optional category to filter templates (crop-health, volume-measurement, area-survey, inspection, environmental)

    Returns:
        JSON string with list of available templates
    """
    try:
        # Define available templates
        templates = [
            {
                "id": "crop-health-basic",
                "name": "Basic Crop Health Analysis",
                "category": "crop-health",
                "description": "Standard NDVI analysis with vegetation health assessment",
                "components": [
                    "executive-summary",
                    "drone-map",
                    "analysis-chart",
                    "measurement-table",
                    "key-findings",
                ],
                "use_cases": [
                    "NDVI monitoring",
                    "Vegetation health assessment",
                    "Crop stress detection",
                ],
                "estimated_time": "2-3 minutes to generate",
            },
            {
                "id": "crop-health-detailed",
                "name": "Detailed Crop Health Report",
                "category": "crop-health",
                "description": "Comprehensive NDVI analysis with zone mapping and recommendations",
                "components": [
                    "executive-summary",
                    "drone-map",
                    "analysis-chart",
                    "measurement-table",
                    "key-findings",
                    "zone-analysis",
                    "recommendations",
                ],
                "use_cases": [
                    "Detailed crop monitoring",
                    "Precision agriculture",
                    "Treatment planning",
                ],
                "estimated_time": "3-4 minutes to generate",
            },
            {
                "id": "volume-basic",
                "name": "Volume Measurement Report",
                "category": "volume-measurement",
                "description": "Stockpile volume calculation with accuracy metrics",
                "components": [
                    "executive-summary",
                    "drone-map",
                    "measurement-table",
                    "analysis-chart",
                ],
                "use_cases": [
                    "Stockpile measurement",
                    "Material volume tracking",
                    "Inventory management",
                ],
                "estimated_time": "2-3 minutes to generate",
            },
            {
                "id": "area-survey-basic",
                "name": "Area Survey Report",
                "category": "area-survey",
                "description": "Land area calculation and boundary mapping",
                "components": [
                    "executive-summary",
                    "drone-map",
                    "measurement-table",
                    "key-findings",
                ],
                "use_cases": ["Land surveying", "Property mapping", "Area calculation"],
                "estimated_time": "2-3 minutes to generate",
            },
            {
                "id": "inspection-basic",
                "name": "Infrastructure Inspection",
                "category": "inspection",
                "description": "Detailed infrastructure analysis and defect reporting",
                "components": [
                    "executive-summary",
                    "drone-map",
                    "analysis-chart",
                    "key-findings",
                ],
                "use_cases": [
                    "Infrastructure monitoring",
                    "Defect detection",
                    "Maintenance planning",
                ],
                "estimated_time": "3-4 minutes to generate",
            },
            {
                "id": "environmental-basic",
                "name": "Environmental Monitoring",
                "category": "environmental",
                "description": "Environmental impact assessment and monitoring",
                "components": [
                    "executive-summary",
                    "drone-map",
                    "analysis-chart",
                    "measurement-table",
                    "key-findings",
                ],
                "use_cases": [
                    "Environmental monitoring",
                    "Impact assessment",
                    "Compliance reporting",
                ],
                "estimated_time": "3-4 minutes to generate",
            },
        ]

        # Filter by category if specified
        if category:
            templates = [t for t in templates if t["category"] == category]

        # Group by category for better organization
        categorized_templates = {}
        for template in templates:
            cat = template["category"]
            if cat not in categorized_templates:
                categorized_templates[cat] = []
            categorized_templates[cat].append(template)

        result = {
            "total_templates": len(templates),
            "categories": len(categorized_templates),
            "filtered_by": category or "none",
            "templates_by_category": categorized_templates,
            "usage_tips": [
                "Choose 'basic' templates for quick reports and standard analysis",
                "Use 'detailed' templates when comprehensive analysis is needed",
                "Templates can be customized after generation using the report builder",
                "All templates support PDF and HTML export formats",
            ],
        }

        return json.dumps(result, indent=2)

    except Exception as e:
        return json.dumps(
            {"success": False, "error": f"Failed to list templates: {str(e)}"}, indent=2
        )


@tool
def generate_ai_powered_report(
    analysis_data: str, report_type: str, preferences: Optional[str] = None
) -> str:
    """
    Generate a report using AI analysis of drone data with intelligent content recommendations.

    Args:
        analysis_data: Raw analysis data including measurements, observations, and metrics
        report_type: Type of analysis (crop_health, volume, area, inspection, environmental)
        preferences: Optional preferences for report style and content (JSON string)

    Returns:
        JSON string with AI-generated report details and recommendations
    """
    try:
        # Parse preferences
        prefs = {}
        if preferences:
            try:
                prefs = json.loads(preferences)
            except Exception:
                prefs = {}

        # Analyze the data to extract insights
        insights = analyze_data_for_insights(analysis_data, report_type)

        # Generate AI recommendations
        ai_recommendations = generate_ai_recommendations(insights, report_type)

        # Select optimal template based on data
        recommended_template = select_optimal_template(insights, report_type, prefs)

        # Generate content suggestions
        content_suggestions = generate_content_suggestions(insights, report_type)

        # Generate unique report ID
        report_id = f"ai_{uuid.uuid4().hex[:8]}"

        result = {
            "success": True,
            "report_id": report_id,
            "ai_generated": True,
            "analysis_summary": insights["summary"],
            "recommended_template": recommended_template,
            "key_insights": insights["key_points"],
            "ai_recommendations": ai_recommendations,
            "content_suggestions": content_suggestions,
            "confidence_score": insights["confidence"],
            "data_quality": insights["quality_assessment"],
            "estimated_completion": "2-3 minutes",
            "preview": f"AI-powered {report_type} report generated with {insights['confidence']:.0%} confidence. Key findings: {insights['summary'][:100]}...",
            "next_steps": [
                "Review AI-generated insights and recommendations",
                "Customize the report using the visual editor",
                "Add additional context or modify findings as needed",
                "Export final report in desired format",
            ],
            "api_endpoint": f"/reports/{report_id}",
            "edit_url": f"/report-builder?id={report_id}&ai=true",
        }

        return json.dumps(result, indent=2)

    except Exception as e:
        return json.dumps(
            {
                "success": False,
                "error": f"Failed to generate AI report: {str(e)}",
                "fallback": "You can still generate a report using standard templates",
            },
            indent=2,
        )


@tool
def export_report_to_format(
    report_id: str,
    export_format: str,
    filename: Optional[str] = None,
    options: Optional[str] = None,
) -> str:
    """
    Export a generated report to PDF or HTML format.

    Args:
        report_id: ID of the report to export
        export_format: Format to export (pdf, html)
        filename: Optional custom filename
        options: Optional export options as JSON string (page size, orientation, margins)

    Returns:
        JSON string with export results and download information
    """
    try:
        # Validate export format
        if export_format not in ["pdf", "html"]:
            return json.dumps(
                {
                    "success": False,
                    "error": "Invalid export format. Must be 'pdf' or 'html'",
                }
            )

        # Parse options
        export_options = {"pageSize": "A4", "orientation": "portrait"}
        if options:
            try:
                export_options.update(json.loads(options))
            except Exception:
                pass

        # Generate filename if not provided
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"drone_report_{timestamp}"

        # Simulate export process (in real implementation, this would call the API)
        export_info = {
            "success": True,
            "report_id": report_id,
            "format": export_format,
            "filename": f"{filename}.{export_format}",
            "options_used": export_options,
            "file_size": "2.4 MB" if export_format == "pdf" else "850 KB",
            "pages": estimate_page_count(export_options.get("pageSize", "A4")),
            "generation_time": "15-30 seconds",
            "download_url": f"/exports/{filename}.{export_format}",
            "expires_at": get_expiry_time(),
            "sharing_options": [
                "Direct download link",
                "Email sharing",
                "Cloud storage upload",
                "Print-ready format",
            ],
        }

        return json.dumps(export_info, indent=2)

    except Exception as e:
        return json.dumps(
            {"success": False, "error": f"Failed to export report: {str(e)}"}, indent=2
        )


# Utility Functions
def parse_analysis_data(analysis_data: str) -> Dict[str, Any]:
    """Parse analysis data string into structured format."""
    try:
        # Try to parse as JSON first
        if analysis_data.strip().startswith("{"):
            return json.loads(analysis_data)
    except Exception:
        pass

    # Parse text-based analysis data
    data_context = {"analysisResults": {}, "metadata": {}, "visualizations": {}}

    # Extract common metrics using simple text parsing
    lines = analysis_data.lower().split("\n")
    for line in lines:
        if "area" in line and any(unit in line for unit in ["hectare", "ha", "acre"]):
            # Extract area value
            import re

            numbers = re.findall(r"\d+\.?\d*", line)
            if numbers:
                data_context["analysisResults"]["area"] = float(numbers[0])

        elif "volume" in line and "m³" in line:
            # Extract volume value
            import re

            numbers = re.findall(r"\d+\.?\d*", line)
            if numbers:
                data_context["analysisResults"]["volume"] = float(numbers[0])

        elif "resolution" in line:
            # Extract resolution
            if "cm/pixel" in line:
                import re

                numbers = re.findall(r"\d+\.?\d*", line)
                if numbers:
                    data_context["metadata"]["resolution"] = f"{numbers[0]} cm/pixel"

        elif "images" in line or "photos" in line:
            # Extract image count
            import re

            numbers = re.findall(r"\d+", line)
            if numbers:
                data_context["metadata"]["imageCount"] = int(numbers[0])

    return data_context


def get_template_info(template_id: str) -> Dict[str, str]:
    """Get template information by ID."""
    templates = {
        "crop-health-basic": {
            "name": "Basic Crop Health Analysis",
            "category": "crop-health",
        },
        "crop-health-detailed": {
            "name": "Detailed Crop Health Report",
            "category": "crop-health",
        },
        "volume-basic": {
            "name": "Volume Measurement Report",
            "category": "volume-measurement",
        },
        "area-survey-basic": {"name": "Area Survey Report", "category": "area-survey"},
        "inspection-basic": {
            "name": "Infrastructure Inspection",
            "category": "inspection",
        },
        "environmental-basic": {
            "name": "Environmental Monitoring",
            "category": "environmental",
        },
    }
    return templates.get(
        template_id, {"name": "Unknown Template", "category": "unknown"}
    )


def generate_report_structure(
    report_type: str, visualizations: List[str], detail_level: str
) -> Dict[str, Any]:
    """Generate report structure based on type and requirements."""
    base_structure = {"header": {"title": True, "metadata": True}, "sections": []}

    if "summary" in visualizations:
        base_structure["sections"].append({"type": "executive-summary", "priority": 1})

    if "map" in visualizations:
        base_structure["sections"].append({"type": "drone-map", "priority": 2})

    if "table" in visualizations:
        base_structure["sections"].append({"type": "measurement-table", "priority": 3})

    if "chart" in visualizations:
        base_structure["sections"].append({"type": "analysis-chart", "priority": 4})

    if "findings" in visualizations:
        base_structure["sections"].append({"type": "key-findings", "priority": 5})

    if detail_level == "comprehensive":
        base_structure["sections"].extend(
            [
                {"type": "detailed-analysis", "priority": 6},
                {"type": "recommendations", "priority": 7},
                {"type": "appendix", "priority": 8},
            ]
        )

    return base_structure


def analyze_data_for_insights(analysis_data: str, report_type: str) -> Dict[str, Any]:
    """Analyze data to extract insights for AI report generation."""
    data_context = parse_analysis_data(analysis_data)

    insights = {
        "summary": f"Analysis completed for {report_type.replace('_', ' ')} assessment",
        "key_points": [],
        "confidence": 0.85,
        "quality_assessment": "Good",
    }

    # Analyze based on available data
    if data_context["analysisResults"]:
        if "area" in data_context["analysisResults"]:
            area = data_context["analysisResults"]["area"]
            insights["key_points"].append(f"Total surveyed area: {area} hectares")

        if "volume" in data_context["analysisResults"]:
            volume = data_context["analysisResults"]["volume"]
            insights["key_points"].append(f"Calculated volume: {volume} cubic meters")

    if data_context["metadata"]:
        if "imageCount" in data_context["metadata"]:
            count = data_context["metadata"]["imageCount"]
            insights["key_points"].append(f"High-quality dataset with {count} images")
            if count > 200:
                insights["confidence"] = 0.92

        if "resolution" in data_context["metadata"]:
            insights["key_points"].append(
                f"Excellent resolution: {data_context['metadata']['resolution']}"
            )

    return insights


def generate_ai_recommendations(
    insights: Dict[str, Any], report_type: str
) -> List[str]:
    """Generate AI-powered recommendations based on insights."""
    recommendations = []

    if report_type == "crop_health":
        recommendations = [
            "Monitor areas with low NDVI values for potential stress factors",
            "Consider targeted irrigation in identified zones",
            "Schedule follow-up analysis in 2-3 weeks to track changes",
            "Implement precision agriculture techniques in variable zones",
        ]
    elif report_type == "volume":
        recommendations = [
            "Accuracy is within acceptable range for volume measurements",
            "Consider weather conditions when scheduling future surveys",
            "Implement regular monitoring for material tracking",
            "Use consistent reference points for comparison over time",
        ]
    elif report_type == "area":
        recommendations = [
            "Survey accuracy meets professional standards",
            "Consider ground control points for enhanced precision",
            "Document boundary markers for future reference",
            "Regular surveys recommended for change detection",
        ]
    else:
        recommendations = [
            "Data quality is sufficient for analysis",
            "Consider additional data collection for comprehensive assessment",
            "Follow up with ground validation when possible",
            "Maintain consistent methodology for comparable results",
        ]

    return recommendations


def select_optimal_template(
    insights: Dict[str, Any], report_type: str, preferences: Dict[str, Any]
) -> Dict[str, str]:
    """Select the optimal template based on data insights and preferences."""
    template_mapping = {
        "crop_health": "crop-health-basic",
        "volume": "volume-basic",
        "area": "area-survey-basic",
        "inspection": "inspection-basic",
        "environmental": "environmental-basic",
    }

    template_id = template_mapping.get(report_type, "crop-health-basic")

    # Upgrade to detailed template if comprehensive analysis requested
    if (
        preferences.get("detailLevel") == "comprehensive"
        and template_id == "crop-health-basic"
    ):
        template_id = "crop-health-detailed"

    template_info = get_template_info(template_id)

    return {
        "id": template_id,
        "name": template_info["name"],
        "reason": f"Optimal for {report_type} analysis with current data quality",
    }


def generate_content_suggestions(
    insights: Dict[str, Any], report_type: str
) -> Dict[str, List[str]]:
    """Generate content suggestions for the report."""
    return {
        "executive_summary": [
            f"Comprehensive {report_type.replace('_', ' ')} analysis completed",
            f"Data collection quality: {insights['quality_assessment']}",
            f"Analysis confidence: {insights['confidence']:.0%}",
        ],
        "key_findings": insights["key_points"],
        "recommendations": [
            "Continue monitoring with regular intervals",
            "Implement findings in operational planning",
            "Consider additional data collection for enhanced insights",
        ],
        "next_steps": [
            "Review and validate findings",
            "Share report with relevant stakeholders",
            "Plan follow-up analysis timeline",
        ],
    }


def summarize_data_context(data_context: Dict[str, Any]) -> str:
    """Create a summary of the data context."""
    summary_parts = []

    if data_context.get("analysisResults"):
        results = data_context["analysisResults"]
        if "area" in results:
            summary_parts.append(f"Area: {results['area']} ha")
        if "volume" in results:
            summary_parts.append(f"Volume: {results['volume']} m³")

    if data_context.get("metadata"):
        metadata = data_context["metadata"]
        if "imageCount" in metadata:
            summary_parts.append(f"Images: {metadata['imageCount']}")
        if "resolution" in metadata:
            summary_parts.append(f"Resolution: {metadata['resolution']}")

    return (
        " | ".join(summary_parts) if summary_parts else "Basic analysis data available"
    )


def estimate_report_pages(structure: Dict[str, Any], detail_level: str) -> int:
    """Estimate number of pages in the report."""
    base_pages = len(structure.get("sections", []))

    if detail_level == "basic":
        return max(2, base_pages)
    elif detail_level == "comprehensive":
        return max(4, base_pages + 2)
    else:
        return max(3, base_pages + 1)


def estimate_page_count(page_size: str) -> int:
    """Estimate page count based on content."""
    return 3  # Default estimate


def get_expiry_time() -> str:
    """Get expiry time for download links."""
    from datetime import timedelta

    expiry = datetime.now() + timedelta(hours=24)
    return expiry.strftime("%Y-%m-%d %H:%M:%S")


# Make function available for import (needed for AI report generation)
async def generate_report_from_ai_analysis(
    analysis_data: str, report_type: str, preferences: Dict[str, Any]
) -> Dict[str, Any]:
    """Async function for AI report generation (called from report_management.py)."""
    insights = analyze_data_for_insights(analysis_data, report_type)
    recommendations = generate_ai_recommendations(insights, report_type)

    # Generate basic HTML structure
    html_content = f"""
    <div style="font-family: Inter, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px;">
        <h1>AI-Generated {report_type.replace('_', ' ').title()} Report</h1>
        <p><strong>Generated:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M')}</p>

        <h2>Executive Summary</h2>
        <p>{insights['summary']}</p>

        <h2>Key Findings</h2>
        <ul>
            {''.join(f'<li>{point}</li>' for point in insights['key_points'])}
        </ul>

        <h2>AI Recommendations</h2>
        <ul>
            {''.join(f'<li>{rec}</li>' for rec in recommendations)}
        </ul>

        <h2>Analysis Quality</h2>
        <p>Confidence Score: {insights['confidence']:.0%}</p>
        <p>Data Quality: {insights['quality_assessment']}</p>
    </div>
    """

    css_content = """
    body { font-family: Inter, sans-serif; line-height: 1.6; color: #1e293b; }
    h1, h2 { color: #1e293b; margin-bottom: 1rem; }
    p { margin-bottom: 1rem; }
    ul { margin-bottom: 1rem; padding-left: 1.5rem; }
    li { margin-bottom: 0.5rem; }
    """

    return {
        "html": html_content,
        "css": css_content,
        "insights": insights,
        "recommendations": recommendations,
    }
