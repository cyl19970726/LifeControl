import { LLMClient, type ConversationContext } from "./llm-client"
// 确保所有工具都被加载
import "@/lib/tools"
import { toolRegistry } from "@/lib/tools/registry"
import type { ToolResult } from "@/lib/tools/types"

export interface AgentResponse {
  message: string
  toolResults: ToolResult[]
  success: boolean
  conversationId?: string
}

export class ChatAgent {
  private llmClient: LLMClient
  private conversationHistory: ConversationContext["conversationHistory"] = []

  constructor() {
    this.llmClient = new LLMClient()
  }

  async processMessage(message: string): Promise<AgentResponse> {
    try {
      // 1. 获取系统上下文
      const context: ConversationContext = {
        conversationHistory: this.conversationHistory,
        systemStats: await this.llmClient.getSystemStats(),
      }

      // 2. 获取所有可用工具
      const availableTools = toolRegistry.getAllTools()

      // 3. 调用LLM进行处理
      const llmResponse = await this.llmClient.processWithTools(message, availableTools, context)

      // 4. 执行工具调用
      const toolResults: ToolResult[] = []

      for (const toolCall of llmResponse.toolCalls) {
        try {
          const result = await toolRegistry.execute(toolCall.toolName, toolCall.args)

          toolResults.push({
            toolCall: {
              name: toolCall.toolName,
              arguments: toolCall.args,
            },
            result,
            success: true,
            timestamp: new Date(),
          })
        } catch (error) {
          toolResults.push({
            toolCall: {
              name: toolCall.toolName,
              arguments: toolCall.args,
            },
            error: error.message,
            success: false,
            timestamp: new Date(),
          })
        }
      }

      // 5. 更新对话历史
      this.updateConversationHistory(message, llmResponse.text, toolResults)

      // 6. 生成最终响应
      const finalResponse = this.buildFinalResponse(llmResponse.text, toolResults)

      return {
        message: finalResponse,
        toolResults,
        success: toolResults.length === 0 || toolResults.some((r) => r.success),
      }
    } catch (error) {
      console.error("ChatAgent processing failed:", error)

      return {
        message: `抱歉，处理您的请求时出现了错误：${error.message}`,
        toolResults: [],
        success: false,
      }
    }
  }

  private updateConversationHistory(userMessage: string, assistantResponse: string, toolResults: ToolResult[]): void {
    // 添加用户消息
    this.conversationHistory.push({
      role: "user",
      content: userMessage,
    })

    // 添加助手响应
    this.conversationHistory.push({
      role: "assistant",
      content: assistantResponse,
    })

    // 保持历史记录在合理长度
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-16)
    }
  }

  private buildFinalResponse(llmResponse: string, toolResults: ToolResult[]): string {
    const successfulTools = toolResults.filter((r) => r.success)
    const failedTools = toolResults.filter((r) => !r.success)

    let response = llmResponse

    // 如果有工具执行结果，添加执行状态
    if (toolResults.length > 0) {
      if (successfulTools.length > 0) {
        const toolNames = successfulTools.map((r) => r.toolCall.name).join(", ")
        response += `\n\n✅ 已成功执行: ${toolNames}`
      }

      if (failedTools.length > 0) {
        const errors = failedTools.map((r) => r.error).join(", ")
        response += `\n\n❌ 执行失败: ${errors}`
      }
    }

    return response
  }

  // 获取对话历史
  getConversationHistory(): ConversationContext["conversationHistory"] {
    return [...this.conversationHistory]
  }

  // 清除对话历史
  clearConversationHistory(): void {
    this.conversationHistory = []
  }

  // 设置系统消息
  setSystemMessage(message: string): void {
    // 移除旧的系统消息
    this.conversationHistory = this.conversationHistory.filter((msg) => msg.role !== "system")

    // 添加新的系统消息到开头
    this.conversationHistory.unshift({
      role: "system",
      content: message,
    })
  }
}

// 创建全局实例
export const chatAgent = new ChatAgent()
