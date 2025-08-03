/**
 * KML/KMZ Export API Routes
 *
 * Provides endpoints for exporting flight plans and mission plans to KML/KMZ format
 * for use with various drone platforms and flight controllers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { KMLGenerator, KMLGenerationOptions, generateKMLFromFlightPlan, generateKMZFromMissionPlan } from '../../../lib/kml/generator';
import { FlightPlan, Waypoint } from '../../../lib/flight-patterns/algorithms';
import { MissionPlan } from '../../../lib/mission-planning/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type, // 'flightPlan', 'missionPlan', or 'waypoints'
      data, // The actual flight plan, mission plan, or waypoints array
      options, // KML generation options
    } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Type and data are required' },
        { status: 400 }
      );
    }

    const kmlOptions: Partial<KMLGenerationOptions> = {
      format: 'kml',
      platform: 'generic',
      includePolygon: true,
      includeAltitudes: true,
      useRelativeAltitude: true,
      ...options,
    };

    let result;

    switch (type) {
      case 'flightPlan': {
        if (!isValidFlightPlan(data)) {
          return NextResponse.json(
            { error: 'Invalid flight plan data' },
            { status: 400 }
          );
        }
        result = generateKMLFromFlightPlan(data as FlightPlan, kmlOptions);
        break;
      }

      case 'missionPlan': {
        if (!isValidMissionPlan(data)) {
          return NextResponse.json(
            { error: 'Invalid mission plan data' },
            { status: 400 }
          );
        }
        result = generateKMZFromMissionPlan(data as MissionPlan, kmlOptions);
        break;
      }

      case 'waypoints': {
        if (!Array.isArray(data) || !isValidWaypointsArray(data)) {
          return NextResponse.json(
            { error: 'Invalid waypoints data - must be array of waypoint objects' },
            { status: 400 }
          );
        }
        const generator = new KMLGenerator(kmlOptions as KMLGenerationOptions);
        result = generator.generateFromWaypoints(data as Waypoint[], options?.missionName);
        break;
      }

      default: {
        return NextResponse.json(
          { error: 'Invalid type. Use: flightPlan, missionPlan, or waypoints' },
          { status: 400 }
        );
      }
    }

    // Return the KML content with appropriate headers
    return new NextResponse(result.content, {
      status: 200,
      headers: {
        'Content-Type': result.format === 'kml' ? 'application/vnd.google-earth.kml+xml' : 'application/vnd.google-earth.kmz',
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'Content-Length': result.size.toString(),
        'X-Waypoint-Count': result.waypointCount.toString(),
        'X-Generated-At': result.metadata.generatedAt,
        'X-Platform': result.metadata.platform,
      },
    });

  } catch (error) {
    console.error('KML export error:', error);
    return NextResponse.json(
      {
        error: 'KML export failed',
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
      case 'platforms': {
        return NextResponse.json({
          success: true,
          data: {
            platforms: [
              {
                id: 'dji',
                name: 'DJI',
                description: 'DJI drones with DJI GO/DJI Fly apps',
                supportedFormats: ['kml'],
                features: ['waypoints', 'camera_actions', 'speed_control'],
              },
              {
                id: 'autel',
                name: 'Autel',
                description: 'Autel drones with Autel Explorer app',
                supportedFormats: ['kml'],
                features: ['waypoints', 'altitude_control'],
              },
              {
                id: 'parrot',
                name: 'Parrot',
                description: 'Parrot drones with FreeFlight app',
                supportedFormats: ['kml'],
                features: ['waypoints', 'flight_plans'],
              },
              {
                id: 'litchi',
                name: 'Litchi',
                description: 'Litchi flight planning app',
                supportedFormats: ['kml'],
                features: ['waypoints', 'poi', 'camera_actions', 'curved_paths'],
              },
              {
                id: 'pix4d',
                name: 'Pix4D',
                description: 'Pix4D Capture for mapping missions',
                supportedFormats: ['kml'],
                features: ['grid_missions', 'double_grid', 'polygon_mapping'],
              },
              {
                id: 'generic',
                name: 'Generic KML',
                description: 'Standard KML format for any compatible software',
                supportedFormats: ['kml', 'kmz'],
                features: ['waypoints', 'flight_path', 'polygons', 'metadata'],
              },
            ],
          },
        });
      }

      case 'options': {
        return NextResponse.json({
          success: true,
          data: {
            formats: ['kml', 'kmz'],
            altitudeModes: ['relativeToGround', 'absolute'],
            styleOptions: {
              lineColors: {
                red: 'ff0000ff',
                blue: 'ffff0000',
                green: 'ff00ff00',
                yellow: 'ff00ffff',
                purple: 'ffff00ff',
                orange: 'ff0099ff',
              },
              waypointIcons: [
                'http://maps.google.com/mapfiles/kml/pal4/icon57.png', // Default
                'http://maps.google.com/mapfiles/kml/pal2/icon18.png', // Blue
                'http://maps.google.com/mapfiles/kml/pal3/icon35.png', // Green
                'http://maps.google.com/mapfiles/kml/pal4/icon46.png', // Red
              ],
            },
            metadataFields: [
              'missionName',
              'pilotName',
              'droneModel',
              'createdBy',
            ],
          },
        });
      }

      case 'template': {
        const platform = searchParams.get('platform') || 'generic';
        return NextResponse.json({
          success: true,
          data: {
            template: getKMLOptionsTemplate(platform),
          },
        });
      }

      default: {
        return NextResponse.json({
          success: true,
          data: {
            availableActions: [
              'platforms - Get supported drone platforms and formats',
              'options - Get available KML generation options',
              'template - Get KML options template for a specific platform',
            ],
            usage: {
              export: 'POST with { type, data, options }',
              types: ['flightPlan', 'missionPlan', 'waypoints'],
              formats: ['kml', 'kmz'],
            },
          },
        });
      }
    }
  } catch (error) {
    console.error('KML export info error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get KML export information',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Validation functions
function isValidFlightPlan(data: any): data is FlightPlan {
  return (
    data &&
    typeof data === 'object' &&
    Array.isArray(data.waypoints) &&
    data.waypoints.length > 0 &&
    typeof data.estimatedFlightTime === 'number' &&
    typeof data.estimatedDistance === 'number' &&
    data.metadata &&
    typeof data.metadata === 'object'
  );
}

function isValidMissionPlan(data: any): data is MissionPlan {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    data.flightPlan &&
    isValidFlightPlan(data.flightPlan) &&
    data.requirements &&
    typeof data.requirements === 'object'
  );
}

function isValidWaypointsArray(data: any[]): data is Waypoint[] {
  return data.every((waypoint) =>
    waypoint &&
    typeof waypoint === 'object' &&
    typeof waypoint.lat === 'number' &&
    typeof waypoint.lng === 'number' &&
    typeof waypoint.alt === 'number' &&
    waypoint.lat >= -90 &&
    waypoint.lat <= 90 &&
    waypoint.lng >= -180 &&
    waypoint.lng <= 180 &&
    waypoint.alt >= 0
  );
}

// Template generator
function getKMLOptionsTemplate(platform: string): KMLGenerationOptions {
  const baseTemplate: KMLGenerationOptions = {
    format: 'kml',
    platform: platform as any,
    includePolygon: true,
    includeAltitudes: true,
    useRelativeAltitude: true,
    styleOptions: {
      lineColor: 'ff0000ff',
      lineWidth: 2,
      waypointIcon: 'http://maps.google.com/mapfiles/kml/pal4/icon57.png',
      polygonColor: '660000ff',
      polygonOpacity: 0.4,
    },
    metadata: {
      missionName: 'Drone Mission',
      pilotName: 'Pilot Name',
      droneModel: 'Drone Model',
      createdBy: 'CoDrone Mission Planner',
    },
  };

  // Platform-specific customizations
  switch (platform) {
    case 'dji':
      return {
        ...baseTemplate,
        useRelativeAltitude: true,
        styleOptions: {
          ...baseTemplate.styleOptions,
          lineColor: 'ffff0000', // Blue for DJI
        },
      };

    case 'litchi':
      return {
        ...baseTemplate,
        includeAltitudes: true,
        styleOptions: {
          ...baseTemplate.styleOptions,
          lineColor: 'ff00ff00', // Green for Litchi
          waypointIcon: 'http://maps.google.com/mapfiles/kml/pal2/icon18.png',
        },
      };

    case 'pix4d':
      return {
        ...baseTemplate,
        format: 'kml',
        includePolygon: true,
        styleOptions: {
          ...baseTemplate.styleOptions,
          lineColor: 'ff0099ff', // Orange for Pix4D
        },
      };

    default:
      return baseTemplate;
  }
}
