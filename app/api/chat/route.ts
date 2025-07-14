import { type NextRequest, NextResponse } from "next/server"
import { chatAgent } from "@/lib/agents/chat-agent-v2"

// 允许较长的处理时间，因为可能需要多次工具调用
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Message is required and must be a string",
        },
        { status: 400 },
      )
    }

    // 处理消息
    const response = await chatAgent.processMessage(message)

    return NextResponse.json({
      success: true,
      data: {
        message: response.message,
        toolResults: response.toolResults,
        conversationId: conversationId || "default",
      },
    })
  } catch (error) {
    console.error("Chat API error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

// 支持流式响应（可选）
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const message = searchParams.get("message")

  if (!message) {
    return NextResponse.json({ error: "Message parameter required" }, { status: 400 })
  }

  // 创建流式响应
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // 这里可以实现流式处理
        const response = await chatAgent.processMessage(message)

        // 发送最终结果
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(response)}\n\n`))

        controller.close()
      } catch (error) {
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ error: error.message })}\n\n`))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
