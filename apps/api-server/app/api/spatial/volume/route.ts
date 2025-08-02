/**
 * Volume Calculation API Route
 * 
 * Direct endpoint for volume calculations without chat interface
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateVolumeFromPolygon } from '@/lib/spatial/processor';
import { VolumeCalculationSchema } from '@/types/tools';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body using Zod schema
    const validation = VolumeCalculationSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request parameters',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }
    
    const { polygonCoordinates, dsmFilePath, baseElevation, measurementName } = validation.data;
    
    // Calculate volume using spatial processor
    const result = await calculateVolumeFromPolygon(
      polygonCoordinates,
      dsmFilePath,
      baseElevation,
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
    console.error('Volume calculation error:', error);
    
    return NextResponse.json(
      {
        error: 'Volume calculation failed',
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