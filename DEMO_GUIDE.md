# 🚁 CoDrone Mission Planning Demo Guide

This guide walks you through testing all the new AI-powered mission planning features we've implemented.

## 🚀 Quick Start Demo

### 1. Environment Setup

```bash
# Make sure environment is configured
echo "OPENWEATHER_API_KEY=your_key_here" >> .env

# Start the development servers
./scripts/start.sh
```

**Access Points:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000 (root endpoint)

### 2. Demo Flow Overview

We'll test features in this order:
1. **Weather Integration** - Check conditions for flight planning
2. **Smart Boundary Detection** - AI-powered area suggestions
3. **Mission Planning** - End-to-end AI mission generation
4. **Flight Pattern Generation** - Automated waypoint creation
5. **Parameter Optimization** - Intelligent settings adjustment
6. **KML Export** - Professional flight plan export
7. **Conversational AI** - Chat-based mission planning

---

## 📍 Feature-by-Feature Testing

### 1. Weather API Integration

**Test the weather service:**

```bash
# Test current weather
curl "http://localhost:8000/api/weather?lat=40.7128&lng=-74.0060&type=current"

# Test flight windows
curl "http://localhost:8000/api/weather?lat=40.7128&lng=-74.0060&type=flight-windows&duration=30"

# Test weather forecast
curl "http://localhost:8000/api/weather?lat=40.7128&lng=-74.0060&type=forecast&hours=24"
```

**Expected Results:**
- Current weather conditions with flight assessment
- Optimal flight windows ranked by safety
- 24-hour forecast with suitability ratings

**Frontend Test:**
- Open the mission planner map
- Click "Weather" button
- Should see weather overlay with current conditions

### 2. Smart Boundary Detection

**Test AI boundary suggestions:**

```bash
# Get boundary suggestions for an area
curl -X POST http://localhost:8000/api/boundary-suggestions \
  -H "Content-Type: application/json" \
  -d '{
    "centerLat": 40.7128,
    "centerLng": -74.0060,
    "radiusMeters": 1000,
    "options": {
      "missionType": "survey",
      "maxSuggestions": 3
    }
  }'

# Get just feature analysis
curl "http://localhost:8000/api/boundary-suggestions?action=features&centerLat=40.7128&centerLng=-74.0060&radiusMeters=500"
```

**Expected Results:**
- 3 suggested boundaries with confidence scores
- Detected features (buildings, fields, water, etc.)
- Suitability assessments for each suggestion

**Frontend Test:**
- Right-click on map → "Suggest Boundaries"
- Should show AI-generated boundary options
- Each suggestion should show confidence and reasoning

### 3. Mission Planning Engine

**Test comprehensive mission planning:**

```bash
# Generate full mission plan
curl -X POST http://localhost:8000/api/mission-planning \
  -H "Content-Type: application/json" \
  -d '{
    "boundary": {
      "type": "Polygon",
      "coordinates": [[
        [-74.0100, 40.7100],
        [-74.0050, 40.7100],
        [-74.0050, 40.7150],
        [-74.0100, 40.7150],
        [-74.0100, 40.7100]
      ]]
    },
    "requirements": {
      "missionType": "survey",
      "priority": "high",
      "qualityLevel": "standard"
    },
    "location": {
      "lat": 40.7128,
      "lon": -74.0060,
      "name": "NYC Test Area"
    }
  }'

# Get drone specifications
curl "http://localhost:8000/api/mission-planning?action=drone-specs"

# Get mission type definitions
curl "http://localhost:8000/api/mission-planning?action=mission-types"
```

**Expected Results:**
- Complete mission plan with flight path, weather windows, risk assessment
- Cost estimates and AI recommendations
- Multiple alternative configurations

### 4. Parameter Optimization

**Test intelligent parameter tuning:**

```bash
# Optimize parameters for specific mission
curl -X POST http://localhost:8000/api/parameter-optimization \
  -H "Content-Type: application/json" \
  -d '{
    "requirements": {
      "missionType": "inspection",
      "qualityLevel": "high",
      "priority": "medium",
      "areaSize": 5.5
    },
    "conditions": {
      "windSpeed": 8,
      "temperature": 22,
      "visibility": 10,
      "cloudCover": 30,
      "timeOfDay": "morning",
      "lighting": "good"
    },
    "droneCapabilities": {
      "maxFlightTime": 30,
      "maxSpeed": 20,
      "maxAltitude": 150,
      "windResistance": 12,
      "cameraSpecs": {
        "sensorWidth": 6.17,
        "sensorHeight": 4.55,
        "focalLength": 8.8,
        "megapixels": 20,
        "hasGimbal": true,
        "stabilization": true
      },
      "batteryCapacity": 5000,
      "weight": 1388
    }
  }'

# Get default parameters for mission type
curl "http://localhost:8000/api/parameter-optimization?action=defaults&missionType=survey&qualityLevel=high"
```

**Expected Results:**
- Optimized altitude, speed, overlap percentages
- Performance metrics and quality assessment
- Optimization rationale and alternative configurations
- Warnings and recommendations

### 5. KML/KMZ Export

**Test flight plan export:**

```bash
# Export flight plan as KML
curl -X POST http://localhost:8000/api/export/kml \
  -H "Content-Type: application/json" \
  -d '{
    "type": "waypoints",
    "data": [
      {
        "lat": 40.7128,
        "lng": -74.0060,
        "alt": 120,
        "speed": 10,
        "action": "photo"
      },
      {
        "lat": 40.7130,
        "lng": -74.0058,
        "alt": 120,
        "speed": 10,
        "action": "photo"
      }
    ],
    "options": {
      "platform": "dji",
      "format": "kml",
      "metadata": {
        "missionName": "Test Export",
        "pilotName": "Demo User"
      }
    }
  }'

# Get platform information
curl "http://localhost:8000/api/export/kml?action=platforms"
```

