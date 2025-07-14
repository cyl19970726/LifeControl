import type { ToolDefinition } from "./types"

/**
 * Ultra-simple in-memory tool registry.
 * (Good enough for local dev; can be swapped for a more advanced
 *  auto-discovery mechanism later.)
 */
export class ToolRegistry {
  private readonly tools = new Map<string, ToolDefinition>()

  register<TParams = any, TResult = any>(tool: ToolDefinition<TParams, TResult>) {
    if (this.tools.has(tool.name)) {
      // Allow hot-reload in dev without crashing
      console.warn(`[ToolRegistry] Tool "${tool.name}" already registered – overwriting`)
    }
    this.tools.set(tool.name, tool)
  }

  get(name: string) {
    return this.tools.get(name)
  }

  getAllTools() {
    return Array.from(this.tools.values())
  }

  /**
   * AI-SDK helper – returns a *plain* array of tool definitions so the
   * LLMClient can feed them into generateText().
   */
  getToolDefinitions() {
    return this.getAllTools()
  }

  /** Execute and automatically throw if tool not found. */
  async execute<T = any>(name: string, params: any): Promise<T> {
    const tool = this.tools.get(name)
    if (!tool) throw new Error(`Tool "${name}" not found`)
    return tool.execute(params) as Promise<T>
  }
}

/* ----------------------------------------------------------------------- */
/* Global singleton so all parts of the app share the same registry        */
/* ----------------------------------------------------------------------- */

export const toolRegistry = new ToolRegistry()

/* ----------------------------------------------------------------------- */
/* EXAMPLE PLACEHOLDER TO VERIFY REGISTRY WORKS – you can delete later.    */
/* ----------------------------------------------------------------------- */
toolRegistry.register({
  name: "ping",
  description: "Health-check tool that just returns `pong`.",
  parameters: {},
  execute: () => "pong",
})
