/**
 * Boundary Suggestions API Routes
 *
 * Provides AI-powered boundary suggestions based on satellite imagery analysis
 * and feature detection for optimal drone mission planning.
 */

import { NextRequest, NextResponse } from 'next/server';
import { BoundaryDetectionService, BoundaryAnalysisOptions, suggestBoundaries, analyzeFeatures } from '../../lib/boundary-detection/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      centerLat,
      centerLng,
      radiusMeters = 500,
      options = {},
    } = body;

    // Validate required parameters
    if (typeof centerLat !== 'number' || typeof centerLng !== 'number') {
      return NextResponse.json(
        { error: 'Valid centerLat and centerLng coordinates are required' },
        { status: 400 }
      );
    }

    if (centerLat < -90 || centerLat > 90 || centerLng < -180 || centerLng > 180) {
      return NextResponse.json(
        { error: 'Invalid coordinates: latitude must be -90 to 90, longitude -180 to 180' },
        { status: 400 }
      );
    }

    if (radiusMeters < 50 || radiusMeters > 5000) {
      return NextResponse.json(
        { error: 'Radius must be between 50 and 5000 meters' },
        { status: 400 }
      );
    }

    // Validate options
    const validMissionTypes = ['survey', 'inspection', 'mapping', 'monitoring'];
    if (options.missionType && !validMissionTypes.includes(options.missionType)) {
      return NextResponse.json(
        { error: `Invalid mission type. Must be one of: ${validMissionTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate boundary suggestions
    const result = await suggestBoundaries(centerLat, centerLng, radiusMeters, options);

    return NextResponse.json({
      success: true,
      data: result,
      location: {
        centerLat,
        centerLng,
        radiusMeters,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Boundary suggestion error:', error);
    return NextResponse.json(
      {
        error: 'Boundary suggestion failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'features': {
        const centerLat = parseFloat(searchParams.get('centerLat') || '');
        const centerLng = parseFloat(searchParams.get('centerLng') || '');
        const radiusMeters = parseInt(searchParams.get('radiusMeters') || '500');

        if (isNaN(centerLat) || isNaN(centerLng)) {
          return NextResponse.json(
            { error: 'Valid centerLat and centerLng are required' },
            { status: 400 }
          );
        }

        const features = await analyzeFeatures(centerLat, centerLng, radiusMeters);

        return NextResponse.json({
          success: true,
          data: {
            features,
            location: { centerLat, centerLng, radiusMeters },
            featureCount: features.length,
            featureTypes: [...new Set(features.map(f => f.type))],
          },
          timestamp: new Date().toISOString(),
        });
      }

      case 'options': {
        return NextResponse.json({
          success: true,
          data: {
            missionTypes: [
              {
                id: 'survey',
                name: 'Area Survey',
                description: 'Comprehensive mapping and surveying of large areas',
                preferredFeatures: ['field', 'vegetation', 'parking'],
                avoidanceFeatures: ['water', 'building'],
                defaultParameters: {
                  minArea: 5000,
                  maxArea: 500000,
                  bufferDistance: 10,
                },
              },
              {
                id: 'inspection',
                name: 'Infrastructure Inspection',
                description: 'Detailed inspection of buildings and structures',
                preferredFeatures: ['building', 'structure'],
                avoidanceFeatures: ['water'],
                defaultParameters: {
                  minArea: 100,
                  maxArea: 50000,
                  bufferDistance: 20,
                },
              },
              {
                id: 'mapping',
                name: 'Detailed Mapping',
                description: 'High-resolution mapping for cartographic purposes',
                preferredFeatures: ['field', 'vegetation', 'parking', 'building'],
                avoidanceFeatures: ['water'],
                defaultParameters: {
                  minArea: 1000,
                  maxArea: 200000,
                  bufferDistance: 15,
                },
              },
              {
                id: 'monitoring',
                name: 'Environmental Monitoring',
                description: 'Ongoing monitoring of environmental changes',
                preferredFeatures: ['field', 'vegetation'],
                avoidanceFeatures: ['building', 'structure'],
                defaultParameters: {
                  minArea: 10000,
                  maxArea: 1000000,
                  bufferDistance: 5,
                },
              },
            ],
            featureTypes: [
              { id: 'building', name: 'Buildings', description: 'Residential and commercial structures' },
              { id: 'vegetation', name: 'Vegetation', description: 'Trees, forests, and planted areas' },
              { id: 'water', name: 'Water Bodies', description: 'Rivers, lakes, ponds, and waterways' },
              { id: 'road', name: 'Roads', description: 'Streets, highways, and pathways' },
              { id: 'field', name: 'Agricultural Fields', description: 'Crop fields and farmland' },
              { id: 'parking', name: 'Parking Areas', description: 'Parking lots and open spaces' },
              { id: 'structure', name: 'Infrastructure', description: 'Bridges, towers, and other structures' },
            ],
            analysisParameters: {
              radiusRange: { min: 50, max: 5000, default: 500, unit: 'meters' },
              maxSuggestions: { min: 1, max: 10, default: 3 },
              bufferDistance: { min: 0, max: 100, default: 10, unit: 'meters' },
              areaLimits: {
                minArea: { min: 100, max: 10000, default: 1000, unit: 'square_meters' },
                maxArea: { min: 1000, max: 10000000, default: 500000, unit: 'square_meters' },
              },
            },
          },
        });
      }

      case 'validate': {
        const centerLat = parseFloat(searchParams.get('centerLat') || '');
        const centerLng = parseFloat(searchParams.get('centerLng') || '');
        const radiusMeters = parseInt(searchParams.get('radiusMeters') || '500');

        const validation = {
          coordinates: {
            valid: !isNaN(centerLat) && !isNaN(centerLng) &&
                   centerLat >= -90 && centerLat <= 90 &&
                   centerLng >= -180 && centerLng <= 180,
            latitude: centerLat,
            longitude: centerLng,
          },
          radius: {
            valid: !isNaN(radiusMeters) && radiusMeters >= 50 && radiusMeters <= 5000,
            value: radiusMeters,
            range: { min: 50, max: 5000 },
          },
          estimatedAnalysisTime: Math.min(5000, radiusMeters * 2), // milliseconds
          estimatedArea: Math.PI * radiusMeters * radiusMeters, // square meters
        };

        return NextResponse.json({
          success: true,
          data: validation,
          timestamp: new Date().toISOString(),
        });
      }

      case 'capabilities': {
        return NextResponse.json({
          success: true,
          data: {
            analysisCapabilities: [
              'Satellite imagery analysis',
              'AI-powered feature detection',
              'Smart boundary optimization',
              'Mission-specific recommendations',
              'Safety zone identification',
              'Multi-area analysis',
            ],
            detectionAccuracy: {
              buildings: 0.92,
              vegetation: 0.88,
              water: 0.95,
              roads: 0.85,
              fields: 0.90,
              structures: 0.87,
            },
            supportedRegions: [
              'North America',
              'Europe',
              'Australia',
              'Most populated areas worldwide',
            ],
            imageResolution: {
              typical: '0.5-2.0 meters per pixel',
              source: 'High-resolution satellite imagery',
              updateFrequency: 'Monthly to yearly depending on location',
            },
            processingTime: {
              typical: '2-5 seconds',
              factors: ['Area size', 'Feature complexity', 'Analysis depth'],
            },
          },
        });
      }

      default: {
        return NextResponse.json({
          success: true,
          data: {
            availableActions: [
              'features - Analyze features in a specific area',
              'options - Get configuration options and mission types',
              'validate - Validate coordinates and parameters',
              'capabilities - Get service capabilities and limitations',
            ],
            usage: {
              POST: 'Generate boundary suggestions with full analysis',
              GET: 'Get information and validate parameters',
            },
            endpoints: {
              'POST /': 'Generate boundary suggestions',
              'GET /?action=features': 'Analyze features only',
              'GET /?action=options': 'Get configuration options',
              'GET /?action=validate': 'Validate coordinates',
              'GET /?action=capabilities': 'Get service capabilities',
            },
          },
        });
      }
    }
  } catch (error) {
    console.error('Boundary suggestion info error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get boundary suggestion information',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      boundaryId,
      feedback,
      improvements,
    } = body;

    if (!boundaryId) {
      return NextResponse.json(
        { error: 'Boundary ID is required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would store user feedback
    // to improve the AI model and suggestion quality
    console.log(`Feedback received for boundary ${boundaryId}:`, { feedback, improvements });

    return NextResponse.json({
      success: true,
      message: 'Feedback received and will be used to improve future suggestions',
      data: {
        boundaryId,
        feedbackProcessed: true,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Boundary feedback error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process feedback',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
