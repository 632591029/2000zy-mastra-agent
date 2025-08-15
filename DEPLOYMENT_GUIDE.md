# Cloudflare Workers 部署指南

## 概述

这个项目是一个基于 Mastra 框架的天气代理服务，可以部署到 Cloudflare Workers，并提供 GraphQL API 接口。

## 主要特性

- ✅ **Mastra Agent**: 智能天气助手
- ✅ **Mastra Workflow**: 天气预报和活动建议工作流
- ✅ **GraphQL API**: 完整的 GraphQL 接口
- ✅ **REST API**: 向后兼容的 REST 端点
- ✅ **Cloudflare Workers**: 无服务器部署
- ✅ **实时数据**: 使用 Open-Meteo API 获取天气数据

## 部署前准备

### 1. 安装依赖

```bash
# 安装项目依赖
pnpm install

# 安装 Cloudflare CLI（如果还没有安装）
npm install -g wrangler
```

### 2. 配置 Cloudflare Workers

```bash
# 登录 Cloudflare
wrangler auth login

# 验证登录状态
wrangler auth whoami
```

### 3. 配置环境变量

设置 OpenAI API Key 作为 Cloudflare Workers 的机密：

```bash
# 设置 OpenAI API Key
wrangler secret put OPENAI_API_KEY
# 然后输入你的 OpenAI API Key
```

或者在 `wrangler.toml` 文件中直接配置（不推荐生产环境）：

```toml
[vars]
OPENAI_API_KEY = "your-openai-api-key-here"
```

## 部署步骤

### 1. 开发环境测试

```bash
# 启动开发服务器
pnpm run dev

# 或者使用 wrangler
wrangler dev
```

### 2. 部署到 Staging 环境

```bash
pnpm run deploy:staging
```

### 3. 部署到生产环境

```bash
pnpm run deploy
```

## API 使用指南

### GraphQL 端点

- **URL**: `https://your-worker.your-subdomain.workers.dev/graphql`
- **方法**: POST
- **Content-Type**: application/json

### 可用的 GraphQL 操作

#### 1. 健康检查
```graphql
query {
  health
}
```

#### 2. 获取天气信息
```graphql
query GetWeather($location: String!) {
  weather(location: $location) {
    location
    weather
    success
  }
}
```

#### 3. 聊天对话
```graphql
mutation Chat($message: String!) {
  chat(message: $message) {
    response
    agent
    success
  }
}
```

#### 4. 执行天气工作流
```graphql
mutation ExecuteWorkflow($city: String!) {
  executeWorkflow(city: $city) {
    city
    forecast
    executionId
    success
  }
}
```

### REST API 端点（向后兼容）

#### 1. 健康检查
- **GET** `/` - 返回 API 状态和可用端点

#### 2. 聊天
- **POST** `/chat`
- Body: `{ "message": "你的消息" }`

#### 3. 天气查询
- **POST** `/weather`
- Body: `{ "location": "城市名称" }`

#### 4. 工作流执行
- **POST** `/workflow`
- Body: `{ "city": "城市名称" }`

## 测试 API

### 使用提供的测试文件

项目包含了一个测试文件 `src/graphql-tests.js`，可以用来测试所有 GraphQL 端点：

```javascript
import { testGraphQLAPI } from './src/graphql-tests.js';

// 测试你的 Worker
testGraphQLAPI('https://your-worker.your-subdomain.workers.dev');
```

### 使用 curl 测试

```bash
# 测试健康检查
curl https://your-worker.your-subdomain.workers.dev/

# 测试 GraphQL 健康检查
curl -X POST https://your-worker.your-subdomain.workers.dev/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { health }"}'

# 测试天气查询
curl -X POST https://your-worker.your-subdomain.workers.dev/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query GetWeather($location: String!) { weather(location: $location) { location weather success } }", "variables": {"location": "Beijing"}}'
```

## 故障排除

### 常见问题

1. **OpenAI API Key 未设置**
   - 确保使用 `wrangler secret put OPENAI_API_KEY` 设置了 API Key
   - 检查 API Key 是否有效且有足够的配额

2. **部署失败**
   - 检查 `wrangler.toml` 配置是否正确
   - 确保已经登录 Cloudflare: `wrangler auth whoami`
   - 检查 TypeScript 编译错误: `tsc --noEmit`

3. **运行时错误**
   - 查看 Cloudflare Workers 日志: `wrangler tail`
   - 检查代理和工作流是否正确初始化

### 调试技巧

```bash
# 查看实时日志
wrangler tail

# 本地开发模式
wrangler dev --local

# 检查配置
wrangler whoami
```

## 监控和维护

### 性能监控

- 使用 Cloudflare Analytics 监控请求量和响应时间
- 设置 Cloudflare Alerts 来监控错误率

### 扩展功能

可以通过以下方式扩展功能：

1. **添加 KV 存储**: 用于缓存天气数据
2. **添加 D1 数据库**: 用于存储用户会话和历史记录
3. **添加 Durable Objects**: 用于维护持久化的对话状态
4. **添加 Analytics Engine**: 用于收集使用统计

## 更新和维护

### 更新依赖

```bash
# 更新所有依赖
pnpm update

# 检查过时的包
pnpm outdated
```

### 备份和恢复

重要的配置文件：
- `wrangler.toml` - Workers 配置
- `package.json` - 依赖配置
- `src/` - 应用代码

## 安全注意事项

1. **永远不要在代码中硬编码 API Keys**
2. **使用 Cloudflare Workers Secrets 存储敏感信息**
3. **定期轮换 API Keys**
4. **监控 API 使用情况，防止滥用**

## 支持

如果遇到问题，请：

1. 检查 [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
2. 查看 [Mastra 文档](https://mastra.ai/docs)
3. 检查项目的 GitHub Issues

## 成本估算

Cloudflare Workers 的定价：
- **免费层**: 100,000 requests/day
- **付费层**: $5/month for 10M requests + $0.50/M additional requests

OpenAI API 的成本取决于使用的模型和请求量。
