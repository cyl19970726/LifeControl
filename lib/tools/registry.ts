/**
 * 简易全局 ToolRegistry（单例）
 */
import type { ToolDefinition } from "./types"

export class ToolRegistry {
  private readonly tools = new Map<string, ToolDefinition>()

  register(tool: ToolDefinition<any, any>) {
    if (this.tools.has(tool.name)) {
      // 热更新时允许覆盖
      console.warn(`[ToolRegistry] "${tool.name}" 已注册，覆盖旧实现`)
    }
    this.tools.set(tool.name, tool)
  }

  get(name: string) {
    return this.tools.get(name)
  }

  getAllTools() {
    return Array.from(this.tools.values())
  }

  async execute(name: string, params: any) {
    const tool = this.tools.get(name)
    if (!tool) throw new Error(`Tool "${name}" 未注册`)
    return tool.execute(params)
  }

  /** 供 LLMClient 转成 AI-SDK tools 列表 */
  getToolDefinitions() {
    return this.getAllTools()
  }
}

/** 全局唯一实例 */
export const toolRegistry = new ToolRegistry()
