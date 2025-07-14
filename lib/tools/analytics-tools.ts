import { toolRegistry } from "./registry"
import { projectRepository, taskRepository, reviewRepository } from "@/lib/db/repositories"

// 获取总体统计工具
toolRegistry.register({
  name: "getOverallStats",
  description: "获取系统的总体统计信息，包括项目、任务、目标等数据概览",
  parameters: {
    type: "object",
    properties: {},
  },
  execute: async () => {
    try {
      const userId = "temp-user-id" // TODO: 从认证中获取真实用户ID

      const [projects, taskStats, reviews] = await Promise.all([
        projectRepository.findByUserId(userId),
        taskRepository.getTaskStats(userId),
        reviewRepository.findByUserId(userId),
      ])

      const activeProjects = projects.filter((p) => p.status === "ACTIVE").length
      const completedProjects = projects.filter((p) => p.status === "COMPLETED").length
      const recentReviews = reviews.slice(0, 5)

      const stats = {
        projects: {
          total: projects.length,
          active: activeProjects,
          completed: completedProjects,
          completionRate: projects.length > 0 ? Math.round((completedProjects / projects.length) * 100) : 0,
        },
        tasks: taskStats,
        reviews: {
          total: reviews.length,
          thisWeek: reviews.filter((r) => {
            const weekAgo = new Date()
            weekAgo.setDate(weekAgo.getDate() - 7)
            return new Date(r.createdAt) > weekAgo
          }).length,
        },
      }

      return {
        success: true,
        stats,
        summary: `总共 ${projects.length} 个项目（${activeProjects} 个活跃），${taskStats.total} 个任务（完成率 ${taskStats.completionRate}%），${reviews.length} 条反思记录`,
      }
    } catch (error) {
      throw new Error(`获取统计信息失败: ${error.message}`)
    }
  },
})

// 分析项目进度工具
toolRegistry.register({
  name: "analyzeProjectProgress",
  description: "分析项目进度，识别瓶颈和改进机会",
  parameters: {
    type: "object",
    properties: {
      projectId: {
        type: "string",
        description: "要分析的项目ID（可选，不提供则分析所有项目）",
      },
    },
  },
  execute: async (params: { projectId?: string }) => {
    try {
      const userId = "temp-user-id" // TODO: 从认证中获取真实用户ID

      let projects
      if (params.projectId) {
        const project = await projectRepository.findById(params.projectId)
        projects = project ? [project] : []
      } else {
        projects = await projectRepository.findByUserId(userId)
      }

      const analysis = []

      for (const project of projects) {
        const stats = await projectRepository.getProjectStats(project.id)
        const tasks = await taskRepository.findByProjectId(project.id)

        const overdueTasks = tasks.filter((t) => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()).length

        const highPriorityPending = tasks.filter((t) => !t.completed && t.priority === "HIGH").length

        let status = "正常"
        const recommendations = []

        if (stats.progressPercentage < 30 && project.status === "ACTIVE") {
          status = "进度缓慢"
          recommendations.push("考虑分解大任务为小任务")
          recommendations.push("检查是否有阻塞因素")
        }

        if (overdueTasks > 0) {
          status = "有逾期任务"
          recommendations.push(`处理 ${overdueTasks} 个逾期任务`)
        }

        if (highPriorityPending > 0) {
          recommendations.push(`优先处理 ${highPriorityPending} 个高优先级任务`)
        }

        if (stats.progressPercentage > 80) {
          status = "接近完成"
          recommendations.push("准备项目收尾工作")
        }

        analysis.push({
          projectName: project.name,
          progress: stats.progressPercentage,
          status,
          totalTasks: stats.totalTasks,
          completedTasks: stats.completedTasks,
          overdueTasks,
          recommendations,
        })
      }

      return {
        success: true,
        analysis,
        summary: `分析了 ${projects.length} 个项目，发现 ${analysis.filter((a) => a.recommendations.length > 0).length} 个项目需要关注`,
      }
    } catch (error) {
      throw new Error(`项目进度分析失败: ${error.message}`)
    }
  },
})

// 生成个性化建议工具
toolRegistry.register({
  name: "generatePersonalizedSuggestions",
  description: "基于用户的历史数据生成个性化的改进建议",
  parameters: {
    type: "object",
    properties: {
      timeRange: {
        type: "string",
        enum: ["week", "month", "quarter"],
        description: "分析的时间范围",
      },
    },
  },
  execute: async (params: { timeRange?: "week" | "month" | "quarter" }) => {
    try {
      const userId = "temp-user-id" // TODO: 从认证中获取真实用户ID
      const timeRange = params.timeRange || "month"

      // 计算时间范围
      const now = new Date()
      const startDate = new Date()
      switch (timeRange) {
        case "week":
          startDate.setDate(now.getDate() - 7)
          break
        case "month":
          startDate.setDate(now.getDate() - 30)
          break
        case "quarter":
          startDate.setDate(now.getDate() - 90)
          break
      }

      const [projects, tasks, reviews] = await Promise.all([
        projectRepository.findByUserId(userId),
        taskRepository.findByUserId(userId),
        reviewRepository.findByDateRange(userId, startDate, now),
      ])

      const suggestions = []

      // 分析任务完成模式
      const completedTasks = tasks.filter((t) => t.completed && new Date(t.completedAt!) > startDate)
      const taskCompletionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0

      if (taskCompletionRate < 60) {
        suggestions.push({
          type: "productivity",
          title: "提高任务完成率",
          description: `你的任务完成率为 ${Math.round(taskCompletionRate)}%，建议设置更小的任务目标`,
          priority: "high",
        })
      }

      // 分析逾期任务
      const overdueTasks = tasks.filter((t) => !t.completed && t.dueDate && new Date(t.dueDate) < now)
      if (overdueTasks.length > 0) {
        suggestions.push({
          type: "time_management",
          title: "改善时间管理",
          description: `你有 ${overdueTasks.length} 个逾期任务，建议重新评估任务优先级`,
          priority: "high",
        })
      }

      // 分析反思频率
      if (reviews.length < 7 && timeRange === "month") {
        suggestions.push({
          type: "reflection",
          title: "增加反思频率",
          description: "定期反思有助于提高自我认知，建议每周至少写一次反思",
          priority: "medium",
        })
      }

      // 分析项目分布
      const activeProjects = projects.filter((p) => p.status === "ACTIVE")
      if (activeProjects.length > 5) {
        suggestions.push({
          type: "focus",
          title: "聚焦重点项目",
          description: `你有 ${activeProjects.length} 个活跃项目，建议聚焦 2-3 个重点项目`,
          priority: "medium",
        })
      }

      return {
        success: true,
        suggestions,
        timeRange,
        summary: `基于 ${timeRange} 的数据分析，为你生成了 ${suggestions.length} 条个性化建议`,
      }
    } catch (error) {
      throw new Error(`生成个性化建议失败: ${error.message}`)
    }
  },
})
