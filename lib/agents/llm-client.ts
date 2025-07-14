import { generateText, tool } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import { env } from "@/lib/config/env"
import type { ToolDefinition } from "@/lib/tools/types"

export interface LLMResponse {
  text: string
  toolCalls: Array<{
    toolCallId: string
    toolName: string
    args: any
  }>
}

export interface ConversationContext {
  conversationHistory: Array<{
    role: "user" | "assistant" | "system"
    content: string
  }>
  systemStats: {
    activeProjects: number
    pendingTasks: number
    totalGoals: number
    recentActivity: string[]
  }
  userPreferences?: {
    language: string
    timezone: string
  }
}

export class LLMClient {
  private model = openai("gpt-4", {
    apiKey: env.OPENAI_API_KEY, // 使用环境变量
  })

  async processWithTools(
    message: string,
    availableTools: ToolDefinition[],
    context: ConversationContext,
  ): Promise<LLMResponse> {
    try {
      // 验证 API Key 是否存在
      if (!env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY 环境变量未设置")
      }

      const result = await generateText({
        model: this.model,
        messages: [
          {
            role: "system",
            content: this.buildSystemPrompt(context),
          },
          ...context.conversationHistory,
          {
            role: "user",
            content: message,
          },
        ],
        tools: this.convertToolsToAISDK(availableTools),
        maxToolRoundtrips: 5,
        temperature: 0.1,
      })

      return {
        text: result.text,
        toolCalls:
          result.toolCalls?.map((call) => ({
            toolCallId: call.toolCallId,
            toolName: call.toolName,
            args: call.args,
          })) || [],
      }
    } catch (error) {
      console.error("LLM processing failed:", error)

      // 提供更友好的错误信息
      if (error.message?.includes("API key")) {
        throw new Error("OpenAI API Key 无效或未设置，请检查环境变量 OPENAI_API_KEY")
      }

      throw new Error(`LLM处理失败: ${error.message}`)
    }
  }

  private buildSystemPrompt(context: ConversationContext): string {
    const { systemStats } = context

    return `你是LifeAgent智能助手，专门帮助用户管理目标、项目、任务和反思。

## 当前系统状态
- 活跃项目: ${systemStats.activeProjects}个
- 待完成任务: ${systemStats.pendingTasks}个  
- 总目标数: ${systemStats.totalGoals}个
- 最近活动: ${systemStats.recentActivity.join(", ")}

## 你的能力
你可以通过调用工具来帮助用户：
1. **项目管理**: 创建、更新、暂停、完成项目
2. **目标设定**: 创建生活目标、年度目标、季度目标
3. **任务管理**: 添加任务、标记完成、设置优先级
4. **反思记录**: 记录日常反思、分析认知模式

## 交互原则
- 理解用户的真实意图，不要过度解读
- 优先使用工具来执行具体操作
- 提供清晰、友好的反馈
- 在不确定时主动询问澄清
- 保持对话的连贯性和上下文

## 工具使用指南
- 创建项目时，尽量关联到相关目标
- 添加任务时，考虑关联到具体项目
- 记录反思时，可以链接到相关项目
- 执行操作前，确认参数的准确性

请根据用户需求选择合适的工具，并提供有价值的回复。`
  }

  private convertToolsToAISDK(tools: ToolDefinition[]): Record<string, any> {
    const aiTools: Record<string, any> = {}

    for (const toolDef of tools) {
      aiTools[toolDef.name] = tool({
        description: toolDef.description,
        parameters: this.convertJSONSchemaToZod(toolDef.parameters),
        execute: async (params) => {
          // 这里返回参数，实际执行由ChatAgent处理
          return { toolName: toolDef.name, params }
        },
      })
    }

    return aiTools
  }

  private convertJSONSchemaToZod(schema: any): z.ZodSchema {
    // 简化的JSON Schema到Zod转换
    if (schema.type === "object") {
      const shape: Record<string, z.ZodSchema> = {}

      for (const [key, prop] of Object.entries(schema.properties || {})) {
        const propSchema = prop as any

        if (propSchema.type === "string") {
          shape[key] = schema.required?.includes(key) ? z.string() : z.string().optional()
        } else if (propSchema.type === "number") {
          shape[key] = schema.required?.includes(key) ? z.number() : z.number().optional()
        } else if (propSchema.type === "boolean") {
          shape[key] = schema.required?.includes(key) ? z.boolean() : z.boolean().optional()
        } else if (propSchema.type === "array") {
          shape[key] = schema.required?.includes(key) ? z.array(z.string()) : z.array(z.string()).optional()
        }
      }

      return z.object(shape)
    }

    return z.any()
  }

  // 获取系统统计信息
  async getSystemStats(): Promise<ConversationContext["systemStats"]> {
    try {
      // 这��应该从状态管理器获取实际数据
      const { useLifeAgentStore } = await import("@/lib/store")
      const store = useLifeAgentStore.getState()

      return {
        activeProjects: store.projects.filter((p: any) => p.status === "active").length,
        pendingTasks: store.tasks.filter((t: any) => !t.completed).length,
        totalGoals: store.goals.length,
        recentActivity: [store.projects[0]?.name || "无", store.tasks[0]?.title || "无"].filter(Boolean),
      }
    } catch (error) {
      // 如果获取状态失败，返回默认值
      return {
        activeProjects: 0,
        pendingTasks: 0,
        totalGoals: 0,
        recentActivity: [],
      }
    }
  }
}
