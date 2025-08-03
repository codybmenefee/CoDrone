#!/bin/bash

# CoDrone Mission Planning Feature Test Script
# Tests all new AI-powered mission planning endpoints

echo "🚁 Testing CoDrone Mission Planning Features"
echo "============================================="

BASE_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:3000"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test coordinates (NYC area)
LAT=40.7128
LNG=-74.0060

echo -e "\n${BLUE}🌍 Testing Location: New York City (${LAT}, ${LNG})${NC}"

# Function to test API endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4

    echo -e "\n${YELLOW}Testing: $name${NC}"
    echo "Endpoint: $method $endpoint"

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" "$BASE_URL$endpoint")
        http_code="${response: -3}"
        body="${response%???}"
    else
        response=$(curl -s -w "%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
        http_code="${response: -3}"
        body="${response%???}"
    fi

    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✅ SUCCESS (HTTP $http_code)${NC}"
        # Pretty print first 200 chars of response
        echo "$body" | head -c 200 | jq -r 'if type == "object" then (.success // .message // "Response received") else . end' 2>/dev/null || echo "Response received"
        if [ ${#body} -gt 200 ]; then
            echo "... (truncated)"
        fi
    else
        echo -e "${RED}❌ FAILED (HTTP $http_code)${NC}"
        echo "$body" | jq -r '.error // .message // .' 2>/dev/null || echo "$body"
    fi
}

# Check if servers are running
echo -e "\n${BLUE}🔍 Checking server status...${NC}"

# Test backend
if curl -s "$BASE_URL/health" > /dev/null; then
    echo -e "${GREEN}✅ Backend server running on $BASE_URL${NC}"
else
    echo -e "${RED}❌ Backend server not responding on $BASE_URL${NC}"
    echo "Please start the backend server with: ./scripts/start.sh"
    exit 1
fi

# Test frontend
if curl -s "$FRONTEND_URL" > /dev/null; then
    echo -e "${GREEN}✅ Frontend server running on $FRONTEND_URL${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend server not responding on $FRONTEND_URL${NC}"
    echo "Frontend tests will be skipped"
fi

echo -e "\n${BLUE}🧪 Running API Tests...${NC}"

# 1. Weather API Tests
echo -e "\n${BLUE}1. Weather Integration${NC}"

test_endpoint "Current Weather" "GET" "/api/weather?lat=$LAT&lng=$LNG&type=current"

test_endpoint "Flight Windows" "GET" "/api/weather?lat=$LAT&lng=$LNG&type=flight-windows&duration=30"

test_endpoint "Weather Options" "GET" "/api/weather"

# 2. Boundary Detection Tests
echo -e "\n${BLUE}2. Smart Boundary Detection${NC}"

boundary_data='{
    "centerLat": '$LAT',
    "centerLng": '$LNG',
    "radiusMeters": 1000,
    "options": {
        "missionType": "survey",
        "maxSuggestions": 3,
        "bufferDistance": 10
    }
}'

test_endpoint "Boundary Suggestions" "POST" "/api/boundary-suggestions" "$boundary_data"

test_endpoint "Feature Analysis" "GET" "/api/boundary-suggestions?action=features&centerLat=$LAT&centerLng=$LNG&radiusMeters=500"

test_endpoint "Boundary Options" "GET" "/api/boundary-suggestions?action=options"

# 3. Mission Planning Tests
echo -e "\n${BLUE}3. Mission Planning Engine${NC}"

mission_data='{
    "boundary": {
        "type": "Polygon",
        "coordinates": [[
            ['$LNG', '$LAT'],
            ['$(echo "$LNG + 0.005" | bc)', '$LAT'],
            ['$(echo "$LNG + 0.005" | bc)', '$(echo "$LAT + 0.005" | bc)'],
            ['$LNG', '$(echo "$LAT + 0.005" | bc)'],
            ['$LNG', '$LAT']
        ]]
    },
    "requirements": {
        "missionType": "survey",
        "priority": "high",
        "qualityLevel": "standard"
    },
    "location": {
        "lat": '$LAT',
        "lon": '$LNG',
        "name": "Test Area NYC"
    }
}'

test_endpoint "Mission Plan Generation" "POST" "/api/mission-planning" "$mission_data"

test_endpoint "Drone Specifications" "GET" "/api/mission-planning?action=drone-specs"

test_endpoint "Mission Types" "GET" "/api/mission-planning?action=mission-types"

# 4. Parameter Optimization Tests
echo -e "\n${BLUE}4. Parameter Optimization${NC}"

optimization_data='{
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

test_endpoint "Parameter Optimization" "POST" "/api/parameter-optimization" "$optimization_data"

test_endpoint "Default Parameters" "GET" "/api/parameter-optimization?action=defaults&missionType=survey&qualityLevel=high"

test_endpoint "Mission Type Info" "GET" "/api/parameter-optimization?action=mission-types"

# 5. KML Export Tests
echo -e "\n${BLUE}5. KML/KMZ Export${NC}"

kml_data='{
    "type": "waypoints",
    "data": [
        {
            "lat": '$LAT',
            "lng": '$LNG',
            "alt": 120,
            "speed": 10,
            "action": "photo"
        },
        {
            "lat": '$(echo "$LAT + 0.001" | bc)',
            "lng": '$(echo "$LNG + 0.001" | bc)',
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

test_endpoint "KML Export" "POST" "/api/export/kml" "$kml_data"

test_endpoint "Platform Support" "GET" "/api/export/kml?action=platforms"

test_endpoint "Export Options" "GET" "/api/export/kml?action=options"

# 6. AI Agent Integration Tests
echo -e "\n${BLUE}6. AI Agent Integration${NC}"

chat_data='{
    "messages": [
        {
            "role": "user",
            "content": "Check weather conditions for flying at coordinates '$LAT', '$LNG'"
        }
    ],
    "session_id": "test_session"
}'

test_endpoint "AI Weather Check" "POST" "/chat" "$chat_data"

# Test mission planning via AI
mission_chat_data='{
    "messages": [
        {
            "role": "user",
            "content": "Plan a survey mission for a 5-hectare field at '$LAT', '$LNG'. I need standard quality for agricultural monitoring."
        }
    ],
    "session_id": "test_session_2"
}'

test_endpoint "AI Mission Planning" "POST" "/chat" "$mission_chat_data"

test_endpoint "Available Tools" "GET" "/tools"

# Summary
echo -e "\n${BLUE}📊 Test Summary${NC}"
echo "=============="
echo "✅ All endpoints tested"
echo "📍 Test location: NYC ($LAT, $LNG)"
echo "🌐 Backend: $BASE_URL"
echo "💻 Frontend: $FRONTEND_URL"

echo -e "\n${YELLOW}📋 Manual Testing Recommendations:${NC}"
echo "1. Open $FRONTEND_URL to test frontend components"
echo "2. Try drawing polygons on the map interface"
echo "3. Test the mission planning panel interactions"
echo "4. Verify KML exports download correctly"
echo "5. Test conversational AI planning in chat interface"

echo -e "\n${GREEN}🎉 Mission Planning Feature Test Complete!${NC}"
echo -e "See ${BLUE}DEMO_GUIDE.md${NC} for detailed demo instructions"
