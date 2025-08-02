import { openai } from '@ai-sdk/openai';
import { convertToModelMessages, streamText, UIMessage } from 'ai';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages: convertToModelMessages(messages),
    system: 'You are a helpful AI assistant with access to various tools. Use them to help users with their requests.',
    tools: {
      // Server-side tool: Weather information (auto-executed)
      getWeatherInformation: {
        description: 'Get the current weather information for a given city',
        parameters: z.object({
          city: z.string().describe('The city name to get weather for'),
          unit: z.enum(['celsius', 'fahrenheit']).optional().describe('Temperature unit preference')
        }),
        execute: async ({ city, unit = 'celsius' }) => {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock weather data
          const weatherOptions = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy'];
          const weather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
          const temp = unit === 'celsius' ? 
            Math.floor(Math.random() * 30 + 5) : 
            Math.floor(Math.random() * 86 + 41);
          
          return {
            city,
            weather,
            temperature: `${temp}°${unit === 'celsius' ? 'C' : 'F'}`,
            humidity: `${Math.floor(Math.random() * 40 + 30)}%`,
            timestamp: new Date().toISOString()
          };
        },
      },

      // Server-side tool: Mathematical calculations (auto-executed)
      calculate: {
        description: 'Perform mathematical calculations',
        parameters: z.object({
          expression: z.string().describe('Mathematical expression to evaluate (e.g., "2 + 3 * 4")')
        }),
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
              type: 'number'
            };
          } catch (error) {
            return {
              expression,
              error: 'Invalid mathematical expression',
              type: 'error'
            };
          }
        },
      },

      // Server-side tool: Generate random data (auto-executed)
      generateRandomData: {
        description: 'Generate random data like names, emails, or UUIDs',
        parameters: z.object({
          type: z.enum(['name', 'email', 'uuid', 'color', 'number']).describe('Type of random data to generate'),
          count: z.number().min(1).max(10).optional().describe('Number of items to generate (default: 1)')
        }),
        execute: async ({ type, count = 1 }) => {
          const generators = {
            name: () => {
              const names = ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Eva Brown'];
              return names[Math.floor(Math.random() * names.length)];
            },
            email: () => {
              const domains = ['example.com', 'test.org', 'demo.net'];
              const usernames = ['user', 'test', 'demo', 'sample'];
              return `${usernames[Math.floor(Math.random() * usernames.length)]}${Math.floor(Math.random() * 1000)}@${domains[Math.floor(Math.random() * domains.length)]}`;
            },
            uuid: () => crypto.randomUUID(),
            color: () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
            number: () => Math.floor(Math.random() * 1000)
          };

          const results = Array.from({ length: count }, () => generators[type]());
          return { type, count, results };
        },
      },

      // Client-side tool: Confirmation dialog (requires user interaction)
      askForConfirmation: {
        description: 'Ask the user for confirmation before proceeding with an action',
        parameters: z.object({
          message: z.string().describe('The confirmation message to show to the user'),
          action: z.string().describe('The action that requires confirmation')
        }),
        // No execute function = client-side tool
      },

      // Client-side tool: User location (auto-executed on client)
      getUserLocation: {
        description: 'Get the user\'s current location using browser geolocation API',
        parameters: z.object({
          accuracy: z.enum(['low', 'high']).optional().describe('Accuracy level for location request')
        }),
        // No execute function = client-side tool
      },

      // Client-side tool: File operations (user interaction required)
      manageFile: {
        description: 'Help user with file management operations',
        parameters: z.object({
          operation: z.enum(['upload', 'download', 'delete']).describe('File operation to perform'),
          filename: z.string().optional().describe('Name of the file'),
          fileType: z.string().optional().describe('Type of file (e.g., image, document)')
        }),
        // No execute function = client-side tool
      },

      // Client-side tool: Browser information (auto-executed on client)
      getBrowserInfo: {
        description: 'Get information about the user\'s browser and device',
        parameters: z.object({}),
        // No execute function = client-side tool
      }
    },
  });

  return result.toUIMessageStreamResponse({
    // Forward actual errors in development
    onError: (error) => {
      console.error('Chat API Error:', error);
      return process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'An error occurred while processing your request.';
    }
  });
}