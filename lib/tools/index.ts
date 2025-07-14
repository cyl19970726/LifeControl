// 导入所有工具模块，确保它们被注册
import "./project-tools"
import "./goal-tools"
import "./task-tools"
import "./review-tools"

// 导出工具注册表
export type { ToolDefinition, ToolResult } from "./types"
