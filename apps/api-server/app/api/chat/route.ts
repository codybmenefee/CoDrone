/**
 * Main Chat API Route for Vercel AI SDK
 *
 * This endpoint handles chat interactions with streaming support,
 * tool calling, and session management.
 */

import { streamText, convertToCoreMessages } from 'ai';
import { openai } from '@ai-sdk/openai';
import { NextRequest } from 'next/server';
import { nanoid } from 'nanoid';

import { aiSdkTools } from '../../lib/ai-sdk/tools';
import { sessionManager } from '../../lib/ai-sdk/memory';
import { ChatMessage } from '../../types/chat';

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are an AI-powered drone data analysis assistant with advanced spatial analysis capabilities. You have access to various tools for volume calculation, area measurement, and photogrammetry processing.

SPATIAL TOOLS USAGE:
The following tools require GeoJSON polygon coordinates in string format:

1. calculateVolumeFromPolygon(polygonCoordinates: string, dsmFilePath: string, baseElevation?: number, measurementName?: string)
   - polygonCoordinates: Must be a valid GeoJSON polygon as JSON string
   - Example: '{"type": "Polygon", "coordinates": [[[lon1, lat1], [lon2, lat2], [lon3, lat3], [lon1, lat1]]]}'
   - Returns volume in cubic meters with detailed statistics

2. calculatePolygonArea(polygonCoordinates: string, coordinateSystem?: string, measurementName?: string)
   - polygonCoordinates: Same GeoJSON format as above
   - Returns area in square meters, hectares, and acres

3. analyzeElevationProfile(polygonCoordinates: string, dsmFilePath: string, measurementName?: string)
   - polygonCoordinates: Same GeoJSON format as above
   - Returns elevation statistics within the polygon

4. processImagesWithODM(imagePaths: string[], outputPath: string, processingOptions?: object)
   - Process drone images to generate orthomosaics, DSMs, and point clouds

5. listAvailableDatasets(locationFilter?: string, dataType?: string)
   - List available datasets for analysis with metadata

IMPORTANT RULES:
- NEVER use placeholder text like "Polygon 2" or "the polygon" as polygon coordinates
- ALWAYS require actual GeoJSON coordinates from the user or map component
- If user mentions "measure the area of that polygon" or similar, ask them to provide the polygon coordinates
- If coordinates are not provided, explain that you need the actual polygon data to perform calculations
- For map-based interactions, the frontend should provide the coordinates automatically

EXAMPLE INTERACTIONS:
User: "Calculate the area of this polygon"
Assistant: "I need the actual polygon coordinates to calculate the area. Could you please provide the GeoJSON coordinates of the polygon you'd like me to measure?"

User: "Measure the volume of that pile"
Assistant: "I need the polygon coordinates that define the boundary of the pile, plus the path to the DSM file. Could you provide the polygon coordinates and DSM file path?"

Be helpful, accurate, and explain technical concepts clearly. Always validate that you have proper coordinate data before attempting spatial calculations.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, sessionId } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid messages format', { status: 400 });
    }

    // Get or create session
    let session = await sessionManager.getSession(sessionId);
    if (!session) {
      session = await sessionManager.createSession(sessionId);
    }

    // Convert messages to core format for AI SDK
    const coreMessages = convertToCoreMessages(messages);

    // Start streaming response
    const result = await streamText({
      model: openai('gpt-4o'),
      system: SYSTEM_PROMPT,
      messages: coreMessages,
      tools: {
        volumeCalculationTool: aiSdkTools[0],
        areaCalculationTool: aiSdkTools[1],
        elevationAnalysisTool: aiSdkTools[2],
        imageProcessingTool: aiSdkTools[3],
        listAvailableDatasets: aiSdkTools[4],
      },
      maxTokens: 4000,
      temperature: 0.1,
      onFinish: async ({ text, toolCalls }) => {
        // Save assistant message to session
        const assistantMessage: ChatMessage = {
          id: nanoid(),
          role: 'assistant',
          content: text,
          timestamp: new Date().toISOString(),
          metadata: {
            toolCalls: toolCalls?.map(tc => ({
              id: tc.toolCallId,
              toolName: tc.toolName,
              parameters: tc.args,
              result: undefined, // Tool results are handled separately
              status: 'completed' as const,
              timestamp: new Date().toISOString(),
            })),
            sessionId: session.id,
          },
        };

        await sessionManager.addMessage(session.id, assistantMessage);
      },
    });

    return result.toDataStreamResponse({
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Chat API Error:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : 'Unknown error'
            : 'An error occurred while processing your request',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
