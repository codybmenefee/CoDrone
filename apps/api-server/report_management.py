"""
Report Management API

FastAPI endpoints for report template management, report generation, and export functionality.
Integrates with the AI agent for automated report generation.
"""

import json
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import aiofiles
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
import base64
import asyncio
from io import BytesIO

# For PDF generation (server-side)
try:
    import weasyprint
    PDF_SUPPORT = True
except ImportError:
    print("Warning: weasyprint not installed. PDF generation will be limited.")
    PDF_SUPPORT = False

router = APIRouter(prefix="/reports", tags=["reports"])

# Data storage paths
REPORTS_DIR = Path("./data/reports")
TEMPLATES_DIR = Path("./data/templates")
EXPORTS_DIR = Path("./data/exports")

# Ensure directories exist
for dir_path in [REPORTS_DIR, TEMPLATES_DIR, EXPORTS_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)

# Pydantic Models
class ReportTemplate(BaseModel):
    id: str
    name: str
    category: str
    description: str
    html_template: str
    css_template: str
    components: List[str]
    created_at: str
    updated_at: str

class CreateTemplateRequest(BaseModel):
    name: str = Field(..., description="Template name")
    category: str = Field(..., description="Template category")
    description: str = Field(..., description="Template description")
    html_template: str = Field(..., description="HTML template content")
    css_template: str = Field(..., description="CSS template content")
    components: List[str] = Field(..., description="List of components used")

class DroneDataContext(BaseModel):
    analysisResults: Optional[Dict[str, Any]] = Field(default={})
    metadata: Optional[Dict[str, Any]] = Field(default={})
    visualizations: Optional[Dict[str, Any]] = Field(default={})

class ReportGenerationRequest(BaseModel):
    templateId: str = Field(..., description="Template ID to use")
    title: str = Field(..., description="Report title")
    dataContext: DroneDataContext = Field(..., description="Drone data context")
    customizations: Optional[Dict[str, Any]] = Field(default={})

class ReportGenerationResponse(BaseModel):
    id: str
    html: str
    css: str
    createdAt: str
    downloadUrl: Optional[str] = None

class SaveReportRequest(BaseModel):
    html: str = Field(..., description="Report HTML content")
    css: str = Field(..., description="Report CSS content")
    metadata: Optional[Dict[str, Any]] = Field(default={})

class ExportOptions(BaseModel):
    filename: Optional[str] = Field(default="report")
    pageSize: Optional[str] = Field(default="A4")
    orientation: Optional[str] = Field(default="portrait")
    margins: Optional[Dict[str, int]] = Field(default={"top": 20, "right": 20, "bottom": 20, "left": 20})
    includeStyles: Optional[bool] = Field(default=True)

class AIReportRequest(BaseModel):
    analysisData: str = Field(..., description="Analysis data to include")
    reportType: str = Field(..., description="Type of report to generate")
    preferences: Optional[Dict[str, Any]] = Field(default={})

# In-memory storage (replace with database in production)
templates_store: Dict[str, ReportTemplate] = {}
reports_store: Dict[str, Dict[str, Any]] = {}

# Initialize with default templates
def initialize_default_templates():
    """Initialize the system with default templates."""
    default_templates = [
        {
            "id": "crop-health-basic",
            "name": "Basic Crop Health Analysis",
            "category": "crop-health",
            "description": "Standard NDVI analysis with vegetation health assessment",
            "html_template": get_crop_health_template(),
            "css_template": get_standard_css(),
            "components": ["executive-summary", "drone-map", "analysis-chart", "measurement-table", "key-findings"]
        },
        {
            "id": "volume-basic",
            "name": "Volume Measurement Report",
            "category": "volume-measurement",
            "description": "Stockpile volume calculation with accuracy metrics",
            "html_template": get_volume_template(),
            "css_template": get_standard_css(),
            "components": ["executive-summary", "drone-map", "measurement-table", "analysis-chart"]
        },
        {
            "id": "area-survey-basic",
            "name": "Area Survey Report",
            "category": "area-survey",
            "description": "Land area calculation and boundary mapping",
            "html_template": get_area_survey_template(),
            "css_template": get_standard_css(),
            "components": ["executive-summary", "drone-map", "measurement-table", "key-findings"]
        }
    ]
    
    for template_data in default_templates:
        if template_data["id"] not in templates_store:
            template = ReportTemplate(
                **template_data,
                created_at=datetime.now().isoformat(),
                updated_at=datetime.now().isoformat()
            )
            templates_store[template.id] = template

