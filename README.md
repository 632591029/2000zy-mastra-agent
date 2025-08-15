# Weather Agent - Mastra Powered AI Service

![Weather Agent](https://img.shields.io/badge/Powered%20by-Mastra-blue)
![Cloudflare Workers](https://img.shields.io/badge/Deploy%20on-Cloudflare%20Workers-orange)
![GraphQL](https://img.shields.io/badge/API-GraphQL-pink)

一个基于 Mastra 框架的智能天气代理服务，部署在 Cloudflare Workers 上，提供 GraphQL 和 REST API 接口。

## 🌟 主要特性

- 🤖 **智能天气助手**: 使用 OpenAI GPT-4 模型提供智能天气咨询
- 🔄 **自动化工作流**: 获取天气数据并提供活动建议
- 🌐 **GraphQL API**: 现代化的 API 接口，类型安全
- 📡 **REST API**: 向后兼容的传统 API 接口
- ⚡ **Cloudflare Workers**: 全球边缘计算，毫秒级响应
- 🌍 **实时天气数据**: 使用 Open-Meteo API 获取准确的天气信息
- 🔧 **TypeScript**: 完整的类型安全支持

## 🚀 快速开始

### 环境要求

- Node.js 20.9.0 或更高版本
- pnpm 包管理器
- Cloudflare Workers 账户
- OpenAI API Key

### 安装

```bash
# 克隆仓库
git clone https://github.com/632591029/2000zy-mastra-agent.git
cd 2000zy-mastra-agent

# 安装依赖
pnpm install

# 配置 Cloudflare CLI
npm install -g wrangler
wrangler auth login
```

### 配置

```bash
# 设置 OpenAI API Key
wrangler secret put OPENAI_API_KEY
```

### 运行

```bash
# 开发环境
pnpm run dev

# 部署到生产环境
pnpm run deploy
```

## 📖 API 文档

### GraphQL 端点

**URL**: `https://your-worker.workers.dev/graphql`

#### 查询操作

```graphql
# 健康检查
query {
  health
}

# 获取天气信息
query GetWeather($location: String!) {
  weather(location: $location) {
    location
    weather
    success
  }
}
```

#### 变更操作

```graphql
# 智能对话
mutation Chat($message: String!) {
  chat(message: $message) {
    response
    agent
    success
  }
}

# 执行天气工作流
mutation ExecuteWorkflow($city: String!) {
  executeWorkflow(city: $city) {
    city
    forecast
    executionId
    success
  }
}
```

### REST API 端点

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/` | 健康检查和 API 信息 |
| POST | `/chat` | 智能对话接口 |
| POST | `/weather` | 天气查询接口 |
| POST | `/workflow` | 工作流执行接口 |

## 🧪 测试

使用内置的测试工具：

```javascript
import { testGraphQLAPI } from './src/graphql-tests.js';
testGraphQLAPI('https://your-worker.workers.dev');
```

或者使用 curl：

```bash
# 测试健康检查
curl https://your-worker.workers.dev/

# 测试 GraphQL
curl -X POST https://your-worker.workers.dev/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { health }"}'
```

## 🏗️ 项目结构

```
src/
├── index.ts                 # 主应用入口
├── graphql-tests.js         # GraphQL 测试工具
├── mastra/
│   ├── index.ts            # Mastra 实例配置
│   ├── agents/
│   │   └── weather-agent.ts # 天气代理
│   ├── tools/
│   │   └── weather-tool.ts  # 天气工具
│   └── workflows/
│       └── weather-workflow.ts # 天气工作流
└── types/
    └── cloudflare.d.ts     # TypeScript 类型定义
```

## 🔧 技术栈

- **Framework**: [Mastra](https://mastra.ai) - AI Agent 框架
- **Runtime**: [Cloudflare Workers](https://workers.cloudflare.com/) - 边缘计算平台
- **Web Framework**: [Hono](https://hono.dev/) - 轻量级 Web 框架
- **GraphQL**: [@hono/graphql-server](https://github.com/honojs/middleware/tree/main/packages/graphql-server)
- **AI Model**: OpenAI GPT-4o-mini
- **Weather API**: [Open-Meteo](https://open-meteo.com/) - 免费天气 API
- **Language**: TypeScript

## 🌍 工作流程

1. **用户请求**: 通过 GraphQL 或 REST API 发送请求
2. **Mastra Agent**: 智能处理用户查询，调用合适的工具
3. **Weather Tool**: 从 Open-Meteo API 获取实时天气数据
4. **AI 处理**: OpenAI 模型分析数据并生成智能回复
5. **Workflow**: 复杂查询通过工作流提供详细的活动建议
6. **返回结果**: 格式化的 JSON 响应

## 📊 示例用法

### 简单天气查询

```bash
curl -X POST https://your-worker.workers.dev/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetWeather($location: String!) { weather(location: $location) { location weather success } }",
    "variables": { "location": "Beijing" }
  }'
```

### 智能对话

```bash
curl -X POST https://your-worker.workers.dev/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Chat($message: String!) { chat(message: $message) { response agent success } }",
    "variables": { "message": "今天适合户外运动吗？我在上海。" }
  }'
```

### 活动建议工作流

```bash
curl -X POST https://your-worker.workers.dev/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation ExecuteWorkflow($city: String!) { executeWorkflow(city: $city) { city forecast success } }",
    "variables": { "city": "Tokyo" }
  }'
