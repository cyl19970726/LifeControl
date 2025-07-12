# 环境变量设置指南

## 🔑 获取 OpenAI API Key

1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 登录或注册账户
3. 进入 [API Keys 页面](https://platform.openai.com/api-keys)
4. 点击 "Create new secret key"
5. 复制生成的 API Key（格式：`sk-...`）

## 📝 本地开发设置

### 1. 创建环境变量文件

在项目根目录创建 `.env.local` 文件：

\`\`\`bash
# 复制示例文件
cp .env.example .env.local
\`\`\`

### 2. 填入你的 API Key

编辑 `.env.local` 文件：

\`\`\`bash
OPENAI_API_KEY=sk-your-actual-api-key-here
\`\`\`

### 3. 重启开发服务器

\`\`\`bash
npm run dev
\`\`\`

## 🚀 生产环境部署

### Vercel 部署

1. 在 Vercel Dashboard 中进入项目设置
2. 找到 "Environment Variables" 部分
3. 添加环境变量：
   - Name: `OPENAI_API_KEY`
   - Value: `sk-your-api-key`
   - Environment: Production (或 All)

### 其他平台

大多数云平台都支持环境变量设置：

- **Railway**: 在项目设置中添加环境变量
- **Netlify**: 在 Site settings > Environment variables
- **Heroku**: 使用 `heroku config:set OPENAI_API_KEY=sk-...`

## ⚠️ 安全注意事项

1. **永远不要**将 API Key 提交到 Git 仓库
2. **永远不要**在客户端代码中暴露 API Key
3. 定期轮换 API Key
4. 监控 API 使用量和费用
5. 为不同环境使用不同的 API Key

## 🧪 测试 API Key 是否工作

你可以在 ChatAgent 中发送一条消息来测试：

\`\`\`
用户: "你好"
助手: 如果看到这条回复，说明 OpenAI API 工作正常！
\`\`\`

## 💰 费用控制

1. 在 OpenAI Dashboard 设置使用限额
2. 监控 API 调用次数
3. 考虑使用 `gpt-3.5-turbo` 来降低成本（在 `llm-client.ts` 中修改模型）

\`\`\`typescript
// 使用更便宜的模型
private model = openai("gpt-3.5-turbo", {
  apiKey: env.OPENAI_API_KEY,
})
\`\`\`
