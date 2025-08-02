# Vercel AI SDK Cheat Sheet

## Overview
The AI SDK is a TypeScript toolkit for building AI-powered applications with unified provider support, streaming responses, and framework-agnostic UI components.

## Core Libraries

### AI SDK Core
- **Purpose**: Unified API for text generation, structured objects, tool calls, agents
- **Key Functions**: `generateText`, `streamText`, `generateObject`, `streamObject`

### AI SDK UI  
- **Purpose**: Framework-agnostic hooks for chat and generative interfaces
- **Key Hooks**: `useChat`, `useCompletion`, `useObject`

## Installation

```bash
# Core packages
npm install ai @ai-sdk/openai @ai-sdk/react

# Provider-specific (choose one or more)
npm install @ai-sdk/anthropic @ai-sdk/google @ai-sdk/mistral
```

## Provider Setup

```typescript
// OpenAI
import { openai } from '@ai-sdk/openai'
const model = openai('gpt-4o')

// Anthropic  
import { anthropic } from '@ai-sdk/anthropic'
const model = anthropic('claude-sonnet-4-20250514')

// Google
import { google } from '@ai-sdk/google'
const model = google('gemini-2.5-flash')
```

## AI SDK Core

### Basic Text Generation

```typescript
import { generateText, streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

// Generate text (non-streaming)
const { text } = await generateText({
  model: openai('gpt-4o'),
  prompt: 'What is love?'
})

// Stream text
const result = streamText({
  model: openai('gpt-4o'),
  prompt: 'Tell me a story',
  temperature: 0.7,
  maxTokens: 500
})
```

### Tool Calling

```typescript
import { streamText } from 'ai'
import { z } from 'zod'

const result = streamText({
  model: openai('gpt-4o'),
  messages: [{ role: 'user', content: 'What is the weather?' }],
  tools: {
    getWeather: {
      description: 'Get weather for a city',
      parameters: z.object({
        city: z.string().describe('The city name')
      }),
      execute: async ({ city }) => {
        // Your tool implementation
        return `Weather in ${city}: Sunny, 72°F`
      }
    }
  }
})
```

### Structured Object Generation

```typescript
import { generateObject } from 'ai'
import { z } from 'zod'

const { object } = await generateObject({
  model: openai('gpt-4o'),
  prompt: 'Generate a user profile',
  schema: z.object({
    name: z.string(),
    age: z.number(),
    email: z.string().email()
  })
})
```

## AI SDK UI

### useChat Hook

```typescript
'use client'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'

export default function Chat() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat'
    })
  })

  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          {message.role}: {message.parts.map(part => 
            part.type === 'text' ? part.text : null
          )}
        </div>
      ))}
      
      <form onSubmit={(e) => {
        e.preventDefault()
        sendMessage({ text: input })
      }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} />
      </form>
    </div>
  )
}
```

### Message Structure (v5)

```typescript
interface UIMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  parts: UIMessagePart[]
  metadata?: unknown
}

// Message parts can be:
type UIMessagePart = 
  | TextUIPart          // { type: 'text', text: string }
  | FileUIPart          // { type: 'file', url: string, mediaType: string }
  | ToolCallUIPart      // { type: 'tool-{toolName}', input, output, state }
  | DynamicToolUIPart   // { type: 'dynamic-tool', toolName, input, output }
```

### Chat Status

```typescript
const { status } = useChat()

// Status values:
// 'ready' - idle, can send messages
// 'submitted' - request sent, waiting for response
// 'streaming' - receiving response chunks
// 'error' - request failed
```

### File Upload (Multi-modal)

```typescript
const { sendMessage } = useChat()

// Send message with files
sendMessage({
  text: 'Analyze this image',
  files: fileList // FileList from input[type="file"]
})

// Or with file objects
sendMessage({
  text: 'Review this document', 
  files: [{
    type: 'file',
    filename: 'doc.pdf',
    mediaType: 'application/pdf',
    url: 'data:application/pdf;base64,...'
  }]
})
```

## API Routes (Next.js)

### Basic Chat Route

```typescript
// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai'
import { streamText, convertToModelMessages, UIMessage } from 'ai'

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: openai('gpt-4o'),
    messages: convertToModelMessages(messages),
    system: 'You are a helpful assistant.'
  })

  return result.toUIMessageStreamResponse()
}
```

### Route with Tools

```typescript
export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: openai('gpt-4o'),
    messages: convertToModelMessages(messages),
    tools: {
      // Server-side tool (auto-executed)
      getTime: {
        description: 'Get current time',
        parameters: z.object({}),
        execute: async () => new Date().toISOString()
      },
      // Client-side tool (requires user interaction)
      askConfirmation: {
        description: 'Ask user for confirmation',
        parameters: z.object({
          message: z.string()
        })
        // No execute function = client-side
      }
    }
  })

  return result.toUIMessageStreamResponse()
}
```

