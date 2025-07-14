// 导入所有工具模块，确保它们被注册
import "./project-tools"
import "./goal-tools"
import "./task-tools"
import "./review-tools"
import "./project-tools-v2"
import "./task-tools-v2"
import "./analytics-tools"

// 导出工具注册表和类型
export { toolRegistry } from "./registry"
export type { ToolDefinition, ToolResult } from "./types"
