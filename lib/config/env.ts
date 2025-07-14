/**
 * 环境变量验证和类型安全访问
 */

function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

function getOptionalEnv(key: string, defaultValue = ""): string {
  return process.env[key] || defaultValue
}

export const env = {
  // OpenAI 配置（仅在服务器端强制要求）
  OPENAI_API_KEY: getOptionalEnv("OPENAI_API_KEY"),

  // 数据库配置
  DATABASE_URL: getOptionalEnv("DATABASE_URL"),

  // 认证配置
  NEXTAUTH_SECRET: getOptionalEnv("NEXTAUTH_SECRET"),
  NEXTAUTH_URL: getOptionalEnv("NEXTAUTH_URL", "http://localhost:3000"),

  // 应用配置
  NODE_ENV: getOptionalEnv("NODE_ENV", "development"),

  // 验证是否在服务器端
  isServer: typeof window === "undefined",
} as const

// 在服务器端启动时才验证关键环境变量
if (env.isServer) {
  if (!env.OPENAI_API_KEY) {
    throw new Error("Missing required environment variable: OPENAI_API_KEY")
  }
  console.log("✅ Environment variables validated")
}
