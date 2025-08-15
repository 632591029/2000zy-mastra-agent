import { Mastra } from '@mastra/core';
import { openai } from '@ai-sdk/openai';
import { weatherAgent } from './agents/weather-agent';
import { weatherWorkflow } from './workflows/weather-workflow';

let mastraInstance: Mastra | null = null;

export function createMastraInstance(openaiApiKey: string): Mastra {
  if (!mastraInstance) {
    // Set the OpenAI API key globally for the AI SDK
    process.env.OPENAI_API_KEY = openaiApiKey;
    
    mastraInstance = new Mastra({
      agents: [weatherAgent],
      workflows: [weatherWorkflow],
      // For Cloudflare Workers, we'll use a simplified setup
      // without persistent memory for now
    });
  }
  
  return mastraInstance;
}

export function getMastraInstance(): Mastra | null {
  return mastraInstance;
}

export { weatherAgent, weatherWorkflow };
