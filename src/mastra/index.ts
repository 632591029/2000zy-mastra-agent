import { Mastra } from '@mastra/core';
import { CloudflareDeployer } from '@mastra/deployer-cloudflare';
import { weatherAgent } from './agents/weather-agent';
import { weatherWorkflow } from './workflows/weather-workflow';

export const mastra = new Mastra({
  agents: [weatherAgent],
  workflows: [weatherWorkflow],
  deployer: new CloudflareDeployer({
    projectName: "weather-agent-worker",
    scope: process.env.CLOUDFLARE_ACCOUNT_ID || "",
    auth: {
      apiToken: process.env.CLOUDFLARE_API_TOKEN || "",
      apiEmail: process.env.CLOUDFLARE_EMAIL || ""
    }
  })
});