# Initialize templates on module load
initialize_default_templates()

# Template Management Endpoints
@router.get("/templates", response_model=List[ReportTemplate])
async def get_templates(
    category: Optional[str] = None,
    search: Optional[str] = None
) -> List[ReportTemplate]:
    """Get all report templates with optional filtering."""
    templates = list(templates_store.values())
    
    if category:
        templates = [t for t in templates if t.category == category]
    
    if search:
        search_lower = search.lower()
        templates = [
            t for t in templates 
            if search_lower in t.name.lower() or search_lower in t.description.lower()
        ]
    
    return templates

@router.get("/templates/{template_id}", response_model=ReportTemplate)
async def get_template(template_id: str) -> ReportTemplate:
    """Get a specific template by ID."""
    if template_id not in templates_store:
        raise HTTPException(status_code=404, detail="Template not found")
    return templates_store[template_id]

@router.post("/templates", response_model=ReportTemplate)
async def create_template(request: CreateTemplateRequest) -> ReportTemplate:
    """Create a new report template."""
    template_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    
    template = ReportTemplate(
        id=template_id,
        name=request.name,
        category=request.category,
        description=request.description,
        html_template=request.html_template,
        css_template=request.css_template,
        components=request.components,
        created_at=now,
        updated_at=now
    )
    
    templates_store[template_id] = template
    
    # Save to file
    await save_template_to_file(template)
    
    return template

@router.put("/templates/{template_id}", response_model=ReportTemplate)
async def update_template(
    template_id: str,
    request: CreateTemplateRequest
) -> ReportTemplate:
    """Update an existing template."""
    if template_id not in templates_store:
        raise HTTPException(status_code=404, detail="Template not found")
    
    template = templates_store[template_id]
    template.name = request.name
    template.category = request.category
    template.description = request.description
    template.html_template = request.html_template
    template.css_template = request.css_template
    template.components = request.components
    template.updated_at = datetime.now().isoformat()
    
    # Save to file
    await save_template_to_file(template)
    
    return template

@router.delete("/templates/{template_id}")
async def delete_template(template_id: str) -> Dict[str, str]:
    """Delete a template."""
    if template_id not in templates_store:
        raise HTTPException(status_code=404, detail="Template not found")
    
    del templates_store[template_id]
    
    # Remove file
    template_file = TEMPLATES_DIR / f"{template_id}.json"
    if template_file.exists():
        template_file.unlink()
    
    return {"message": "Template deleted successfully"}

