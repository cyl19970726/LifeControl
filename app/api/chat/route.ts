import { type NextRequest, NextResponse } from "next/server"
import { ChatHandler } from "@/lib/ai/chat-handler"
import { streamText } from "ai"

// Allow longer processing time for multiple tool calls
export const maxDuration = 60

// Initialize chat handler
const chatHandler = new ChatHandler()

// Store conversation history in memory (in production, use a database)
const conversations = new Map<string, any[]>()

export async function POST(request: NextRequest) {
  try {
    const { message, userId = "default-user", conversationId = "default" } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Message is required and must be a string",
        },
        { status: 400 },
      )
    }

    // Get conversation history
    const previousMessages = conversations.get(conversationId) || []

    // Process message with Tool+LLM+RAG system
    const response = await chatHandler.processMessage(message, userId, previousMessages)

    // Update conversation history
    const updatedHistory = [
      ...previousMessages,
      { role: "user", content: message },
      { role: "assistant", content: response.content }
    ]
    conversations.set(conversationId, updatedHistory.slice(-20)) // Keep last 20 messages

    return NextResponse.json({
      success: true,
      data: {
        message: response.content,
        toolCalls: response.toolCalls,
        blocks: response.blocks,
        conversationId
      }
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

// Support streaming response
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const message = searchParams.get("message")
  const userId = searchParams.get("userId") || "default-user"
  const conversationId = searchParams.get("conversationId") || "default"

  if (!message) {
    return NextResponse.json({ error: "Message parameter required" }, { status: 400 })
  }

  // Get conversation history
  const previousMessages = conversations.get(conversationId) || []

  try {
    // Stream the response
    const result = await chatHandler.streamMessage(message, userId, previousMessages)
    
    // Return the stream
    return new Response(result.textStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
