/**
 * Common Tool-related typings that can be shared across the whole code-base
 * (LLMClient, ChatAgent, Registry …).
 *
 *  ⚠️  Keep this intentionally light-weight.  In later phases we can extend
 *  the schema validation with zod / JSON-Schema if needed.
 */
export type ToolCategory = "project" | "goal" | "task" | "review" | "system"

export interface ToolDefinition<TParams = unknown, TResult = unknown> {
  /** Unique machine-readable name (used by the LLM / registry) */
  name: string
  /** Human friendly description for the LLM system prompt */
  description: string
  /** JSON-Schema like parameters definition (will be converted to zod) */
  parameters: Record<string, any>
  /** Actual business logic of the tool */
  execute: (params: TParams) => Promise<TResult> | TResult
  /** Optional category used for grouping / filtering */
  category?: ToolCategory
}

/* --- Runtime structs used by ChatAgent ---------------------------------- */

export interface ToolCall {
  name: string
  /** Raw args the LLM decided to pass */
  arguments: any
}

export interface ToolResult {
  toolCall: ToolCall
  result?: any
  error?: string
  success: boolean
  timestamp: Date
}
