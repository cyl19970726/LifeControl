// 预加载所有工具模块，确保在应用启动时完成注册
import "./project-tools"
import "./goal-tools"
import "./task-tools"
import "./review-tools"

export type { ToolDefinition, ToolResult } from "./types"