```

## 🚀 部署指南

详细的部署说明请参见 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### 快速部署

```bash
# 1. 设置 API Key
wrangler secret put OPENAI_API_KEY

# 2. 部署到生产环境
pnpm run deploy

# 3. 测试部署
curl https://your-worker.workers.dev/
```

## 🔍 监控和日志

```bash
# 查看实时日志
wrangler tail

# 查看部署状态
wrangler deployments list
```

## 🛠️ 开发

### 本地开发

```bash
# 启动开发服务器
pnpm run dev

# 在另一个终端查看日志
wrangler tail --local
```

### 代码格式化

```bash
# 检查 TypeScript 类型
npx tsc --noEmit

# 格式化代码
npx prettier --write src/
```

## 📝 环境变量

| 变量名 | 描述 | 必需 |
|--------|------|------|
| `OPENAI_API_KEY` | OpenAI API 密钥 | ✅ |
| `AGENT_STORAGE` | KV 存储绑定（可选） | ❌ |
| `DB` | D1 数据库绑定（可选） | ❌ |

## 📈 性能优化

- **边缘缓存**: Cloudflare Workers 全球分布
- **冷启动优化**: 轻量级 Hono 框架
- **API 限流**: 内置错误处理和重试机制
- **数据缓存**: 可配置 KV 存储来缓存天气数据

## 🔒 安全考虑

- ✅ CORS 配置
- ✅ API Key 安全存储
- ✅ 输入验证和清理
- ✅ 错误处理和日志记录

## 📚 文档

- [部署指南](./DEPLOYMENT_GUIDE.md) - 完整的部署步骤
- [GraphQL 指南](./GRAPHQL_GUIDE.md) - GraphQL API 详细说明
- [Mastra 文档](https://mastra.ai/docs) - Mastra 框架文档
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)

## 🤝 贡献

欢迎贡献代码！请确保：

1. 遵循现有的代码风格
2. 添加适当的类型定义
3. 更新相关文档
4. 测试你的更改

## 📄 许可证

ISC License

## 🙋‍♂️ 支持

如果遇到问题：

1. 查看 [故障排除指南](./DEPLOYMENT_GUIDE.md#故障排除)
2. 检查 [GitHub Issues](https://github.com/632591029/2000zy-mastra-agent/issues)
3. 查看 Cloudflare Workers 日志: `wrangler tail`

---

Made with ❤️ using [Mastra](https://mastra.ai) and [Cloudflare Workers](https://workers.cloudflare.com/)
