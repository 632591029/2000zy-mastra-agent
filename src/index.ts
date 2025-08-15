import { mastra } from './mastra';

// 导出 Mastra 实例作为默认 handler
// CloudflareDeployer 会自动处理 Workers 的启动逻辑
export default mastra;
