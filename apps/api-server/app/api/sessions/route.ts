/**
 * Session Management API Route
 *
 * Handle chat session operations (list, create, delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/ai-sdk/memory';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const sessions = await sessionManager.listRecentSessions(limit);

    return NextResponse.json(
      {
        sessions,
        totalCount: sessions.length,
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (error) {
    console.error('Session listing error:', error);

    return NextResponse.json(
      {
        error: 'Failed to list sessions',
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title } = body;

    const session = await sessionManager.createSession(title);

    return NextResponse.json(
      {
        success: true,
        session: {
          id: session.id,
          title: session.metadata.title,
          createdAt: session.metadata.createdAt,
          messageCount: session.messages.length,
        },
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Session creation error:', error);

    return NextResponse.json(
      {
        error: 'Failed to create session',
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

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID parameter required' },
        { status: 400 }
      );
    }

    await sessionManager.deleteSession(sessionId);

    return NextResponse.json(
      {
        success: true,
        message: `Session ${sessionId} deleted successfully`,
        sessionId: sessionId,
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Session deletion error:', error);

    return NextResponse.json(
      {
        error: 'Session deletion failed',
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
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
