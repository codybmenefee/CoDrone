/**
 * Mission Planning API Routes
 *
 * Provides intelligent mission planning with AI optimization, weather integration,
 * and comprehensive risk assessment for drone operations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { MissionPlanningService, IntelligentMissionParams, MissionPlan } from '../../lib/mission-planning/service';
import { DroneSpecifications } from '../../lib/flight-patterns/algorithms';
import { getWeatherService } from '../../lib/weather/service';

// Default drone specifications (can be made configurable)
const DEFAULT_DRONE_SPECS: DroneSpecifications = {
  maxFlightTime: 30, // minutes
  maxSpeed: 20, // m/s
  maxAltitude: 150, // meters
  cameraSpecs: {
    sensorWidth: 6.17, // mm
    sensorHeight: 4.55, // mm
    focalLength: 8.8, // mm
    megapixels: 20,
  },
  batteryCapacity: 5000, // mAh
  weight: 1500, // grams
  windResistance: 12, // m/s max
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      boundary,
      requirements,
      droneSpecs = DEFAULT_DRONE_SPECS,
      baseParameters,
      constraints,
      location,
    }: IntelligentMissionParams = body;

    // Validate required fields
    if (!boundary || !Array.isArray(boundary) || boundary.length < 3) {
      return NextResponse.json(
        { error: 'Valid boundary polygon with at least 3 points is required' },
        { status: 400 }
      );
    }

    if (!requirements || !requirements.missionType) {
      return NextResponse.json(
        { error: 'Mission requirements with missionType are required' },
        { status: 400 }
      );
    }

    if (!location || typeof location.lat !== 'number' || typeof location.lon !== 'number') {
      return NextResponse.json(
        { error: 'Valid location with lat and lon coordinates is required' },
        { status: 400 }
      );
    }

    // Create mission planning service
    const weatherService = getWeatherService();
    const missionPlanningService = new MissionPlanningService(droneSpecs, weatherService);

    // Generate intelligent mission plan
    const missionPlan = await missionPlanningService.generateIntelligentMissionPlan({
      boundary,
      requirements,
      droneSpecs,
      baseParameters,
      constraints,
      location,
    });

    return NextResponse.json({
      success: true,
      data: missionPlan,
    });

  } catch (error) {
    console.error('Mission planning error:', error);
    return NextResponse.json(
      {
        error: 'Mission planning failed',
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
      case 'drone-specs': {
        return NextResponse.json({
          success: true,
          data: {
            default: DEFAULT_DRONE_SPECS,
            presets: {
              'dji-mavic-3': {
                maxFlightTime: 46,
                maxSpeed: 19,
                maxAltitude: 6000,
                cameraSpecs: {
                  sensorWidth: 17.3,
                  sensorHeight: 13.0,
                  focalLength: 24,
                  megapixels: 20,
                },
                batteryCapacity: 5000,
                weight: 895,
                windResistance: 12,
              },
              'dji-phantom-4': {
                maxFlightTime: 28,
                maxSpeed: 20,
                maxAltitude: 6000,
                cameraSpecs: {
                  sensorWidth: 6.17,
                  sensorHeight: 4.55,
                  focalLength: 8.8,
                  megapixels: 20,
                },
                batteryCapacity: 5870,
                weight: 1388,
                windResistance: 10,
              },
              'autel-evo-2': {
                maxFlightTime: 40,
                maxSpeed: 19,
                maxAltitude: 7000,
                cameraSpecs: {
                  sensorWidth: 6.4,
                  sensorHeight: 4.8,
                  focalLength: 9,
                  megapixels: 48,
                },
                batteryCapacity: 7100,
                weight: 1127,
                windResistance: 12,
              },
            },
          },
        });
      }

      case 'mission-types': {
        return NextResponse.json({
          success: true,
          data: {
            survey: {
              description: 'Area mapping and surveying',
              typicalParameters: {
                altitude: 120,
                overlapForward: 80,
                overlapSide: 70,
                speed: 10,
              },
              deliverables: ['orthomosaic', 'dsm', 'point_cloud'],
            },
            inspection: {
              description: 'Infrastructure and asset inspection',
              typicalParameters: {
                altitude: 50,
                overlapForward: 90,
                overlapSide: 80,
                speed: 5,
              },
              deliverables: ['video', 'orthomosaic'],
            },
            mapping: {
              description: 'Detailed cartographic mapping',
              typicalParameters: {
                altitude: 100,
                overlapForward: 85,
                overlapSide: 75,
                speed: 8,
              },
              deliverables: ['orthomosaic', 'dsm', 'point_cloud'],
            },
            monitoring: {
              description: 'Periodic monitoring and change detection',
              typicalParameters: {
                altitude: 150,
                overlapForward: 60,
                overlapSide: 50,
                speed: 15,
              },
              deliverables: ['orthomosaic', 'video'],
            },
            search_rescue: {
              description: 'Search and rescue operations',
              typicalParameters: {
                altitude: 80,
                overlapForward: 70,
                overlapSide: 60,
                speed: 12,
              },
              deliverables: ['video', 'thermal'],
            },
          },
        });
      }

      case 'constraints-template': {
        return NextResponse.json({
          success: true,
          data: {
            maxFlightTime: 25, // minutes
            batteryCapacity: 5000, // mAh
            maxWindSpeed: 10, // m/s
            minVisibility: 3, // km
            timeWindow: {
              start: new Date().toISOString(),
              end: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours from now
            },
            restrictedZones: [], // Array of polygon coordinates
            obstacles: [], // Array of obstacle definitions
          },
        });
      }

      default: {
        return NextResponse.json({
          success: true,
          data: {
            availableActions: [
              'drone-specs - Get available drone specifications',
              'mission-types - Get mission type definitions and parameters',
              'constraints-template - Get template for mission constraints',
            ],
          },
        });
      }
    }
  } catch (error) {
    console.error('Mission planning info error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get mission planning information',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { missionId, updates } = body;

    if (!missionId) {
      return NextResponse.json(
        { error: 'Mission ID is required for updates' },
        { status: 400 }
      );
    }

    // In a real implementation, this would update a stored mission plan
    // For now, we'll return a success response
    return NextResponse.json({
      success: true,
      message: 'Mission plan updated successfully',
      data: {
        missionId,
        updatedAt: new Date().toISOString(),
        updates,
      },
    });

  } catch (error) {
    console.error('Mission plan update error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update mission plan',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const missionId = searchParams.get('missionId');

    if (!missionId) {
      return NextResponse.json(
        { error: 'Mission ID is required for deletion' },
        { status: 400 }
      );
    }

    // In a real implementation, this would delete a stored mission plan
    // For now, we'll return a success response
    return NextResponse.json({
      success: true,
      message: 'Mission plan deleted successfully',
      data: {
        missionId,
        deletedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Mission plan deletion error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete mission plan',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
