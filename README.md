# Weather Agent - Mastra on Cloudflare Workers

A simple weather agent powered by Mastra, deployed on Cloudflare Workers.

## 🚀 Quick Deploy

### 1. Setup Environment
```bash
# Copy the example env file and fill in your details
cp .env.example .env

# Edit .env with your actual values:
# - CLOUDFLARE_API_TOKEN: Get from Cloudflare Dashboard → My Profile → API Tokens
# - CLOUDFLARE_EMAIL: Your Cloudflare account email
# - CLOUDFLARE_ACCOUNT_ID: Found in Cloudflare Dashboard sidebar
# - OPENAI_API_KEY: Your OpenAI API key
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Deploy
```bash
# Build and deploy in one command
npm run deploy
```

### 4. Test
```bash
# Your agent will be available at:
# https://weather-agent-worker.your-subdomain.workers.dev
```

## 🛠️ Local Development
```bash
# Start local development server
npm run dev
```

## 📂 Project Structure
```
src/
├── index.ts                    # Main entry point
├── mastra/
│   ├── index.ts               # Mastra configuration with CloudflareDeployer
│   ├── agents/
│   │   └── weather-agent.ts   # Weather AI agent
│   ├── tools/
│   │   └── weather-tool.ts    # Weather data fetching tool
│   └── workflows/
│       └── weather-workflow.ts # Weather workflow
```

That's it! Mastra handles all the complexity of Cloudflare Workers deployment automatically.
