/**
 * Parameter Optimization API Routes
 *
 * Provides AI-powered optimization of flight parameters based on mission requirements,
 * environmental conditions, and drone capabilities.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  ParameterOptimizationService,
  optimizeForMission,
  getRecommendedParametersForMissionType,
  MissionRequirements,
  EnvironmentalConditions,
  DroneCapabilities,
  OptimizationConstraints,
  FlightParameters
} from '../../lib/parameter-optimization/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      requirements,
      conditions,
      droneCapabilities,
      constraints = {},
      baseParameters,
    } = body;

    // Validate required fields
    if (!requirements || !requirements.missionType) {
      return NextResponse.json(
        { error: 'Mission requirements with missionType are required' },
        { status: 400 }
      );
    }

    if (!conditions) {
      return NextResponse.json(
        { error: 'Environmental conditions are required' },
        { status: 400 }
      );
    }

    if (!droneCapabilities) {
      return NextResponse.json(
        { error: 'Drone capabilities are required' },
        { status: 400 }
      );
    }

    // Validate mission type
    const validMissionTypes = ['survey', 'inspection', 'mapping', 'monitoring', 'search_rescue'];
    if (!validMissionTypes.includes(requirements.missionType)) {
      return NextResponse.json(
        { error: `Invalid mission type. Must be one of: ${validMissionTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate quality level
    const validQualityLevels = ['draft', 'standard', 'high', 'survey_grade'];
    if (requirements.qualityLevel && !validQualityLevels.includes(requirements.qualityLevel)) {
      return NextResponse.json(
        { error: `Invalid quality level. Must be one of: ${validQualityLevels.join(', ')}` },
        { status: 400 }
      );
    }

    // Perform optimization
    const optimizationResult = await optimizeForMission(
      requirements as MissionRequirements,
      conditions as EnvironmentalConditions,
      droneCapabilities as DroneCapabilities,
      constraints as OptimizationConstraints,
      baseParameters as Partial<FlightParameters>
    );

    return NextResponse.json({
      success: true,
      data: optimizationResult,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Parameter optimization error:', error);
    return NextResponse.json(
      {
        error: 'Parameter optimization failed',
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
      case 'defaults': {
        const missionType = searchParams.get('missionType');
        const qualityLevel = searchParams.get('qualityLevel') || 'standard';

        if (!missionType) {
          return NextResponse.json(
            { error: 'Mission type is required for defaults' },
            { status: 400 }
          );
        }

        const validMissionTypes = ['survey', 'inspection', 'mapping', 'monitoring', 'search_rescue'];
        if (!validMissionTypes.includes(missionType)) {
          return NextResponse.json(
            { error: `Invalid mission type. Must be one of: ${validMissionTypes.join(', ')}` },
            { status: 400 }
          );
        }

        const defaultParameters = getRecommendedParametersForMissionType(missionType, qualityLevel);

        return NextResponse.json({
          success: true,
          data: {
            missionType,
            qualityLevel,
            parameters: defaultParameters,
            description: `Default parameters optimized for ${missionType} missions at ${qualityLevel} quality level`,
          },
          timestamp: new Date().toISOString(),
        });
      }

      case 'mission-types': {
        return NextResponse.json({
          success: true,
          data: {
            missionTypes: [
              {
                id: 'survey',
                name: 'Area Survey',
                description: 'Comprehensive mapping and data collection over large areas',
                typicalParameters: {
                  altitude: '100-150m',
                  speed: '8-12 m/s',
                  overlap: '70-80%',
                  cameraAngle: '0° (nadir)',
                },
                applications: ['Agricultural monitoring', 'Land surveying', 'Environmental assessment'],
                qualityLevels: ['draft', 'standard', 'high', 'survey_grade'],
              },
              {
                id: 'inspection',
                name: 'Infrastructure Inspection',
                description: 'Detailed examination of structures and buildings',
                typicalParameters: {
                  altitude: '30-80m',
                  speed: '3-6 m/s',
                  overlap: '80-90%',
                  cameraAngle: '-10° to -30°',
                },
                applications: ['Building inspection', 'Bridge assessment', 'Tower inspection'],
                qualityLevels: ['standard', 'high', 'survey_grade'],
              },
              {
                id: 'mapping',
                name: 'Detailed Mapping',
                description: 'High-accuracy mapping for cartographic and engineering purposes',
                typicalParameters: {
                  altitude: '80-120m',
                  speed: '6-10 m/s',
                  overlap: '75-85%',
                  cameraAngle: '0° (nadir)',
                },
                applications: ['Topographic mapping', 'Urban planning', 'Engineering design'],
                qualityLevels: ['standard', 'high', 'survey_grade'],
              },
              {
                id: 'monitoring',
                name: 'Environmental Monitoring',
                description: 'Regular monitoring for change detection and analysis',
                typicalParameters: {
                  altitude: '120-200m',
                  speed: '10-15 m/s',
                  overlap: '60-70%',
                  cameraAngle: '0° (nadir)',
                },
                applications: ['Crop monitoring', 'Environmental change', 'Progress tracking'],
                qualityLevels: ['draft', 'standard', 'high'],
              },
              {
                id: 'search_rescue',
                name: 'Search & Rescue',
                description: 'Rapid area coverage for emergency response',
                typicalParameters: {
                  altitude: '60-100m',
                  speed: '8-15 m/s',
                  overlap: '60-80%',
                  cameraAngle: '0° to -20°',
                },
                applications: ['Missing person search', 'Disaster response', 'Emergency assessment'],
                qualityLevels: ['draft', 'standard', 'high'],
              },
            ],
            qualityLevels: [
              {
                id: 'draft',
                name: 'Draft Quality',
                description: 'Quick overview with basic accuracy',
                overlap: '50-60%',
                gsd: '5-10 cm/pixel',
                applications: ['Initial assessment', 'Progress monitoring'],
              },
              {
                id: 'standard',
                name: 'Standard Quality',
                description: 'Good balance of speed and accuracy',
                overlap: '60-70%',
                gsd: '2-5 cm/pixel',
                applications: ['General mapping', 'Regular monitoring'],
              },
              {
                id: 'high',
                name: 'High Quality',
                description: 'Detailed analysis and measurement',
                overlap: '70-80%',
                gsd: '1-3 cm/pixel',
                applications: ['Detailed inspection', 'Analysis work'],
              },
              {
                id: 'survey_grade',
                name: 'Survey Grade',
                description: 'Professional surveying accuracy',
                overlap: '80-90%',
                gsd: '0.5-2 cm/pixel',
                applications: ['Professional surveying', 'Engineering design'],
              },
            ],
          },
        });
      }

      case 'constraints': {
        return NextResponse.json({
          success: true,
          data: {
            parameterRanges: {
              altitude: { min: 10, max: 500, unit: 'meters', typical: '50-150' },
              speed: { min: 1, max: 25, unit: 'm/s', typical: '5-15' },
              overlapForward: { min: 50, max: 95, unit: '%', typical: '60-85' },
              overlapSide: { min: 40, max: 90, unit: '%', typical: '50-75' },
              imageInterval: { min: 0.5, max: 10, unit: 'seconds', typical: '1-3' },
              cameraAngle: { min: -90, max: 30, unit: 'degrees', typical: '-30 to 0' },
            },
            regulatoryLimits: {
              maxAltitudeNoPermit: 120, // meters
              maxAltitudeWithPermit: 500, // meters
              minVisibilityVFR: 3, // km
              maxWindSpeedRecommended: 15, // m/s
              dayOnlyOperations: true,
            },
            safetyRecommendations: {
              batteryReserve: 20, // percent
              windSpeedMargin: 5, // m/s below drone limit
              altitudeBuffer: 10, // meters below obstacles
              emergencyLandingRange: 500, // meters
            },
            optimizationFactors: [
              'Mission type and objectives',
              'Required data quality',
              'Environmental conditions',
              'Drone capabilities and limitations',
              'Regulatory compliance',
              'Battery life and flight time',
              'Data processing requirements',
              'Operator experience level',
            ],
          },
        });
      }

      case 'environmental-factors': {
        return NextResponse.json({
          success: true,
          data: {
            weatherFactors: [
              {
                parameter: 'Wind Speed',
                impact: 'Flight stability and battery consumption',
                recommendations: {
                  '<5 m/s': 'Excellent conditions',
                  '5-10 m/s': 'Good conditions, monitor closely',
                  '10-15 m/s': 'Marginal conditions, reduce speed',
                  '>15 m/s': 'Not recommended for flight',
                },
              },
              {
                parameter: 'Visibility',
                impact: 'Visual line of sight and image quality',
                recommendations: {
                  '>10 km': 'Excellent visibility',
                  '5-10 km': 'Good visibility',
                  '3-5 km': 'Marginal, consider postponing',
                  '<3 km': 'Poor, flight not recommended',
                },
              },
              {
                parameter: 'Cloud Cover',
                impact: 'Image consistency and lighting',
                recommendations: {
                  '<25%': 'Excellent lighting conditions',
                  '25-50%': 'Good conditions',
                  '50-75%': 'Variable lighting, increase overlap',
                  '>75%': 'Poor lighting consistency',
                },
              },
              {
                parameter: 'Temperature',
                impact: 'Battery performance and equipment operation',
                recommendations: {
                  '10-25°C': 'Optimal operating temperature',
                  '0-10°C or 25-35°C': 'Acceptable with monitoring',
                  '<0°C or >35°C': 'Extreme conditions, reduced performance',
                },
              },
            ],
            seasonalConsiderations: {
              spring: ['Variable weather', 'Increased wind', 'Growing vegetation'],
              summer: ['Long daylight hours', 'Heat effects', 'Thermal updrafts'],
              fall: ['Changing light conditions', 'Increased precipitation', 'Shorter days'],
              winter: ['Reduced battery life', 'Snow interference', 'Limited daylight'],
            },
            timeOfDayEffects: {
              morning: ['Stable air', 'Good lighting', 'Lower temperature'],
              midday: ['Strong sun angle', 'Thermal activity', 'Harsh shadows'],
              afternoon: ['Stable conditions', 'Good visibility', 'Increasing wind'],
              evening: ['Low sun angle', 'Calm air', 'Reducing visibility'],
            },
          },
        });
      }

      case 'drone-profiles': {
        return NextResponse.json({
          success: true,
          data: {
            consumerDrones: [
              {
                name: 'DJI Mini Series',
                category: 'Ultra-light consumer',
                capabilities: {
                  maxFlightTime: 30,
                  maxSpeed: 16,
                  maxAltitude: 4000,
                  windResistance: 8,
                  weight: 249,
                },
                recommendations: {
                  bestFor: ['Casual mapping', 'Small area surveys'],
                  limitations: ['Wind sensitivity', 'Limited payload'],
                },
              },
              {
                name: 'DJI Air/Mavic Series',
                category: 'Consumer/prosumer',
                capabilities: {
                  maxFlightTime: 34,
                  maxSpeed: 19,
                  maxAltitude: 6000,
                  windResistance: 10,
                  weight: 570,
                },
                recommendations: {
                  bestFor: ['General mapping', 'Real estate', 'Small surveys'],
                  limitations: ['No RTK', 'Consumer-grade camera'],
                },
              },
            ],
            professionalDrones: [
              {
                name: 'DJI Phantom 4 RTK',
                category: 'Survey/mapping',
                capabilities: {
                  maxFlightTime: 30,
                  maxSpeed: 20,
                  maxAltitude: 6000,
                  windResistance: 10,
                  weight: 1391,
                  hasRTK: true,
                },
                recommendations: {
                  bestFor: ['Professional surveying', 'High-accuracy mapping'],
                  limitations: ['Shorter flight time', 'Weather dependent'],
                },
              },
              {
                name: 'DJI Matrice Series',
                category: 'Industrial/enterprise',
                capabilities: {
                  maxFlightTime: 55,
                  maxSpeed: 23,
                  maxAltitude: 7000,
                  windResistance: 15,
                  weight: 3800,
                  hasRTK: true,
                },
                recommendations: {
                  bestFor: ['Large area surveys', 'Industrial inspection'],
                  limitations: ['Higher cost', 'Requires training'],
                },
              },
            ],
          },
        });
      }

      default: {
        return NextResponse.json({
          success: true,
          data: {
            availableActions: [
              'defaults - Get default parameters for a mission type',
              'mission-types - Get available mission types and their characteristics',
              'constraints - Get parameter ranges and constraints',
              'environmental-factors - Get environmental impact information',
              'drone-profiles - Get drone capability profiles',
            ],
            usage: {
              POST: 'Optimize parameters for specific requirements',
              GET: 'Get information about optimization options',
            },
            parameterOptimization: {
              description: 'AI-powered optimization of flight parameters based on multiple factors',
              factors: [
                'Mission type and objectives',
                'Environmental conditions',
                'Drone capabilities',
                'Quality requirements',
                'Regulatory constraints',
                'Safety considerations',
              ],
              benefits: [
                'Improved data quality',
                'Optimized flight efficiency',
                'Enhanced safety margins',
                'Regulatory compliance',
                'Reduced flight time',
                'Better resource utilization',
              ],
            },
          },
        });
      }
    }
  } catch (error) {
    console.error('Parameter optimization info error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get parameter optimization information',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
