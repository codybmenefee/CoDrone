/**
 * Weather API Routes
 *
 * Provides weather data and flight condition assessments for mission planning
 */

import { NextRequest, NextResponse } from 'next/server';
import { getWeatherService, WeatherConditions, FlightWindow } from '../../lib/weather/service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '');
    const lon = parseFloat(searchParams.get('lon') || '');
    const type = searchParams.get('type') || 'current';

    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json(
        { error: 'Valid latitude and longitude are required' },
        { status: 400 }
      );
    }

    const weatherService = getWeatherService();

    switch (type) {
      case 'current': {
        const conditions = await weatherService.getCurrentWeather(lat, lon);
        const assessment = weatherService.assessFlightConditions(conditions);

        return NextResponse.json({
          success: true,
          data: {
            conditions,
            flightAssessment: assessment,
            location: { lat, lon },
            timestamp: new Date().toISOString(),
          }
        });
      }

      case 'forecast': {
        const hours = parseInt(searchParams.get('hours') || '48');
        const forecast = await weatherService.getWeatherForecast(lat, lon, hours);

        return NextResponse.json({
          success: true,
          data: {
            forecast,
            location: { lat, lon },
            hours,
            timestamp: new Date().toISOString(),
          }
        });
      }

      case 'flight-windows': {
        const missionDuration = parseInt(searchParams.get('duration') || '30');
        const maxWindows = parseInt(searchParams.get('maxWindows') || '5');
        const flightWindows = await weatherService.findOptimalFlightWindows(
          lat, lon, missionDuration, maxWindows
        );

        return NextResponse.json({
          success: true,
          data: {
            flightWindows,
            location: { lat, lon },
            missionDuration,
            maxWindows,
            timestamp: new Date().toISOString(),
          }
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid weather type. Use: current, forecast, or flight-windows' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      {
        error: 'Weather service error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lat, lon, conditions } = body;

    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json(
        { error: 'Valid latitude and longitude are required' },
        { status: 400 }
      );
    }

    const weatherService = getWeatherService();

    if (conditions) {
      // Assess provided weather conditions
      const assessment = weatherService.assessFlightConditions(conditions);
      return NextResponse.json({
        success: true,
        data: {
          flightAssessment: assessment,
          conditions,
          location: { lat, lon },
          timestamp: new Date().toISOString(),
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Weather conditions are required for assessment' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Weather assessment error:', error);
    return NextResponse.json(
      {
        error: 'Weather assessment failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
