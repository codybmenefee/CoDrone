/**
 * Area Calculation API Route
 *
 * Direct endpoint for area calculations without chat interface
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculatePolygonArea } from '@/lib/spatial/processor';
import { AreaCalculationSchema } from '@/types/tools';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body using Zod schema
    const validation = AreaCalculationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request parameters',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { polygonCoordinates, coordinateSystem, measurementName } =
      validation.data;

    // Calculate area using spatial processor
    const result = await calculatePolygonArea({
      polygonCoordinates,
      coordinateSystem,
      measurementName,
    });

    return NextResponse.json(result, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Area calculation error:', error);

    return NextResponse.json(
      {
        error: 'Area calculation failed',
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
