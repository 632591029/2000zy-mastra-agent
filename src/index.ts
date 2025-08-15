import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { weatherAgent } from './mastra/agents/weather-agent';
import { weatherWorkflow } from './mastra/workflows/weather-workflow';

type Bindings = {
  OPENAI_API_KEY: string;
  AGENT_STORAGE?: KVNamespace;
  DB?: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check endpoint
app.get('/', (c) => {
  return c.json({ 
    message: 'Weather Agent API is running!',
    endpoints: {
      chat: 'POST /chat',
      weather: 'POST /weather',
      workflow: 'POST /workflow'
    }
  });
});

// Chat with weather agent
app.post('/chat', async (c) => {
  try {
    const { message } = await c.req.json();
    
    if (!message) {
      return c.json({ error: 'Message is required' }, 400);
    }

    // Set OpenAI API key from environment
    process.env.OPENAI_API_KEY = c.env.OPENAI_API_KEY;

    const response = await weatherAgent.stream([
      {
        role: 'user',
        content: message,
      },
    ]);

    let fullResponse = '';
    for await (const chunk of response.textStream) {
      fullResponse += chunk;
    }

    return c.json({ 
      response: fullResponse,
      agent: 'weather-agent'
    });
  } catch (error) {
    console.error('Chat error:', error);
    return c.json({ 
      error: 'Failed to process chat request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Direct weather lookup
app.post('/weather', async (c) => {
  try {
    const { location } = await c.req.json();
    
    if (!location) {
      return c.json({ error: 'Location is required' }, 400);
    }

    // Set OpenAI API key from environment
    process.env.OPENAI_API_KEY = c.env.OPENAI_API_KEY;

    const response = await weatherAgent.stream([
      {
        role: 'user',
        content: `What's the current weather in ${location}?`,
      },
    ]);

    let weatherInfo = '';
    for await (const chunk of response.textStream) {
      weatherInfo += chunk;
    }

    return c.json({ 
      location,
      weather: weatherInfo
    });
  } catch (error) {
    console.error('Weather error:', error);
    return c.json({ 
      error: 'Failed to get weather information',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Weather workflow with activity planning
app.post('/workflow', async (c) => {
  try {
    const { city } = await c.req.json();
    
    if (!city) {
      return c.json({ error: 'City is required' }, 400);
    }

    // Set OpenAI API key from environment
    process.env.OPENAI_API_KEY = c.env.OPENAI_API_KEY;

    const result = await weatherWorkflow.execute({
      input: { city },
    });

    return c.json({
      city,
      forecast: result.result,
      executionId: result.executionId
    });
  } catch (error) {
    console.error('Workflow error:', error);
    return c.json({ 
      error: 'Failed to execute weather workflow',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Error handling
app.onError((err, c) => {
  console.error('Application error:', err);
  return c.json({ 
    error: 'Internal server error',
    details: err.message 
  }, 500);
});

export default app;