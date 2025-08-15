# Cloudflare Workers 部署指南

这个指南将帮助你将 Mastra Weather Agent 部署到 Cloudflare Workers。

## 前置要求

1. **Cloudflare 账户**: 如果没有，请在 [cloudflare.com](https://cloudflare.com) 注册
2. **Node.js 20+**: 确保安装了 Node.js 20 或更高版本
3. **OpenAI API Key**: 从 [OpenAI Platform](https://platform.openai.com) 获取

## 安装步骤

### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler auth login
```

这会打开浏览器让你登录 Cloudflare 账户。

### 3. 验证登录

```bash
wrangler auth whoami
```

### 4. 安装项目依赖

```bash
npm install
```

### 5. 设置环境变量

设置你的 OpenAI API Key:

```bash
wrangler secret put OPENAI_API_KEY
```

输入你的 OpenAI API Key。

### 6. 本地开发

在部署前，可以先本地测试:

```bash
npm run dev
```

这会启动本地开发服务器，你可以在 `http://localhost:8787` 访问。

### 7. 部署到生产环境

```bash
npm run deploy
```

## 🚀 API 端点

部署成功后，你的 Worker 将提供以下端点:

### 🌐 GraphQL API (推荐)

- **GraphQL 端点**: `POST /graphql`
- **GraphQL Playground**: `GET /graphql` (在浏览器中访问，可视化查询界面)

### 📡 REST API (向后兼容)

- **健康检查**: `GET /`
- **聊天**: `POST /chat`
- **获取天气**: `POST /weather`
- **执行工作流**: `POST /workflow`

## 🔍 GraphQL 优势

我们强烈推荐使用 GraphQL API，因为它提供了：

- **精确数据获取**: 只请求需要的字段
- **单一端点**: 所有操作通过一个 URL
- **类型安全**: 强类型 schema
- **自文档化**: 内置文档和 playground
- **更好的开发体验**: 自动完成和实时验证

**详细的 GraphQL 使用指南请查看 [GRAPHQL_GUIDE.md](./GRAPHQL_GUIDE.md)**

## 📝 测试部署

### GraphQL 测试

```bash
# GraphQL 天气查询
curl -X POST https://your-worker.your-subdomain.workers.dev/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetWeather($location: String!) { weather(location: $location) { location weather success } }",
    "variables": { "location": "Tokyo" }
  }'

# GraphQL 聊天
curl -X POST https://your-worker.your-subdomain.workers.dev/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation ChatWithAgent($message: String!) { chat(message: $message) { response agent success } }",
    "variables": { "message": "What activities can I do in rainy weather?" }
  }'
```

### REST 测试 (向后兼容)

```bash
# 健康检查
curl https://your-worker.your-subdomain.workers.dev/

# 获取天气
curl -X POST https://your-worker.your-subdomain.workers.dev/weather \
  -H "Content-Type: application/json" \
  -d '{"location": "Tokyo"}'

# 聊天
curl -X POST https://your-worker.your-subdomain.workers.dev/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What activities can I do in rainy weather in Paris?"}'
```

## 🎨 GraphQL Playground

部署后，在浏览器中访问 `https://your-worker.your-subdomain.workers.dev/graphql` 可以打开 GraphQL Playground，在那里你可以：

- 🔍 浏览完整的 API schema
- ⚡ 测试查询和 mutations  
- 📚 查看自动生成的文档
- 💡 使用自动完成功能

## 可选配置

### KV 存储 (用于持久化状态)

如果需要存储用户会话或缓存数据:

1. 创建 KV namespace:
```bash
wrangler kv:namespace create "AGENT_STORAGE"
```

2. 将返回的 ID 添加到 `wrangler.toml` 中的 KV 配置

### D1 数据库 (用于复杂数据存储)

如果需要更复杂的数据存储:

1. 创建 D1 数据库:
```bash
wrangler d1 create weather-agent-db
```

2. 将数据库信息添加到 `wrangler.toml` 中的 D1 配置

## 监控和日志

查看 Worker 日志:

```bash
wrangler tail
```

在 Cloudflare Dashboard 中监控性能和使用情况。

## 故障排除

### 常见问题

1. **部署失败**: 检查 `wrangler.toml` 配置和环境变量
2. **API 调用失败**: 确保 OPENAI_API_KEY 已正确设置
3. **超时**: Cloudflare Workers 有执行时间限制，复杂操作可能需要优化
4. **GraphQL 错误**: 检查查询语法和变量类型

### 查看详细错误

```bash
wrangler tail --format pretty
```

## 成本考虑

- Cloudflare Workers 免费层包含每天 100,000 次请求
- 超出免费层后按使用量付费
- OpenAI API 调用会产生额外费用

## 安全建议

1. 使用 `wrangler secret` 管理敏感信息
2. 考虑添加 API 密钥认证
3. 设置 CORS 规则限制来源
4. 监控 API 使用情况防止滥用

## 🎯 主要变更说明

为了兼容 Cloudflare Workers，项目进行了以下主要变更：

1. **移除了内存存储**: `LibSQLStore` 和 `Memory` 在 Workers 环境中不可用
2. **添加了 Hono 框架**: 创建了 RESTful API 端点
3. **集成了 GraphQL**: 使用 `@hono/graphql-server` 提供现代化的 GraphQL API
4. **环境变量管理**: 使用 Cloudflare Secrets 管理 OpenAI API Key
5. **新增部署脚本**: 添加了 Wrangler 相关的部署命令
6. **双协议支持**: 同时支持 GraphQL 和 REST API

## 📁 项目文件结构

```
📦 2000zy-mastra-agent
├── 📄 wrangler.toml              # Cloudflare Workers 配置
├── 📄 DEPLOYMENT_GUIDE.md        # 部署指南
├── 📄 GRAPHQL_GUIDE.md           # GraphQL 使用指南
├── 📄 package.json               # 项目依赖
├── 📁 src/
│   ├── 📄 index.ts              # Workers 入口点 (GraphQL + REST)
│   ├── 📁 types/
│   │   └── 📄 cloudflare.d.ts   # TypeScript 类型定义
│   └── 📁 mastra/
│       ├── 📄 index.ts          # Mastra 配置
│       ├── 📁 agents/
│       │   └── 📄 weather-agent.ts
│       ├── 📁 tools/
│       │   └── 📄 weather-tool.ts
│       └── 📁 workflows/
│           └── 📄 weather-workflow.ts
└── 📄 tsconfig.json
```

部署完成后，你的天气 agent 就可以在全球 Cloudflare 边缘网络上为用户提供服务了！🎊

现在你拥有了一个现代化的、支持 GraphQL 的 AI Weather Agent API！