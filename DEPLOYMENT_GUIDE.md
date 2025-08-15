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

## API 端点

部署成功后，你的 Worker 将提供以下端点:

### GET /
健康检查和 API 文档

### POST /chat
与天气 agent 聊天

```json
{
  "message": "What's the weather like in Tokyo?"
}
```

### POST /weather
直接获取天气信息

```json
{
  "location": "Tokyo"
}
```

### POST /workflow
执行完整的天气工作流（包含活动建议）

```json
{
  "city": "Tokyo"
}
```

## 测试部署

部署成功后，你可以测试 API:

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

## 主要变更说明

为了兼容 Cloudflare Workers，项目进行了以下主要变更：

1. **移除了内存存储**: `LibSQLStore` 和 `Memory` 在 Workers 环境中不可用
2. **添加了 Hono 框架**: 创建了 RESTful API 端点
3. **环境变量管理**: 使用 Cloudflare Secrets 管理 OpenAI API Key
4. **新增部署脚本**: 添加了 Wrangler 相关的部署命令

部署完成后，你的天气 agent 就可以在全球 Cloudflare 边缘网络上为用户提供服务了！