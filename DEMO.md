# 🚁 Canopy Copilot Demo Guide

This guide shows you how to explore the features of Canopy Copilot.

## 🎯 What You Can Do

### 1. **Chat with the AI Agent**
Try these example queries:

**Data Analysis**
- "What datasets are available for analysis?"
- "Analyze the orthomosaic from Farm A"
- "Show me the Farm A multispectral data"

**Area Calculations**
- "Calculate the area of this field: [[40.7128, -74.0060], [40.7138, -74.0050], [40.7148, -74.0070], [40.7128, -74.0080]]"
- "How many hectares is a field with 6 coordinate points?"

**Processing Estimates**
- "Estimate processing time for NDVI analysis with 300 images"
- "How long will it take to create a 3D model from 500 images?"

**Report Generation**
- "Generate a crop health report preview for Farm A data"
- "Create an inspection report for the solar farm data"

### 2. **Tool Visualization**
- When the AI uses tools, you'll see:
  - Tool name and status
  - Input parameters (expandable)
  - Output results (formatted)
  - Execution timeline

### 3. **File Upload** 
- Drag and drop files into the chat
- Supported: Images, PDFs, GeoJSON, CSV, TXT
- Files are referenced in AI responses

### 4. **Session Management**
- Conversations persist during your session
- Clear chat to start fresh
- Connection status indicator

## 🧪 Running the Demo Script

For a programmatic demo of the agent capabilities:

```bash
# Make sure you have OPENAI_API_KEY set
python scripts/demo.py
```

This runs 5 demo queries and shows:
- Tool usage patterns
- Agent reasoning
- Response formatting

## 🔧 Available Tools

The demo includes 5 tools:

1. **simulate_drone_analysis**: Analyze drone imagery
2. **calculate_field_area**: Calculate areas from coordinates  
3. **estimate_processing_time**: Estimate task completion times
4. **generate_report_preview**: Preview report contents
5. **list_available_datasets**: Show available data

## 💡 Tips for Best Results

**Good Queries:**
- "Analyze the July 2024 orthomosaic from Farm A"
- "Calculate area for coordinates: [[lat, lon], ...]"
- "Generate a crop health report for my vineyard data"

**Avoid:**
- Single words: "NDVI"
- Too vague: "Help me"
- No context: "Calculate this"

## 🚀 What's Next?

This is Phase 1. Coming in Phase 2:
- Real drone data processing (ODM integration)
- Async background jobs
- GrapesJS report editor
- Map-based polygon drawing
- Persistent storage with PostgreSQL

## 🐛 Troubleshooting

**Backend won't start?**
- Check your OpenAI API key in `.env`
- Ensure Python dependencies are installed
- Check port 8000 isn't in use

**Frontend connection errors?**
- Ensure backend is running on port 8000
- Check browser console for errors
- Try refreshing the connection

**Tools not working?**
- Check the API docs: http://localhost:8000/docs
- Verify tool registration in `/tools` endpoint
- Check backend logs for errors