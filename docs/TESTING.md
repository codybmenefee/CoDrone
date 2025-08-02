# CoDrone Testing Guide

## 🧪 Testing Framework

CoDrone uses a comprehensive testing strategy with both backend (Python) and frontend (JavaScript) test suites.

### Running Tests

```bash
# Run all tests with coverage
make test

# Backend tests only
make test-backend
pytest tests/test_spatial_tools.py -v  # Run specific test file

# Frontend tests only
make test-frontend
```

## 🎯 Testing Scenarios

### Core Functionality Tests

#### Spatial Analysis
1. **Volume Calculation**: Test with real DSM data and polygon coordinates
2. **Area Measurement**: Verify geodesic calculations accuracy
3. **Elevation Analysis**: Test statistical summaries and data validation

#### File Processing
1. **Upload Validation**: Test file type detection and size limits
2. **Storage Management**: Verify metadata preservation
3. **Integration**: Test file-to-tool pipeline

#### Chat Interface
1. **AI Agent Integration**: Test tool selection and execution
2. **Streaming Responses**: Verify real-time updates
3. **Session Management**: Test conversation persistence

### Report Generation Testing

#### AI Agent Report Generation
1. Open chat interface
2. Type: "Generate a crop health report for Farm A with 45.7 hectares surveyed"
3. Verify AI agent responds with report generation options
4. Check that report ID is generated
5. Verify edit URL is provided

#### Visual Report Editing
1. Open report builder with a template
2. Drag components from left sidebar to canvas
3. Resize and move components
4. Edit text content
5. Change component properties in right sidebar
6. Save changes

#### Export Functionality
1. Create or load a report
2. Click "Export" button
3. Choose PDF format
4. Set custom filename
5. Configure page size and orientation
6. Export and download file

## 🔍 API Testing

### Backend Endpoints
```bash
# Test spatial volume calculation
curl -X POST http://localhost:8000/api/spatial/volume \
  -H "Content-Type: application/json" \
  -d '{
    "polygon": {"type": "Polygon", "coordinates": [...]},
    "rasterPath": "path/to/dsm.tif"
  }'

# Test file upload
curl -X POST http://localhost:8000/api/upload \
  -F "file=@test.tif" \
  -F "type=dsm"
```

## 🐛 Common Issues & Solutions

### Frontend Issues
- **GrapesJS not loading**: Check browser console for errors
- **Components not draggable**: Ensure GrapesJS is properly initialized
- **Export not working**: Verify html2pdf.js is loaded

### Backend Issues
- **API endpoints not responding**: Check if server is running on correct port
- **GDAL errors**: Ensure GDAL system dependencies are installed
- **File upload fails**: Check directory permissions and file size limits

## 📊 Success Metrics

### Technical Metrics
- Page load time < 3 seconds
- Tool execution time < 5 seconds
- Export generation < 30 seconds
- Zero critical errors

### User Experience Metrics
- Task completion rate > 90%
- User satisfaction score > 4/5
- Time to first report < 5 minutes
- Feature adoption rate

## 🚨 Troubleshooting

### Debugging Commands
```bash
# Check if services are running
lsof -i :8000  # Backend
lsof -i :3000  # Frontend

# View logs
make docker-logs  # Docker logs
tail -f logs/app.log  # Application logs
```

### Environment Issues
1. **GDAL not found**: Install system GDAL dependencies
2. **OpenAI API key not set**: Check environment variables
3. **File permissions**: Ensure data/ directory is writable
4. **Port conflicts**: Check for running services on required ports
