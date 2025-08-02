# 🧪 Report Generation Feature - User Testing Guide

## 🚀 Quick Setup for Testing

### Prerequisites

- Node.js 18+ installed
- Python 3.8+ with virtual environment
- Git repository cloned

### 1. Install Dependencies

```bash
# Frontend dependencies
cd apps/frontend
npm install

# Backend dependencies (in your virtual environment)
cd ../../apps/api-server
pip install aiofiles weasyprint fastapi uvicorn
```

### 2. Start Services

```bash
# Terminal 1: Start Backend API
cd apps/api-server
python main.py
# Server will start on http://localhost:8000

# Terminal 2: Start Frontend
cd apps/frontend
npm run dev
# Frontend will start on http://localhost:5173
```

### 3. Verify Installation

- Backend: Visit http://localhost:8000/docs (FastAPI docs)
- Frontend: Visit http://localhost:5173 (React app)
- Chat Interface: Test AI agent tools in the chat

---

## 🎯 **Testing Scenarios**

### **Scenario 1: AI Agent Report Generation**

**Test Steps:**

1. Open chat interface
2. Type: "Generate a crop health report for Farm A with 45.7 hectares surveyed"
3. Verify AI agent responds with report generation options
4. Check that report ID is generated
5. Verify edit URL is provided

**Expected Results:**

- AI agent suggests appropriate template
- Report ID is created (format: `report_xxxxxxxx`)
- Edit URL points to report builder

### **Scenario 2: Template Selection**

**Test Steps:**

1. Navigate to `/report-builder` (or use edit URL from Scenario 1)
2. Click "Choose Template" if prompted
3. Browse different template categories
4. Preview templates using "Preview" button
5. Select a template and verify it loads

**Expected Results:**

- 6 template categories visible
- Template previews show sample content
- Selected template loads in editor

### **Scenario 3: Visual Report Editing**

**Test Steps:**

1. Open report builder with a template
2. Drag components from left sidebar to canvas
3. Resize and move components
4. Edit text content
5. Change component properties in right sidebar
6. Save changes

**Expected Results:**

- Drag-and-drop works smoothly
- Components resize and move properly
- Property panel updates component appearance
- Save functionality works

### **Scenario 4: Custom Drone Components**

**Test Steps:**

1. Add "Drone Map" component
2. Add "Analysis Chart" component
3. Add "Measurement Table" component
4. Add "Executive Summary" component
5. Add "Key Findings" component
6. Customize each component's properties

**Expected Results:**

- All drone components available in sidebar
- Components display with sample drone data
- Properties panel shows relevant options
- Components render correctly in preview

### **Scenario 5: Export Functionality**

**Test Steps:**

1. Create or load a report
2. Click "Export" button
3. Choose PDF format
4. Set custom filename
5. Configure page size and orientation
6. Export and download file

**Expected Results:**

- Export modal opens with options
- PDF generates successfully
- File downloads with correct name
- PDF contains all report content

### **Scenario 6: Report Preview & Sharing**

**Test Steps:**

1. Open a generated report
2. Test print preview mode
3. Try share functionality
4. Test different export formats (PDF/HTML)
5. Verify print-friendly styling

**Expected Results:**

- Print preview shows clean layout
- Share generates link (if backend supports)
- Both PDF and HTML export work
- Print styling removes UI elements

---

## 🔍 **API Testing**

### **Test Backend Endpoints**

```bash
# Test template listing
curl http://localhost:8000/reports/templates

# Test report generation
curl -X POST http://localhost:8000/reports/generate \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "crop-health-basic",
    "title": "Test Report",
    "dataContext": {
      "analysisResults": {"area": 45.7},
      "metadata": {"location": "Test Farm", "date": "2024-01-15"}
    }
  }'

# Test AI report generation
curl -X POST http://localhost:8000/reports/generate/ai \
  -H "Content-Type: application/json" \
  -d '{
    "analysisData": "Test analysis data",
    "reportType": "crop_health"
  }'
```

---

## 🐛 **Common Issues & Solutions**

### **Frontend Issues**

**Problem:** GrapesJS not loading

- **Solution:** Check browser console for errors, verify all dependencies installed

**Problem:** Components not draggable

- **Solution:** Ensure GrapesJS is properly initialized, check for JavaScript errors

**Problem:** Export not working

- **Solution:** Verify html2pdf.js is loaded, check browser console

### **Backend Issues**

**Problem:** API endpoints not responding

- **Solution:** Check if FastAPI server is running, verify port 8000

**Problem:** PDF generation fails

- **Solution:** Install weasyprint: `pip install weasyprint`

**Problem:** Import errors

- **Solution:** Ensure all Python dependencies are installed in virtual environment

---

## 📊 **Testing Checklist**

### **Core Functionality**

- [ ] AI agent can generate reports
- [ ] Templates load correctly
- [ ] Drag-and-drop editing works
- [ ] Components render properly
- [ ] Save functionality works
- [ ] Export to PDF works
- [ ] Export to HTML works
- [ ] Print preview works

### **User Experience**

- [ ] Interface is intuitive
- [ ] Loading states are shown
- [ ] Error messages are clear
- [ ] Responsive design works
- [ ] Keyboard shortcuts work
- [ ] Undo/redo functionality

### **Data Integration**

- [ ] Drone data populates correctly
- [ ] Template variables are replaced
- [ ] AI insights are relevant
- [ ] Export includes all data
- [ ] Reports are saved properly

---

## 🎯 **User Testing Script**

### **Introduction (2 minutes)**

"Today we're testing a new report generation feature for drone data analysis. You'll be able to create professional reports using AI assistance and a visual editor."

### **Task 1: Generate Report via AI (5 minutes)**

"Please ask the AI agent to generate a crop health report for a farm with 45.7 hectares surveyed."

### **Task 2: Customize Report (10 minutes)**

"Now let's customize the report. Try adding a map component, editing the title, and changing some colors."

### **Task 3: Export Report (3 minutes)**

"Export your report as a PDF with a custom filename."

### **Task 4: Share Report (2 minutes)**

"Try sharing your report with someone else."

### **Feedback Questions**

1. How intuitive was the interface?
2. What was most challenging?
3. What features would you like to see added?
4. How likely are you to use this feature?

---

## 📈 **Success Metrics**

### **Technical Metrics**

- Page load time < 3 seconds
- Component drag response < 100ms
- Export generation < 30 seconds
- Zero critical errors

### **User Experience Metrics**

- Task completion rate > 90%
- User satisfaction score > 4/5
- Time to first report < 5 minutes
- Feature adoption rate

---

## 🚨 **Emergency Rollback**

If critical issues are found:

```bash
# Revert to previous version
git checkout main
git pull origin main

# Or specific commit
git checkout <commit-hash>
```

---

## 📞 **Support & Debugging**

### **Logs to Check**

- Browser console (F12)
- Backend terminal output
- Network tab for API calls

### **Common Commands**

```bash
# Check if services are running
lsof -i :8000  # Backend
lsof -i :5173  # Frontend

# Restart services
pkill -f "python main.py"
pkill -f "vite"
```

---

## ✅ **Testing Completion**

After completing all scenarios:

1. Document any bugs found
2. Note user feedback
3. Test on different browsers
4. Verify mobile responsiveness
5. Check accessibility features

**Ready to test! 🚀**
