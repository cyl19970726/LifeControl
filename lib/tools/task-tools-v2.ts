import { toolRegistry } from "./registry"
import { TaskRepository } from "@/lib/db/repositories/task-repository"

const taskRepository = new TaskRepository()

// 创建任务工具 - 数据库版本
toolRegistry.register({
  name: "createTask",
  description: "创建一个新任务，可以关联到特定项目，数据将保存到数据库",
  parameters: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "任务标题",
      },
      description: {
        type: "string",
        description: "任务描述",
      },
      projectId: {
        type: "string",
        description: "关联的项目ID",
      },
      priority: {
        type: "string",
        enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
        description: "任务优先级",
      },
      dueDate: {
        type: "string",
        description: "截止日期 (YYYY-MM-DD 格式)",
      },
    },
    required: ["title"],
  },
  execute: async (params: {
    title: string
    description?: string
    projectId?: string
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
    dueDate?: string
  }) => {
    try {
      const userId = "temp-user-id" // TODO: 从认证中获取真实用户ID

      const task = await taskRepository.create({
        title: params.title,
        description: params.description,
        priority: params.priority || "MEDIUM",
        dueDate: params.dueDate ? new Date(params.dueDate) : null,
        user: { connect: { id: userId } },
        project: params.projectId ? { connect: { id: params.projectId } } : undefined,
      })

      return {
        success: true,
        task,
        message: `任务 "${params.title}" 创建成功并已保存到数据库！`,
      }
    } catch (error) {
      throw new Error(`创建任务失败: ${error.message}`)
    }
  },
})

// 完成任务工具
toolRegistry.register({
  name: "completeTask",
  description: "标记任务为已完成",
  parameters: {
    type: "object",
    properties: {
      taskId: {
        type: "string",
        description: "要完成的任务ID",
      },
    },
    required: ["taskId"],
  },
  execute: async (params: { taskId: string }) => {
    try {
      const task = await taskRepository.markCompleted(params.taskId)

      return {
        success: true,
        task,
        message: `任务 "${task.title}" 已标记为完成！`,
      }
    } catch (error) {
      throw new Error(`完成任务失败: ${error.message}`)
    }
  },
})

// 获取任务统计工具
toolRegistry.register({
  name: "getTaskStats",
  description: "获取用户的任务统计信息",
  parameters: {
    type: "object",
    properties: {},
  },
  execute: async () => {
    try {
      const userId = "temp-user-id" // TODO: 从认证中获取真实用户ID
      const stats = await taskRepository.getTaskStats(userId)

      return {
        success: true,
        stats,
        summary: `总任务: ${stats.total}个，已完成: ${stats.completed}个，待完成: ${stats.pending}个，逾期: ${stats.overdue}个，完成率: ${stats.completionRate}%`,
      }
    } catch (error) {
      throw new Error(`获取任务统计失败: ${error.message}`)
    }
  },
})

// 获取即将到期的任务
toolRegistry.register({
  name: "getUpcomingTasks",
  description: "获取即将到期的任务列表",
  parameters: {
    type: "object",
    properties: {
      days: {
        type: "number",
        description: "未来几天内的任务，默认7天",
      },
    },
  },
  execute: async (params: { days?: number }) => {
    try {
      const userId = "temp-user-id" // TODO: 从认证中获取真实用户ID
      const tasks = await taskRepository.findUpcoming(userId, params.days || 7)

      return {
        success: true,
        tasks: tasks.map((t) => ({
          id: t.id,
          title: t.title,
          dueDate: t.dueDate,
          priority: t.priority,
          projectName: t.project?.name,
        })),
        count: tasks.length,
        summary: `找到 ${tasks.length} 个即将到期的任务`,
      }
    } catch (error) {
      throw new Error(`获取即将到期任务失败: ${error.message}`)
    }
  },
})