## Tool Handling in UI

### Automatic Execution

```typescript
const { addToolResult } = useChat({
  // Auto-submit when all tools complete
  sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  
  // Handle client-side auto tools
  onToolCall: async ({ toolCall }) => {
    if (toolCall.toolName === 'getLocation') {
      addToolResult({
        tool: 'getLocation',
        toolCallId: toolCall.toolCallId,
        output: await getCurrentLocation()
      })
    }
  }
})
```

### User Interaction Tools

```typescript
// Render tool calls in UI
{message.parts.map(part => {
  if (part.type === 'tool-askConfirmation') {
    return (
      <div>
        {part.input.message}
        <button onClick={() => addToolResult({
          tool: 'askConfirmation',
          toolCallId: part.toolCallId,
          output: 'confirmed'
        })}>
          Confirm
        </button>
      </div>
    )
  }
})}
```

## Configuration Options

### Request Configuration

```typescript
const { sendMessage } = useChat({
  transport: new DefaultChatTransport({
    api: '/api/chat',
    headers: { 'Authorization': 'Bearer token' },
    body: { userId: '123' },
    credentials: 'include'
  })
})

// Or per-request
sendMessage(
  { text: 'Hello' },
  {
    headers: { 'X-Custom': 'value' },
    body: { temperature: 0.8 }
  }
)
```

### Error Handling

```typescript
const { error, clearError } = useChat({
  onError: (error) => {
    console.error('Chat error:', error)
  }
})

// In API route
return result.toUIMessageStreamResponse({
  onError: (error) => error.message // Forward actual error
})
```

## Advanced Features

### Message Metadata

```typescript
// Server: Add metadata
return result.toUIMessageStreamResponse({
  messageMetadata: ({ part }) => ({
    createdAt: Date.now(),
    model: 'gpt-4o',
    tokens: part.type === 'finish' ? part.totalUsage.totalTokens : undefined
  })
})

// Client: Access metadata
{messages.map(message => (
  <div>
    {message.metadata?.createdAt && (
      <span>{new Date(message.metadata.createdAt).toLocaleString()}</span>
    )}
  </div>
))}
```

### Custom Transport

```typescript
const transport = new DefaultChatTransport({
  prepareSendMessagesRequest: ({ messages, trigger }) => ({
    body: {
      messages: messages.slice(-10), // Last 10 messages only
      trigger,
      customData: 'value'
    }
  })
})
```

### Multi-Step Tool Execution

```typescript
// Server-side multi-step (all tools have execute functions)
const result = streamText({
  model: openai('gpt-4o'),
  messages: convertToModelMessages(messages),
  tools: { /* all with execute functions */ },
  stopWhen: stepCountIs(5) // Max 5 steps
})
```

## Provider Switching

```typescript
// Environment-based switching
const getModel = () => {
  switch (process.env.AI_PROVIDER) {
    case 'anthropic': return anthropic('claude-sonnet-4-20250514')
    case 'google': return google('gemini-2.5-flash') 
    default: return openai('gpt-4o')
  }
}

const result = streamText({
  model: getModel(),
  // ... rest of config
})
```

## Common Patterns

### Chat with File Upload

```typescript
const convertFilesToDataURLs = async (files: FileList) => {
  return Promise.all(Array.from(files).map(file => 
    new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = () => resolve({
        type: 'file',
        mediaType: file.type,
        url: reader.result
      })
      reader.readAsDataURL(file)
    })
  ))
}
```

### Throttled Updates

```typescript
const { messages } = useChat({
  experimental_throttle: 50 // Update UI every 50ms
})
```

### Message Persistence

```typescript
const { messages, setMessages } = useChat({
  id: 'chat-123', // Persistent chat ID
  initialMessages: savedMessages
})

// Save on message changes
useEffect(() => {
  localStorage.setItem('chat-123', JSON.stringify(messages))
}, [messages])
```

## Environment Variables

```bash
# .env.local
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_AI_API_KEY=...
```

## Best Practices

1. **Always use convertToModelMessages()** when passing UI messages to streamText
2. **Render messages using the parts array** for forward compatibility  
3. **Use request-level options** instead of hook-level for dynamic config
4. **Handle errors gracefully** with onError callbacks
5. **Throttle UI updates** for performance with high-frequency streams
6. **Use typed tool parts** for better TypeScript support
7. **Implement proper loading states** using the status property