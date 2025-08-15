// Cloudflare Workers types for this project

declare global {
  interface CloudflareEnv {
    // Required environment variables
    OPENAI_API_KEY: string;
    
    // Optional storage bindings
    AGENT_STORAGE?: KVNamespace;
    DB?: D1Database;
    
    // Optional analytics binding
    ANALYTICS?: AnalyticsEngineDataset;
    
    // Optional Durable Objects binding
    AGENT_SESSIONS?: DurableObjectNamespace;
  }
}

// Extend Hono's context types
declare module 'hono' {
  interface Env {
    Bindings: CloudflareEnv;
  }
}

export {};
