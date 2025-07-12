import { type NextRequest, NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "OPENAI_API_KEY 未设置",
          solution: "请在 .env.local 文件中设置 OPENAI_API_KEY",
        },
        { status: 400 },
      )
    }

    if (!apiKey.startsWith("sk-")) {
      return NextResponse.json(
        {
          success: false,
          error: "OPENAI_API_KEY 格式不正确",
          solution: "API Key 应该以 'sk-' 开头",
        },
        { status: 400 },
      )
    }

    // 测试 OpenAI API 连接
    const model = openai("gpt-3.5-turbo", { apiKey })

    const result = await generateText({
      model,
      prompt: "Say 'Hello from LifeAgent!' in Chinese",
      maxTokens: 50,
    })

    return NextResponse.json({
      success: true,
      message: "OpenAI API 连接成功！",
      response: result.text,
      usage: result.usage,
    })
  } catch (error) {
    console.error("OpenAI API test failed:", error)

    let errorMessage = "未知错误"
    let solution = "请检查网络连接和 API Key"

    if (error.message?.includes("401")) {
      errorMessage = "API Key 无效或已过期"
      solution = "请检查 OpenAI Dashboard 中的 API Key 状态"
    } else if (error.message?.includes("429")) {
      errorMessage = "API 请求频率限制"
      solution = "请稍后重试，或检查账户配额"
    } else if (error.message?.includes("quota")) {
      errorMessage = "API 配额已用完"
      solution = "请检查 OpenAI 账户余额"
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        solution,
        details: error.message,
      },
      { status: 500 },
    )
  }
}
