/**
 * Elevation Analysis API Route
 * 
 * Direct endpoint for elevation analysis without chat interface
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeElevationProfile } from '@/lib/spatial/processor';
import { ElevationAnalysisSchema } from '@/types/tools';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body using Zod schema
    const validation = ElevationAnalysisSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request parameters',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }
    
    const { polygonCoordinates, dsmFilePath, measurementName } = validation.data;
    
    // Analyze elevation using spatial processor
    const result = await analyzeElevationProfile(
      polygonCoordinates,
      dsmFilePath,
      measurementName
    );
    
    return NextResponse.json(result, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
    
  } catch (error) {
    console.error('Elevation analysis error:', error);
    
    return NextResponse.json(
      {
        error: 'Elevation analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}