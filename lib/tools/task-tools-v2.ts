import { toolRegistry } from "./registry"
import { taskRepository } from "@/lib/db/repositories"

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
        message: `任务 "${params.title}" 创建成功并已保存到数据库！${params.projectId ? " 已关联到指定项目。" : ""}`,
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
      const task = await taskRepository.completeTask(params.taskId)

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

// 获取任务列表工具
toolRegistry.register({
  name: "listTasks",
  description: "获取任务列表，可按状态、项目等筛选",
  parameters: {
    type: "object",
    properties: {
      completed: {
        type: "boolean",
        description: "筛选已完成或未完成的任务",
      },
      projectId: {
        type: "string",
        description: "按项目ID筛选任务",
      },
      upcoming: {
        type: "boolean",
        description: "获取即将到期的任务（7天内）",
      },
      overdue: {
        type: "boolean",
        description: "获取已逾期的任务",
      },
    },
  },
  execute: async (params: {
    completed?: boolean
    projectId?: string
    upcoming?: boolean
    overdue?: boolean
  }) => {
    try {
      const userId = "temp-user-id" // TODO: 从认证中获取真实用户ID

      let tasks

      if (params.upcoming) {
        tasks = await taskRepository.findUpcomingTasks(userId)
      } else if (params.overdue) {
        tasks = await taskRepository.findOverdueTasks(userId)
      } else if (params.projectId) {
        tasks = await taskRepository.findByProjectId(params.projectId)
      } else if (typeof params.completed === "boolean") {
        tasks = await taskRepository.findByStatus(userId, params.completed)
      } else {
        tasks = await taskRepository.findByUserId(userId)
      }

      return {
        success: true,
        tasks: tasks.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          completed: t.completed,
          priority: t.priority,
          dueDate: t.dueDate,
          projectName: t.project?.name,
          createdAt: t.createdAt,
        })),
        count: tasks.length,
        summary: `找到 ${tasks.length} 个任务`,
      }
    } catch (error) {
      throw new Error(`获取任务列表失败: ${error.message}`)
    }
  },
})

// 获取任务统计工具
toolRegistry.register({
  name: "getTaskStats",
  description: "获取任务统计信息，包括完成率、逾期任务等",
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
        summary: `总任务 ${stats.total} 个，已完成 ${stats.completed} 个，完成率 ${stats.completionRate}%，逾期 ${stats.overdue} 个`,
      }
    } catch (error) {
      throw new Error(`获取任务统计失败: ${error.message}`)
    }
  },
})