**Expected Results:**
- Valid KML file content ready for download
- Platform-specific formatting (DJI, Litchi, etc.)
- Embedded mission metadata and waypoint details

### 6. AI Conversational Planning

**Test the LangChain agent tools:**

```bash
# Test via chat endpoint
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Plan a survey mission for a 10-hectare agricultural field at coordinates 40.7128, -74.0060. I need high-quality imagery for crop analysis."
      }
    ],
    "session_id": "demo_session"
  }'
```

**Expected AI Response:**
- The agent should use the `plan_drone_mission` tool
- Generate comprehensive mission plan with weather analysis
- Provide specific recommendations for agricultural surveying
- Suggest optimal parameters and flight windows

---

## 🖥️ Frontend Integration Testing

### Mission Planner Interface

1. **Open http://localhost:3000**
2. **Navigate to Mission Planner** (if you have a route set up)
3. **Test Interactive Features:**

   ```typescript
   // Test the new components we built:
   // - MissionPlannerMap component
   // - MissionPlanningPanel component
   ```

   **Expected Interactions:**
   - Draw polygon on map
   - See flight path overlay automatically generated
   - Weather indicator shows current conditions
   - Mission parameters panel updates in real-time
   - Export button generates KML download

### Chat Interface Testing

1. **Open Chat Interface** at main page
2. **Test Mission Planning Commands:**

   ```
   User: "What are the weather conditions for flying at 40.7128, -74.0060?"

   User: "Plan a mapping mission for a construction site. The area is about 5 hectares and I need survey-grade accuracy."

   User: "Optimize flight parameters for inspection of a 50-meter tall building in 15 m/s winds."

   User: "Export the last flight plan for my DJI Mavic 3."
   ```

   **Expected AI Behaviors:**
   - Uses weather checking tools
   - Generates detailed mission plans
   - Provides optimization recommendations
   - Creates KML exports automatically

---

## 🔧 Troubleshooting Common Issues

### Backend Issues

**If weather API fails:**
```bash
# Check if OpenWeather API key is set
echo $OPENWEATHER_API_KEY
# Add key to .env file if missing
```

**If spatial tools fail:**
```bash
# Check if GDAL is available
python -c "from osgeo import gdal; print('GDAL OK')"
# Should print "GDAL OK" or show fallback message
```

**If agent tools aren't loading:**
```bash
# Check tool registry
curl http://localhost:8000/tools
# Should list all mission planning tools
```

### Frontend Issues

**If map doesn't load:**
- Check browser console for Leaflet errors
- Ensure all CSS files are loading properly

**If components don't render:**
- Check that new TypeScript files compile without errors
- Verify import paths are correct

---

## 📊 Expected Demo Results

After running through all tests, you should see:

### ✅ Working Features:
- **Weather Integration**: Live weather data with flight assessments
- **Smart Boundaries**: AI-suggested survey areas with reasoning
- **Mission Planning**: Complete mission plans with risk analysis
- **Flight Patterns**: Automated waypoint generation with visualizations
- **Parameter Optimization**: Intelligent tuning for different scenarios
- **KML Export**: Professional flight plans for various drone platforms
- **AI Chat**: Natural language mission planning and optimization

### 📈 Performance Metrics:
- **API Response Times**: < 2 seconds for most operations
- **Mission Generation**: < 5 seconds for complete plans
- **Boundary Analysis**: < 3 seconds for area suggestions
- **Parameter Optimization**: < 1 second for tuning

### 🎯 Quality Indicators:
- **Mission Plans**: Include weather, risks, costs, alternatives
- **Flight Paths**: Optimized patterns with proper overlap
- **Exports**: Valid KML files compatible with drone software
- **AI Responses**: Contextual and actionable recommendations

---

## 🎪 Demo Script for Presentation

### 5-Minute Demo Flow:

1. **"Show me the weather"** (30 seconds)
   - Open weather API endpoint
   - Show flight conditions assessment

2. **"Find the best survey area"** (60 seconds)
   - Use boundary suggestion API
   - Show AI-detected features and recommendations

3. **"Plan the mission"** (90 seconds)
   - Generate complete mission plan
   - Show flight path, weather windows, risk assessment

4. **"Optimize for my drone"** (60 seconds)
   - Run parameter optimization
   - Show before/after comparison

5. **"Export for flight"** (30 seconds)
   - Generate KML for specific drone platform
   - Show file download

6. **"Ask the AI"** (60 seconds)
   - Demo conversational planning
   - Show agent using tools automatically

### Key Talking Points:
- **"This is the first AI-native drone planning platform"**
- **"Everything is optimized automatically based on conditions"**
- **"Natural language planning - just describe what you want"**
- **"Professional-grade exports for any drone platform"**

---

## 🐛 Testing Checklist

Before demo, verify:

- [ ] All servers start without errors
- [ ] Weather API key is configured
- [ ] All endpoints return valid responses
- [ ] Frontend components render properly
- [ ] Chat interface responds to queries
- [ ] KML exports download correctly
- [ ] Mission plans include all sections
- [ ] Parameter optimization provides alternatives
- [ ] Boundary suggestions show reasoning
- [ ] Weather integration shows current conditions

**Ready to demo!** 🚀
