# Vercel AI SDK Test Implementation

This is a comprehensive test implementation of the Vercel AI SDK v5 showcasing:

## Features Demonstrated

### 🛠️ Tool Calling
- **Server-side tools** (auto-executed): Weather, Calculator, Random Data Generator
- **Client-side auto tools**: Browser Info, Location Service  
- **Client-side user interaction tools**: Confirmation Dialogs, File Management

### 🎨 UI Components
- Real-time message streaming with `useChat` hook
- Rich tool call visualization with different states
- Status indicators and error handling
- Modern, responsive design with Tailwind CSS

### 🔧 Advanced Features
- Automatic tool result submission with `sendAutomaticallyWhen`
- Tool call streaming with progress indicators
- Typed tool parts with state management
- Error handling and recovery

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. **Navigate to the test directory:**
   ```bash
   cd test-vercel-ai-sdk
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Copy `.env.local` and add your OpenAI API key:
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Testing the Implementation

### Server-side Tools (Auto-executed)

Try these prompts to test server-side tools:

```
"What's the weather in Paris?"
"Calculate 15 * 42 + 7"  
"Generate 3 random emails"
"Create 5 random UUIDs"
```

### Client-side Auto Tools

Try these prompts to test client-side auto tools:

```
"Get my current location"
"Show my browser information" 
```

### Client-side User Interaction Tools

Try these prompts to test user interaction tools:

```
"Ask me for confirmation to delete all files"
"Help me upload a document"
"Confirm before proceeding with the operation"
```

## Architecture Overview

### Backend (`/api/chat/route.ts`)
- Uses `streamText` from AI SDK Core
- Implements 7 different tools with various execution patterns
- Supports tool call streaming
- Error handling and development/production mode differences

### Frontend (`/page.tsx`)
- Uses `useChat` hook from AI SDK UI  
- Implements comprehensive tool UI rendering
- Handles different tool states (input-streaming, input-available, output-available, output-error)
- Auto-submission with `lastAssistantMessageIsCompleteWithToolCalls`

### Tool Types

1. **Server-side Tools** (have `execute` function):
   - `getWeatherInformation`: Mock weather API
   - `calculate`: Mathematical expression evaluation
   - `generateRandomData`: Random data generation

2. **Client-side Auto Tools** (handled in `onToolCall`):
   - `getBrowserInfo`: Browser/device information
   - `getUserLocation`: Geolocation API

3. **Client-side User Interaction Tools** (rendered in UI):
   - `askForConfirmation`: Confirmation dialogs
   - `manageFile`: File operation simulation

## Key Concepts Demonstrated

### Message Parts Structure (v5)
```typescript
interface UIMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  parts: UIMessagePart[] // New in v5
  metadata?: unknown
}
```

### Tool State Management
```typescript
// Tool parts have different states:
'input-streaming'   // Tool input being generated
'input-available'   // Tool input complete, awaiting execution  
'output-available'  // Tool execution complete with result
'output-error'      // Tool execution failed
```

### Automatic Tool Execution
```typescript
// Server-side (auto-executed)
tools: {
  myTool: {
    description: '...',
    parameters: zodSchema,
    execute: async (input) => result // Has execute function
  }
}

// Client-side auto (handled in onToolCall)
onToolCall: async ({ toolCall }) => {
  if (toolCall.toolName === 'myTool') {
    const result = await doSomething()
    addToolResult({ tool: 'myTool', toolCallId, output: result })
  }
}

// Client-side user interaction (rendered in UI)
// Tool definition without execute function
// Results added via UI button clicks
```

## File Structure

```
test-vercel-ai-sdk/
├── src/
│   └── app/
│       ├── api/
│       │   └── chat/
│       │       └── route.ts        # API endpoint with tools
│       ├── page.tsx                # Main chat interface
│       └── layout.tsx              # App layout
├── .env.local                      # Environment variables
├── package.json                    # Dependencies
└── README.md                       # This file
```

## Dependencies

- **ai**: Core AI SDK library
- **@ai-sdk/openai**: OpenAI provider
- **@ai-sdk/react**: React UI hooks
- **zod**: Schema validation for tools
- **lucide-react**: Icons
- **tailwindcss**: Styling

## Troubleshooting

### Common Issues

1. **API Key not working:**
   - Ensure your OpenAI API key is correctly set in `.env.local`
   - Check that the key has sufficient credits
   - Verify no extra spaces or quotes around the key

2. **Tool calls not working:**
   - Check browser console for JavaScript errors
   - Ensure `onToolCall` handler is properly implemented
   - Verify tool definitions match exactly between server and client

3. **Location permission denied:**
   - Ensure you're running on HTTPS (or localhost for development)
   - Check browser location permissions
   - The geolocation API requires user permission

4. **Streaming not working:**
   - Verify `maxDuration` is set in the API route
   - Check network tab for streaming response format
   - Ensure `toUIMessageStreamResponse()` is used

### Development Tips

1. **Enable verbose logging:**
   ```typescript
   // In onToolCall
   console.log('Tool call received:', toolCall)
   
   // In API route  
   console.log('Messages received:', messages)
   ```

2. **Test tool schemas:**
   Use Zod's safeParse to validate tool inputs:
   ```typescript
   const result = schema.safeParse(input)
   if (!result.success) {
     console.error('Validation error:', result.error)
   }
   ```

3. **Debug message structure:**
   Add this to see the full message structure:
   ```typescript
   console.log('Message parts:', message.parts)
   ```

## Next Steps

- Add file upload capabilities
- Implement message persistence
- Add more AI providers (Anthropic, Google)
- Create custom tool types
- Add authentication and user management
- Implement streaming structured objects

## Resources

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/)
- [AI SDK Cheat Sheet](../docs/VERCEL_AI_SDK_CHEATSHEET.md)
- [Tool Calling Guide](https://sdk.vercel.ai/docs/ai-sdk-ui/chatbot-with-tool-calling)
- [OpenAI Tools Documentation](https://platform.openai.com/docs/guides/function-calling)
