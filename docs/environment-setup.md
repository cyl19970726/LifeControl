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

**重要**: 确保 API Key 以 `sk-` 开头，并且没有多余的空格或引号。

### 3. 重启开发服务器

\`\`\`bash
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
npm run dev
\`\`\`

## 🔍 验证设置

### 检查环境变量是否加载

在终端启动应用时，你应该看到：

\`\`\`
🔧 Validating server environment variables...
✅ OPENAI_API_KEY found
\`\`\`

如果看到错误信息：

\`\`\`
❌ Missing OPENAI_API_KEY environment variable
📝 Please set OPENAI_API_KEY in your .env.local file
\`\`\`

说明环境变量没有正确设置。

### 测试 ChatAgent

1. 打开 http://localhost:3000
2. 点击右下角的 🤖 按钮
3. 发送消息："你好"
4. 如果收到回复，说明 API Key 工作正常

## 🚨 常见问题

### 问题 1: "OPENAI_API_KEY 环境变量未设置"

**解决方案**:
1. 确认 `.env.local` 文件在项目根目录
2. 确认文件内容格式正确：`OPENAI_API_KEY=sk-...`
3. 重启开发服务器

### 问题 2: "OpenAI API Key 无效"

**解决方案**:
1. 检查 API Key 是否完整复制
2. 确认 API Key 没有过期
3. 在 OpenAI Dashboard 检查 API Key 状态

### 问题 3: "API 配额已用完"

**解决方案**:
1. 检查 OpenAI 账户余额
2. 设置使用限额
3. 考虑使用 `gpt-3.5-turbo` 降低成本

## 🔒 安全注意事项

1. **永远不要**将 `.env.local` 提交到 Git
2. **永远不要**在客户端代码中使用 API Key
3. 定期轮换 API Key
4. 监控 API 使用量

## 📁 文件结构

\`\`\`
your-project/
├── .env.local          # 你的环境变量（不提交到 Git）
├── .env.example        # 示例文件（可以提交）
├── .gitignore          # 确保包含 .env.local
└── ...
\`\`\`

确保 `.gitignore` 包含：
\`\`\`
.env*.local
.env
\`\`\`
