// Cloudflare Workers types
declare global {
  interface CloudflareEnv {
    OPENAI_API_KEY: string;
    AGENT_STORAGE?: KVNamespace;
    DB?: D1Database;
  }
}

export {};