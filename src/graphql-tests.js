// GraphQL Test Queries for Weather Agent API

// 1. Health Check Query
const healthQuery = `
  query {
    health
  }
`;

// 2. Weather Query
const weatherQuery = `
  query GetWeather($location: String!) {
    weather(location: $location) {
      location
      weather
      success
    }
  }
`;

// 3. Chat Mutation
const chatMutation = `
  mutation Chat($message: String!) {
    chat(message: $message) {
      response
      agent
      success
    }
  }
`;

// 4. Workflow Execution Mutation
const workflowMutation = `
  mutation ExecuteWorkflow($city: String!) {
    executeWorkflow(city: $city) {
      city
      forecast
      executionId
      success
    }
  }
`;

// Example usage with variables:

// Health check (no variables needed)
const healthExample = {
  query: healthQuery
};

// Weather query example
const weatherExample = {
  query: weatherQuery,
  variables: {
    location: "New York"
  }
};

// Chat mutation example
const chatExample = {
  query: chatMutation,
  variables: {
    message: "What's the weather like in Tokyo?"
  }
};

// Workflow mutation example
const workflowExample = {
  query: workflowMutation,
  variables: {
    city: "San Francisco"
  }
};

// Test function to run all queries
async function testGraphQLAPI(baseUrl) {
  const endpoint = `${baseUrl}/graphql`;
  
  console.log('🚀 Testing GraphQL API at:', endpoint);
  
  try {
    // Test 1: Health Check
    console.log('\n1. Testing Health Check...');
    const healthResponse = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(healthExample)
    });
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthData);

    // Test 2: Weather Query
    console.log('\n2. Testing Weather Query...');
    const weatherResponse = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(weatherExample)
    });
    const weatherData = await weatherResponse.json();
    console.log('✅ Weather:', weatherData);

    // Test 3: Chat Mutation
    console.log('\n3. Testing Chat Mutation...');
    const chatResponse = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chatExample)
    });
    const chatData = await chatResponse.json();
    console.log('✅ Chat:', chatData);

    // Test 4: Workflow Mutation
    console.log('\n4. Testing Workflow Mutation...');
    const workflowResponse = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflowExample)
    });
    const workflowData = await workflowResponse.json();
    console.log('✅ Workflow:', workflowData);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Export for use in different environments
export {
  healthQuery,
  weatherQuery,
  chatMutation,
  workflowMutation,
  healthExample,
  weatherExample,
  chatExample,
  workflowExample,
  testGraphQLAPI
};

// Browser usage:
// testGraphQLAPI('https://your-worker.your-subdomain.workers.dev');

// Node.js usage:
// import { testGraphQLAPI } from './graphql-tests.js';
// testGraphQLAPI('https://your-worker.your-subdomain.workers.dev');
