import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { graphqlServer } from '@hono/graphql-server';
import { buildSchema } from 'graphql';
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

// GraphQL Schema
const schema = buildSchema(`
  type Query {
    health: String!
    weather(location: String!): WeatherResponse!
  }

  type Mutation {
    chat(message: String!): ChatResponse!
    executeWorkflow(city: String!): WorkflowResponse!
  }

  type WeatherResponse {
    location: String!
    weather: String!
    success: Boolean!
  }

  type ChatResponse {
    response: String!
    agent: String!
    success: Boolean!
  }

  type WorkflowResponse {
    city: String!
    forecast: String!
    executionId: String
    success: Boolean!
  }
`);

// GraphQL Resolvers
const resolvers = {
  health: () => 'Weather Agent GraphQL API is running!',
  
  weather: async ({ location }: { location: string }, context: any) => {
    try {
      // Set OpenAI API key from environment
      process.env.OPENAI_API_KEY = context.env.OPENAI_API_KEY;

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

      return {
        location,
        weather: weatherInfo,
        success: true
      };
    } catch (error) {
      console.error('Weather error:', error);
      return {
        location,
        weather: `Failed to get weather: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false
      };
    }
  },

  chat: async ({ message }: { message: string }, context: any) => {
    try {
      if (!message) {
        throw new Error('Message is required');
      }

      // Set OpenAI API key from environment
      process.env.OPENAI_API_KEY = context.env.OPENAI_API_KEY;

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

      return {
        response: fullResponse,
        agent: 'weather-agent',
        success: true
      };
    } catch (error) {
      console.error('Chat error:', error);
      return {
        response: `Failed to process chat: ${error instanceof Error ? error.message : 'Unknown error'}`,
        agent: 'weather-agent',
        success: false
      };
    }
  },

  executeWorkflow: async ({ city }: { city: string }, context: any) => {
    try {
      if (!city) {
        throw new Error('City is required');
      }

      // Set OpenAI API key from environment
      process.env.OPENAI_API_KEY = context.env.OPENAI_API_KEY;

      const result = await weatherWorkflow.execute({
        input: { city },
      });

      return {
        city,
        forecast: JSON.stringify(result.result),
        executionId: result.executionId || '',
        success: true
      };
    } catch (error) {
      console.error('Workflow error:', error);
      return {
        city,
        forecast: `Failed to execute workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionId: '',
        success: false
      };
    }
  }
};

// GraphQL endpoint
app.use(
  '/graphql',
  graphqlServer({
    schema,
    rootValue: resolvers,
    context: (c) => ({ env: c.env })
  })
);

// Health check endpoint (REST)
app.get('/', (c) => {
  return c.json({ 
    message: 'Weather Agent API is running!',
    endpoints: {
      graphql: 'POST /graphql',
      playground: 'GET /graphql (in browser)',
      rest_chat: 'POST /chat',
      rest_weather: 'POST /weather',
      rest_workflow: 'POST /workflow'
    }
  });
});

// REST API endpoints (backward compatibility)
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