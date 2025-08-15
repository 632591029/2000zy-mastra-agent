# GraphQL API 使用指南

你的 Weather Agent 现在同时支持 REST API 和 GraphQL API！

## 🔗 GraphQL 端点

- **GraphQL API**: `POST /graphql`
- **GraphQL Playground**: `GET /graphql` (在浏览器中访问)

## 📋 GraphQL Schema

```graphql
type Query {
  health: String!
  weather(location: String!): WeatherResponse!
}

type Mutation {
  chat(message: String!): ChatResponse!
  executeWorkflow(city: String!): WorkflowResponse!
}

type WeatherResponse {
  location: String!
  weather: String!
  success: Boolean!
}

type ChatResponse {
  response: String!
  agent: String!
  success: Boolean!
}

type WorkflowResponse {
  city: String!
  forecast: String!
  executionId: String
  success: Boolean!
}
```

## 🚀 GraphQL 查询示例

### 1. 健康检查

```graphql
query {
  health
}
```

### 2. 获取天气信息

```graphql
query GetWeather($location: String!) {
  weather(location: $location) {
    location
    weather
    success
  }
}
```

**Variables:**
```json
{
  "location": "Tokyo"
}
```

### 3. 与 Agent 聊天

```graphql
mutation ChatWithAgent($message: String!) {
  chat(message: $message) {
    response
    agent
    success
  }
}
```

**Variables:**
```json
{
  "message": "What's the weather like in Paris and what activities can I do there?"
}
```

### 4. 执行完整工作流

```graphql
mutation ExecuteWeatherWorkflow($city: String!) {
  executeWorkflow(city: $city) {
    city
    forecast
    executionId
    success
  }
}
```

**Variables:**
```json
{
  "city": "New York"
}
```

## 🔧 使用方法

### 1. 使用 curl

```bash
# GraphQL 查询
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

### 2. 使用 JavaScript/TypeScript

```javascript
const query = `
  query GetWeather($location: String!) {
    weather(location: $location) {
      location
      weather
      success
    }
  }
`;

const variables = { location: "Tokyo" };

const response = await fetch('https://your-worker.your-subdomain.workers.dev/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query,
    variables
  })
});

const data = await response.json();
console.log(data);
```

### 3. 使用 GraphQL 客户端库

```javascript
// 使用 Apollo Client
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://your-worker.your-subdomain.workers.dev/graphql',
  cache: new InMemoryCache()
});

const GET_WEATHER = gql`
  query GetWeather($location: String!) {
    weather(location: $location) {
      location
      weather
      success
    }
  }
`;

const { data } = await client.query({
  query: GET_WEATHER,
  variables: { location: 'Tokyo' }
});
```

## 🎯 GraphQL vs REST

### GraphQL 优势：
- **精确数据获取**: 只请求需要的字段
- **单一端点**: 所有操作通过一个 URL
- **类型安全**: 强类型 schema
- **自文档化**: 内置文档和 playground
- **实时性**: 支持订阅（如果需要的话）

### 何时使用 GraphQL：
- 需要灵活的数据查询
- 客户端多样化（Web、Mobile、Desktop）
- 希望减少网络请求次数
- 需要类型安全的 API

### 何时使用 REST：
- 简单的 CRUD 操作
- 缓存需求较高
- 团队对 REST 更熟悉
- 需要 HTTP 缓存

## 🔍 GraphQL Playground

部署后，在浏览器中访问 `https://your-worker.your-subdomain.workers.dev/graphql` 可以打开 GraphQL Playground，在那里你可以：

- 浏览完整的 API schema
- 测试查询和 mutations
- 查看自动生成的文档
- 使用自动完成功能

## 🛠️ 开发建议

1. **使用 Variables**: 总是使用 GraphQL variables 而不是字符串拼接
2. **错误处理**: GraphQL 的错误处理机制与 REST 不同，注意检查 `errors` 字段
3. **缓存**: 考虑使用 Apollo Client 或其他支持 GraphQL 缓存的客户端
4. **监控**: 监控 GraphQL 查询的复杂度和性能

现在你的 Weather Agent 提供了现代化的 GraphQL API，同时保持 REST API 的向后兼容性！🎉