# Report Generation Endpoints
@router.post("/generate", response_model=ReportGenerationResponse)
async def generate_report(request: ReportGenerationRequest) -> ReportGenerationResponse:
    """Generate a report from a template and data context."""
    if request.templateId not in templates_store:
        raise HTTPException(status_code=404, detail="Template not found")
    
    template = templates_store[request.templateId]
    report_id = str(uuid.uuid4())
    
    # Process template with data context
    html = process_template_variables(template.html_template, request.dataContext)
    css = template.css_template
    
    # Apply customizations if provided
    if request.customizations:
        html, css = apply_customizations(html, css, request.customizations)
    
    # Save generated report
    report_data = {
        "id": report_id,
        "title": request.title,
        "template_id": request.templateId,
        "html": html,
        "css": css,
        "metadata": {
            "dataContext": request.dataContext.dict(),
            "customizations": request.customizations
        },
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    reports_store[report_id] = report_data
    await save_report_to_file(report_id, report_data)
    
    return ReportGenerationResponse(
        id=report_id,
        html=html,
        css=css,
        createdAt=report_data["created_at"]
    )

@router.post("/generate/ai", response_model=ReportGenerationResponse)
async def generate_ai_report(request: AIReportRequest) -> ReportGenerationResponse:
    """Generate a report using AI analysis of the provided data."""
    try:
        # This would integrate with the AI agent
        from agent_tools.tool_registry import generate_report_from_ai_analysis
        
        # Call AI tool to generate report content
        ai_result = await generate_report_from_ai_analysis(
            request.analysisData,
            request.reportType,
            request.preferences
        )
        
        # Process AI result into report format
        report_id = str(uuid.uuid4())
        html = ai_result.get("html", "<p>AI-generated content would go here</p>")
        css = ai_result.get("css", get_standard_css())
        
        report_data = {
            "id": report_id,
            "title": f"AI Generated {request.reportType} Report",
            "template_id": "ai-generated",
            "html": html,
            "css": css,
            "metadata": {
                "ai_generated": True,
                "analysis_data": request.analysisData,
                "report_type": request.reportType,
                "preferences": request.preferences
            },
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        reports_store[report_id] = report_data
        await save_report_to_file(report_id, report_data)
        
        return ReportGenerationResponse(
            id=report_id,
            html=html,
            css=css,
            createdAt=report_data["created_at"]
        )
    
    except Exception as e:
        # Fallback to basic template-based generation
        basic_template_id = get_default_template_for_type(request.reportType)
        if basic_template_id and basic_template_id in templates_store:
            mock_context = DroneDataContext(
                analysisResults={"area": 45.7, "volume": 1234},
                metadata={"location": "AI Analysis", "date": datetime.now().strftime("%Y-%m-%d")}
            )
            
            fallback_request = ReportGenerationRequest(
                templateId=basic_template_id,
                title=f"AI {request.reportType} Report",
                dataContext=mock_context
            )
            
            return await generate_report(fallback_request)
        
        raise HTTPException(status_code=500, detail=f"Failed to generate AI report: {str(e)}")

# Report Management Endpoints
@router.get("/{report_id}")
async def get_report(report_id: str) -> Dict[str, Any]:
    """Get a specific report by ID."""
    if report_id not in reports_store:
        raise HTTPException(status_code=404, detail="Report not found")
    return reports_store[report_id]

@router.put("/{report_id}")
async def save_report(
    report_id: str,
    request: SaveReportRequest
) -> Dict[str, Any]:
    """Save or update a report."""
    if report_id not in reports_store:
        # Create new report
        report_data = {
            "id": report_id,
            "title": "Custom Report",
            "template_id": "custom",
            "html": request.html,
            "css": request.css,
            "metadata": request.metadata,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
    else:
        # Update existing report
        report_data = reports_store[report_id]
        report_data["html"] = request.html
        report_data["css"] = request.css
        report_data["metadata"] = request.metadata
        report_data["updated_at"] = datetime.now().isoformat()
    
    reports_store[report_id] = report_data
    await save_report_to_file(report_id, report_data)
    
    return {"success": True, "reportId": report_id}

@router.delete("/{report_id}")
async def delete_report(report_id: str) -> Dict[str, str]:
    """Delete a report."""
    if report_id not in reports_store:
        raise HTTPException(status_code=404, detail="Report not found")
    
    del reports_store[report_id]
    
    # Remove file
    report_file = REPORTS_DIR / f"{report_id}.json"
    if report_file.exists():
        report_file.unlink()
    
    return {"message": "Report deleted successfully"}

@router.get("")
async def list_reports(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    category: Optional[str] = None
) -> Dict[str, Any]:
    """List all reports with pagination."""
    reports = list(reports_store.values())
    
    if search:
        search_lower = search.lower()
        reports = [
            r for r in reports 
            if search_lower in r.get("title", "").lower()
        ]
    
    if category:
        reports = [
            r for r in reports 
            if r.get("template_id", "").startswith(category)
        ]
    
    # Pagination
    total = len(reports)
    start = (page - 1) * limit
    end = start + limit
    reports = reports[start:end]
    
    # Format response
    formatted_reports = [
        {
            "id": r["id"],
            "title": r.get("title", "Untitled"),
            "template_name": get_template_name(r.get("template_id", "")),
            "created_at": r["created_at"],
            "updated_at": r["updated_at"]
        }
        for r in reports
    ]
    
    return {
        "reports": formatted_reports,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

# Export Endpoints
@router.post("/{report_id}/export/pdf")
async def export_report_to_pdf(
    report_id: str,
    options: Optional[ExportOptions] = None
) -> Dict[str, str]:
    """Export a report to PDF."""
    if report_id not in reports_store:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if not PDF_SUPPORT:
        raise HTTPException(
            status_code=501, 
            detail="PDF export not available. Install weasyprint for server-side PDF generation."
        )
    
    report = reports_store[report_id]
    options = options or ExportOptions()
    
    try:
        # Create full HTML document
        full_html = create_full_html_document(
            report["html"], 
            report["css"], 
            options.dict()
        )
        
        # Generate PDF using WeasyPrint
        pdf_bytes = weasyprint.HTML(string=full_html).write_pdf()
        
        # Save PDF file
        filename = f"{options.filename or report_id}.pdf"
        pdf_path = EXPORTS_DIR / filename
        
        async with aiofiles.open(pdf_path, "wb") as f:
            await f.write(pdf_bytes)
        
        return {
            "success": True,
            "filename": filename,
            "download_url": f"/exports/{filename}"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

@router.post("/convert/pdf")
async def convert_html_to_pdf(
    html: str,
    css: str,
    options: Optional[ExportOptions] = None
) -> Dict[str, str]:
    """Convert HTML/CSS directly to PDF."""
    if not PDF_SUPPORT:
        raise HTTPException(
            status_code=501, 
            detail="PDF conversion not available. Install weasyprint for server-side PDF generation."
        )
    
    options = options or ExportOptions()
    
    try:
        # Create full HTML document
        full_html = create_full_html_document(html, css, options.dict())
        
        # Generate PDF
        pdf_bytes = weasyprint.HTML(string=full_html).write_pdf()
        
        # Save PDF file
        filename = f"{options.filename or 'converted'}.pdf"
        pdf_path = EXPORTS_DIR / filename
        
        async with aiofiles.open(pdf_path, "wb") as f:
            await f.write(pdf_bytes)
        
        return {
            "success": True,
            "filename": filename,
            "download_url": f"/exports/{filename}"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF conversion failed: {str(e)}")

# Template Categories Endpoint
@router.get("/templates/categories")
async def get_template_categories() -> List[Dict[str, Any]]:
    """Get template categories with counts."""
    categories = {}
    
    for template in templates_store.values():
        category = template.category
        if category not in categories:
            categories[category] = {
                "id": category,
                "name": category.replace("-", " ").title(),
                "description": f"{category.replace('-', ' ')} analysis reports",
                "icon": get_category_icon(category),
                "template_count": 0
            }
        categories[category]["template_count"] += 1
    
    return list(categories.values())

# Utility Functions
async def save_template_to_file(template: ReportTemplate):
    """Save template to file."""
    template_file = TEMPLATES_DIR / f"{template.id}.json"
    async with aiofiles.open(template_file, "w") as f:
        await f.write(template.json(indent=2))

async def save_report_to_file(report_id: str, report_data: Dict[str, Any]):
    """Save report to file."""
    report_file = REPORTS_DIR / f"{report_id}.json"
    async with aiofiles.open(report_file, "w") as f:
        await f.write(json.dumps(report_data, indent=2))

def process_template_variables(template: str, context: DroneDataContext) -> str:
    """Process template variables with data context."""
    import re
    
    # Replace template variables like ${metadata?.location}
    def replace_var(match):
        var_expr = match.group(1)
        try:
            # Simple variable replacement
            if 'metadata?.location' in var_expr:
                return context.metadata.get('location', 'Unknown Location') if context.metadata else 'Unknown Location'
            elif 'metadata?.date' in var_expr:
                return context.metadata.get('date', datetime.now().strftime('%Y-%m-%d')) if context.metadata else datetime.now().strftime('%Y-%m-%d')
            elif 'analysisResults?.area' in var_expr:
                return str(context.analysisResults.get('area', 0)) if context.analysisResults else '0'
            elif 'metadata?.resolution' in var_expr:
                return context.metadata.get('resolution', '2.3 cm/pixel') if context.metadata else '2.3 cm/pixel'
            elif 'metadata?.imageCount' in var_expr:
                return str(context.metadata.get('imageCount', 0)) if context.metadata else '0'
            else:
                return 'N/A'
        except:
            return 'N/A'
    
    # Replace ${...} patterns
    processed = re.sub(r'\$\{([^}]+)\}', replace_var, template)
    return processed

def apply_customizations(html: str, css: str, customizations: Dict[str, Any]) -> tuple:
    """Apply customizations to HTML and CSS."""
    # Apply color scheme
    if 'colors' in customizations:
        colors = customizations['colors']
        for i, color in enumerate(colors):
            css = css.replace(f'#color{i}', color)
    
    # Apply logo
    if 'logo' in customizations:
        logo_url = customizations['logo']
        html = html.replace('{{LOGO_URL}}', logo_url)
    
    # Apply footer
    if 'footer' in customizations:
        footer_text = customizations['footer']
        html = html.replace('{{FOOTER_TEXT}}', footer_text)
    
    return html, css

def create_full_html_document(html: str, css: str, options: Dict[str, Any]) -> str:
    """Create a complete HTML document for export."""
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Drone Analysis Report</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
        {css}
        @page {{
            size: {options.get('pageSize', 'A4')};
            margin: {options.get('margins', {}).get('top', 20)}mm {options.get('margins', {}).get('right', 20)}mm {options.get('margins', {}).get('bottom', 20)}mm {options.get('margins', {}).get('left', 20)}mm;
        }}
        </style>
    </head>
    <body>
        {html}
    </body>
    </html>
    """

def get_template_name(template_id: str) -> str:
    """Get template name by ID."""
    if template_id in templates_store:
        return templates_store[template_id].name
    return "Unknown Template"

def get_category_icon(category: str) -> str:
    """Get icon for category."""
    icons = {
        "crop-health": "🌱",
        "volume-measurement": "📊",
        "area-survey": "🗺️",
        "inspection": "🏗️",
        "environmental": "🌍"
    }
    return icons.get(category, "📄")

def get_default_template_for_type(report_type: str) -> Optional[str]:
    """Get default template ID for report type."""
    type_mapping = {
        "crop_health": "crop-health-basic",
        "volume": "volume-basic",
        "area": "area-survey-basic"
    }
    return type_mapping.get(report_type)

# Template HTML generators (same as frontend, but server-side)
def get_crop_health_template() -> str:
    return """
    <div style="font-family: 'Inter', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
      <header style="text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #10b981;">
        <h1 style="font-size: 32px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">
          Crop Health Analysis Report
        </h1>
        <p style="font-size: 16px; color: #64748b; margin: 0;">
          NDVI Analysis • ${metadata?.location} • ${metadata?.date}
        </p>
      </header>
      
      <div type="executive-summary"></div>
      <div type="drone-map"></div>
      <div type="analysis-chart"></div>
      <div type="measurement-table"></div>
      <div type="key-findings"></div>
    </div>
    """

def get_volume_template() -> str:
    return """
    <div style="font-family: 'Inter', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
      <header style="text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #3b82f6;">
        <h1 style="font-size: 32px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">
          Volume Measurement Report
        </h1>
        <p style="font-size: 16px; color: #64748b; margin: 0;">
          Stockpile Volume Analysis • ${metadata?.location}
        </p>
      </header>
      
      <div type="executive-summary"></div>
      <div type="drone-map"></div>
      <div type="measurement-table"></div>
      <div type="analysis-chart"></div>
    </div>
    """

def get_area_survey_template() -> str:
    return """
    <div style="font-family: 'Inter', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
      <header style="text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #f59e0b;">
        <h1 style="font-size: 32px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">
          Area Survey Report
        </h1>
        <p style="font-size: 16px; color: #64748b; margin: 0;">
          Land Area Calculation & Boundary Mapping
        </p>
      </header>
      
      <div type="executive-summary"></div>
      <div type="drone-map"></div>
      <div type="measurement-table"></div>
      <div type="key-findings"></div>
    </div>
    """

def get_standard_css() -> str:
    return """
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; }
    h1, h2, h3, h4, h5, h6 { font-weight: 600; margin-bottom: 0.5em; }
    p { margin-bottom: 1em; }
    .prose { max-width: none; }
    @media print {
      body { background-color: white; }
      .no-print { display: none !important; }
    }
    """