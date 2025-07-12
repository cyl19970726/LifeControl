/**
 * 环境变量验证和类型安全访问
 * 注意：只在服务器端验证敏感环境变量
 */

function getOptionalEnv(key: string, defaultValue = ""): string {
  return process.env[key] || defaultValue
}

function getRequiredServerEnv(key: string): string {
  // 只在服务器端检查必需的环境变量
  if (typeof window !== "undefined") {
    // 客户端直接返回空字符串，不抛出错误
    return ""
  }

  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required server environment variable: ${key}`)
  }
  return value
}

export const env = {
  // OpenAI 配置（仅服务器端使用）
  OPENAI_API_KEY: getRequiredServerEnv("OPENAI_API_KEY"),

  // 数据库配置（仅服务器端使用）
  DATABASE_URL: getOptionalEnv("DATABASE_URL"),

  // 认证配置
  NEXTAUTH_SECRET: getOptionalEnv("NEXTAUTH_SECRET"),
  NEXTAUTH_URL: getOptionalEnv("NEXTAUTH_URL", "http://localhost:3000"),

  // 应用配置
  NODE_ENV: getOptionalEnv("NODE_ENV", "development"),

  // 运行时检查
  isServer: typeof window === "undefined",
} as const

// 仅在服务器端启动时验证环境变量
if (typeof window === "undefined") {
  console.log("🔧 Validating server environment variables...")

  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ Missing OPENAI_API_KEY environment variable")
    console.log("📝 Please set OPENAI_API_KEY in your .env.local file")
  } else {
    console.log("✅ OPENAI_API_KEY found")
  }
}
