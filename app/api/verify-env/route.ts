import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const checks = {
      envFileExists: false,
      openaiKeyExists: false,
      openaiKeyFormat: false,
      openaiKeyLength: 0,
      serverSide: typeof window === "undefined",
      nodeEnv: process.env.NODE_ENV,
    }

    // 检查 OPENAI_API_KEY
    const openaiKey = process.env.OPENAI_API_KEY
    checks.openaiKeyExists = !!openaiKey

    if (openaiKey) {
      checks.openaiKeyFormat = openaiKey.startsWith("sk-")
      checks.openaiKeyLength = openaiKey.length
    }

    // 检查其他环境变量
    const otherEnvs = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    }

    return NextResponse.json({
      success: true,
      checks,
      otherEnvs,
      recommendations: generateRecommendations(checks),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}

function generateRecommendations(checks: any): string[] {
  const recommendations: string[] = []

  if (!checks.openaiKeyExists) {
    recommendations.push("❌ OPENAI_API_KEY 未设置。请在 .env.local 文件中添加此变量。")
  } else if (!checks.openaiKeyFormat) {
    recommendations.push("❌ OPENAI_API_KEY 格式不正确。应该以 'sk-' 开头。")
  } else if (checks.openaiKeyLength < 50) {
    recommendations.push("⚠️ OPENAI_API_KEY 长度可能不正确。标准长度应该是 51 个字符。")
  } else {
    recommendations.push("✅ OPENAI_API_KEY 设置正确！")
  }

  if (!checks.serverSide) {
    recommendations.push("⚠️ 检测到客户端环境，某些检查可能不准确。")
  }

  return recommendations
}
