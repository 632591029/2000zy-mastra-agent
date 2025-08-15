#!/bin/bash

# Weather Agent Deployment Script
# 用于自动化部署到 Cloudflare Workers

set -e

echo "🚀 Weather Agent 部署脚本"
echo "=========================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查必要的工具
check_dependencies() {
    echo -e "${YELLOW}检查依赖...${NC}"
    
    if ! command -v pnpm &> /dev/null; then
        echo -e "${RED}错误: pnpm 未安装${NC}"
        echo "请运行: npm install -g pnpm"
        exit 1
    fi
    
    if ! command -v wrangler &> /dev/null; then
        echo -e "${RED}错误: wrangler 未安装${NC}"
        echo "请运行: npm install -g wrangler"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 依赖检查通过${NC}"
}

# 检查登录状态
check_auth() {
    echo -e "${YELLOW}检查 Cloudflare 登录状态...${NC}"
    
    if ! wrangler auth whoami &> /dev/null; then
        echo -e "${RED}错误: 未登录 Cloudflare${NC}"
        echo "请运行: wrangler auth login"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Cloudflare 登录状态正常${NC}"
    wrangler auth whoami
}

# 安装依赖
install_dependencies() {
    echo -e "${YELLOW}安装项目依赖...${NC}"
    pnpm install
    echo -e "${GREEN}✅ 依赖安装完成${NC}"
}

# 检查环境变量
check_secrets() {
    echo -e "${YELLOW}检查环境变量...${NC}"
    
    # 这里我们无法直接检查 secret 是否存在，所以提醒用户
    echo -e "${YELLOW}⚠️  请确保已设置 OpenAI API Key:${NC}"
    echo "   wrangler secret put OPENAI_API_KEY"
    
    read -p "已经设置了 OPENAI_API_KEY 吗? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}请先设置 OpenAI API Key${NC}"
        exit 1
    fi
}

# 类型检查
type_check() {
    echo -e "${YELLOW}进行 TypeScript 类型检查...${NC}"
    
    if ! npx tsc --noEmit; then
        echo -e "${RED}错误: TypeScript 类型检查失败${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 类型检查通过${NC}"
}

# 部署
deploy() {
    local env=$1
    
    if [ "$env" = "staging" ]; then
        echo -e "${YELLOW}部署到 Staging 环境...${NC}"
        pnpm run deploy:staging
    else
        echo -e "${YELLOW}部署到生产环境...${NC}"
        pnpm run deploy
    fi
    
    echo -e "${GREEN}✅ 部署完成${NC}"
}

# 测试部署
test_deployment() {
    local env=$1
    local worker_url
    
    if [ "$env" = "staging" ]; then
        worker_url="https://weather-agent-worker-staging.你的用户名.workers.dev"
    else
        worker_url="https://weather-agent-worker.你的用户名.workers.dev"
    fi
    
    echo -e "${YELLOW}测试部署...${NC}"
    echo "测试 URL: $worker_url"
    
    # 测试健康检查
    if curl -s --fail "$worker_url" > /dev/null; then
        echo -e "${GREEN}✅ 健康检查通过${NC}"
    else
        echo -e "${RED}❌ 健康检查失败${NC}"
        echo "请检查部署状态: wrangler deployments list"
        exit 1
    fi
    
    # 测试 GraphQL 端点
    if curl -s --fail -X POST "$worker_url/graphql" \
        -H "Content-Type: application/json" \
        -d '{"query": "query { health }"}' > /dev/null; then
        echo -e "${GREEN}✅ GraphQL 端点测试通过${NC}"
    else
        echo -e "${RED}❌ GraphQL 端点测试失败${NC}"
    fi
}

# 显示部署信息
show_info() {
    local env=$1
    
    echo -e "${GREEN}🎉 部署成功!${NC}"
    echo "=========================="
    
    if [ "$env" = "staging" ]; then
        echo "环境: Staging"
        echo "URL: https://weather-agent-worker-staging.你的用户名.workers.dev"
    else
        echo "环境: Production"
        echo "URL: https://weather-agent-worker.你的用户名.workers.dev"
    fi
    
    echo ""
    echo "可用端点:"
    echo "  GET  /              - 健康检查"
    echo "  POST /graphql       - GraphQL API"
    echo "  POST /chat          - 聊天接口"
    echo "  POST /weather       - 天气查询"
    echo "  POST /workflow      - 工作流执行"
    echo ""
    echo "管理命令:"
    echo "  wrangler tail       - 查看实时日志"
    echo "  wrangler deployments list - 查看部署历史"
    echo "  wrangler rollback [deployment-id] - 回滚部署"
}

# 主函数
main() {
    local env=${1:-production}
    
    if [ "$env" != "production" ] && [ "$env" != "staging" ]; then
        echo -e "${RED}错误: 环境只能是 'production' 或 'staging'${NC}"
        echo "用法: $0 [production|staging]"
        exit 1
    fi
    
    echo "目标环境: $env"
    echo ""
    
    check_dependencies
    check_auth
    install_dependencies
    check_secrets
    type_check
    deploy $env
    test_deployment $env
    show_info $env
}

# 运行主函数
main "$@"
