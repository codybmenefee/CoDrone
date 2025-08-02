import { openai } from '@ai-sdk/openai';
import { convertToModelMessages, streamText, UIMessage } from 'ai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages: convertToModelMessages(messages),
    system:
      'You are a helpful AI assistant with access to a calculator tool. Use it when users ask for mathematical calculations.',
    tools: {
      calculate: {
        description: 'Perform mathematical calculations',
        parameters: zodToJsonSchema(
          z.object({
            expression: z
              .string()
              .describe(
                'Mathematical expression to evaluate (e.g., "2 + 3 * 4")'
              ),
          })
        ),
        execute: async ({ expression }) => {
          try {
            // Basic math evaluation (in production, use a safer math parser)
            const allowedChars = /^[0-9+\-*/().\s]+$/;
            if (!allowedChars.test(expression)) {
              throw new Error('Invalid characters in expression');
            }

            const result = Function(`"use strict"; return (${expression})`)();
            return {
              expression,
              result: result.toString(),
              type: 'number',
            };
          } catch (error) {
            return {
              expression,
              error: 'Invalid mathematical expression',
              type: 'error',
            };
          }
        },
      },
    },
  });

  return result.toUIMessageStreamResponse({
    // Forward actual errors in development
    onError: error => {
      console.error('Chat API Error:', error);
      return process.env.NODE_ENV === 'development'
        ? error.message
        : 'An error occurred while processing your request.';
    },
  });
}
