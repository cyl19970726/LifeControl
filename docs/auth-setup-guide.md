# NextAuth 环境变量设置指南

## 🔐 NEXTAUTH_SECRET

### 什么是 NEXTAUTH_SECRET？
这是 NextAuth.js 用来加密 JWT tokens 和会话数据的密钥。

### 如何生成？

#### 方法 1: 使用 OpenSSL（推荐）
\`\`\`bash
openssl rand -base64 32
\`\`\`

#### 方法 2: 使用 Node.js
\`\`\`bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
\`\`\`

#### 方法 3: 在线生成器
访问 https://generate-secret.vercel.app/32

#### 方法 4: 手动生成
\`\`\`javascript
// 在浏览器控制台运行
crypto.getRandomValues(new Uint8Array(32)).reduce((acc, val) => acc + val.toString(16).padStart(2, '0'), '')
\`\`\`

### 示例结果
\`\`\`
wX8fY2kL9mN3pQ5rS7tU1vW4xZ6aB8cD0eF2gH4iJ6kL8mN0pQ2rS4tU6vW8xZ0a
\`\`\`

---

## 🌐 NEXTAUTH_URL

### 什么是 NEXTAUTH_URL？
这是你的应用程序的完整 URL，NextAuth.js 用它来构建回调 URL。

### 不同环境的设置

#### 本地开发环境
\`\`\`bash
NEXTAUTH_URL=http://localhost:3000
\`\`\`

#### 生产环境示例
\`\`\`bash
# Vercel 部署
NEXTAUTH_URL=https://your-app.vercel.app

# 自定义域名
NEXTAUTH_URL=https://lifeagent.yourdomain.com

# 其他平台
NEXTAUTH_URL=https://your-app.herokuapp.com
\`\`\`

---

## 📝 完整的 .env.local 文件示例

\`\`\`bash
# OpenAI API Key
OPENAI_API_KEY=sk-your-openai-api-key-here

# NextAuth 配置
NEXTAUTH_SECRET=wX8fY2kL9mN3pQ5rS7tU1vW4xZ6aB8cD0eF2gH4iJ6kL8mN0pQ2rS4tU6vW8xZ0a
NEXTAUTH_URL=http://localhost:3000

# 数据库（可选，目前使用本地存储）
# DATABASE_URL=postgresql://username:password@localhost:5432/lifeagent
\`\`\`

---

## 🚀 快速设置步骤

### 1. 生成 NEXTAUTH_SECRET
\`\`\`bash
# 在终端运行
openssl rand -base64 32
\`\`\`

### 2. 复制结果到 .env.local
\`\`\`bash
NEXTAUTH_SECRET=你生成的密钥
\`\`\`

### 3. 设置 NEXTAUTH_URL
\`\`\`bash
NEXTAUTH_URL=http://localhost:3000
\`\`\`

### 4. 重启开发服务器
\`\`\`bash
npm run dev
\`\`\`

---

## ⚠️ 重要注意事项

### 安全性
- **永远不要**将 NEXTAUTH_SECRET 提交到 Git
- **每个环境**使用不同的 NEXTAUTH_SECRET
- **定期轮换**生产环境的密钥

### 部署时
- Vercel: 在项目设置中添加环境变量
- Netlify: 在 Site settings > Environment variables
- 其他平台: 查看相应的环境变量设置文档

### 调试
如果遇到认证问题：
1. 检查 NEXTAUTH_URL 是否与实际访问的 URL 一致
2. 确认 NEXTAUTH_SECRET 已正确设置
3. 重启应用服务器
