import { ReviewRepository } from "@/lib/db/repositories/review-repository"
import { TaskRepository } from "@/lib/db/repositories/task-repository"
import { ProjectRepository } from "@/lib/db/repositories/project-repository"

const reviewRepository = new ReviewRepository()
const taskRepository = new TaskRepository()
const projectRepository = new ProjectRepository()

export interface PersonalInsights {
  productivity: {
    averageTasksPerDay: number
    completionRate: number
    mostProductiveTimeSlot: string
    productivityTrend: "increasing" | "decreasing" | "stable"
  }

  patterns: {
    commonChallenges: Array<{ challenge: string; frequency: number }>
    successFactors: Array<{ factor: string; impact: number }>
    emotionalTrends: Array<{ date: string; mood: number }>
  }

  recommendations: Array<{
    type: "optimization" | "warning" | "opportunity"
    title: string
    description: string
    actionItems: string[]
  }>
}

export class InsightsEngine {
  async generatePersonalInsights(userId: string): Promise<PersonalInsights> {
    const [taskStats, reviewPatterns, projectProgress] = await Promise.all([
      this.analyzeTaskPatterns(userId),
      this.analyzeReviewPatterns(userId),
      this.analyzeProjectProgress(userId),
    ])

    return {
      productivity: {
        averageTasksPerDay: taskStats.averageTasksPerDay,
        completionRate: taskStats.completionRate,
        mostProductiveTimeSlot: taskStats.mostProductiveTimeSlot,
        productivityTrend: taskStats.trend,
      },

      patterns: {
        commonChallenges: reviewPatterns.challenges,
        successFactors: reviewPatterns.successFactors,
        emotionalTrends: reviewPatterns.moodTrends,
      },

      recommendations: this.generateRecommendations(taskStats, reviewPatterns, projectProgress),
    }
  }

  private async analyzeTaskPatterns(userId: string) {
    const tasks = await taskRepository.findByUserId(userId)
    const stats = await taskRepository.getTaskStats(userId)

    // 分析任务完成时间模式
    const completedTasks = tasks.filter((t) => t.completed && t.completedAt)
    const hourCounts = new Array(24).fill(0)

    completedTasks.forEach((task) => {
      if (task.completedAt) {
        const hour = new Date(task.completedAt).getHours()
        hourCounts[hour]++
      }
    })

    const mostProductiveHour = hourCounts.indexOf(Math.max(...hourCounts))
    const mostProductiveTimeSlot = this.getTimeSlotName(mostProductiveHour)

    // 计算平均每日任务数
    const daysSinceFirstTask =
      completedTasks.length > 0
        ? Math.max(1, Math.ceil((Date.now() - new Date(completedTasks[0].createdAt).getTime()) / (1000 * 60 * 60 * 24)))
        : 1
    const averageTasksPerDay = Math.round((completedTasks.length / daysSinceFirstTask) * 10) / 10

    // 分析趋势（简化版本）
    const recentTasks = completedTasks.filter(
      (t) => t.completedAt && new Date(t.completedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    ).length
    const previousTasks = completedTasks.filter(
      (t) =>
        t.completedAt &&
        new Date(t.completedAt) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) &&
        new Date(t.completedAt) <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    ).length

    let trend: "increasing" | "decreasing" | "stable" = "stable"
    if (recentTasks > previousTasks * 1.2) trend = "increasing"
    else if (recentTasks < previousTasks * 0.8) trend = "decreasing"

    return {
      averageTasksPerDay,
      completionRate: stats.completionRate,
      mostProductiveTimeSlot,
      trend,
    }
  }

  private async analyzeReviewPatterns(userId: string) {
    const reviews = await reviewRepository.findByUserId(userId)

    // 分析挑战模式
    const challengeTags = ["挑战", "困难", "问题", "阻碍", "延迟"]
    const successTags = ["成功", "完成", "进展", "突破", "成就"]

    const challenges = new Map<string, number>()
    const successFactors = new Map<string, number>()
    const moodTrends: Array<{ date: string; mood: number }> = []

    reviews.forEach((review) => {
      // 分析标签
      review.tags.forEach((tag) => {
        if (challengeTags.some((ct) => tag.includes(ct))) {
          challenges.set(tag, (challenges.get(tag) || 0) + 1)
        }
        if (successTags.some((st) => tag.includes(st))) {
          successFactors.set(tag, (successFactors.get(tag) || 0) + 1)
        }
      })

      // 收集心情数据
      if (review.mood) {
        moodTrends.push({
          date: review.createdAt.toISOString().split("T")[0],
          mood: review.mood,
        })
      }
    })

    return {
      challenges: Array.from(challenges.entries())
        .map(([challenge, frequency]) => ({ challenge, frequency }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5),

      successFactors: Array.from(successFactors.entries())
        .map(([factor, impact]) => ({ factor, impact }))
        .sort((a, b) => b.impact - a.impact)
        .slice(0, 5),

      moodTrends: moodTrends.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-30), // 最近30天
    }
  }

  private async analyzeProjectProgress(userId: string) {
    const projects = await projectRepository.findByUserId(userId)

    const activeProjects = projects.filter((p) => p.status === "ACTIVE")
    const completedProjects = projects.filter((p) => p.status === "COMPLETED")

    return {
      activeCount: activeProjects.length,
      completedCount: completedProjects.length,
      averageCompletionTime: this.calculateAverageCompletionTime(completedProjects),
    }
  }

  private generateRecommendations(taskStats: any, reviewPatterns: any, projectProgress: any) {
    const recommendations = []

    // 基于完成率的建议
    if (taskStats.completionRate < 70) {
      recommendations.push({
        type: "optimization" as const,
        title: "提高任务完成率",
        description: `你的任务完成率为 ${taskStats.completionRate}%，有提升空间`,
        actionItems: ["将大任务分解为更小的子任务", "设置更现实的截止日期", "优先处理高优先级任务"],
      })
    }

    // 基于生产力趋势的建议
    if (taskStats.trend === "decreasing") {
      recommendations.push({
        type: "warning" as const,
        title: "生产力下降趋势",
        description: "最近一周的任务完成数量有所下降",
        actionItems: ["回顾最近的工作安排", "检查是否有外部干扰因素", "考虑调整工作方法"],
      })
    }

    // 基于挑战模式的建议
    if (reviewPatterns.challenges.length > 0) {
      const topChallenge = reviewPatterns.challenges[0]
      recommendations.push({
        type: "opportunity" as const,
        title: "解决常见挑战",
        description: `你经常提到"${topChallenge.challenge}"相关的挑战`,
        actionItems: ["制定针对性的解决方案", "寻求相关资源或帮助", "记录解决过程以供未来参考"],
      })
    }

    return recommendations
  }

  private getTimeSlotName(hour: number): string {
    if (hour >= 6 && hour < 12) return "上午"
    if (hour >= 12 && hour < 18) return "下午"
    if (hour >= 18 && hour < 22) return "晚上"
    return "深夜"
  }

  private calculateAverageCompletionTime(projects: any[]): number {
    const completedWithDates = projects.filter((p) => p.startDate && p.endDate)
    if (completedWithDates.length === 0) return 0

    const totalDays = completedWithDates.reduce((sum, project) => {
      const start = new Date(project.startDate)
      const end = new Date(project.endDate)
      return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    }, 0)

    return Math.round(totalDays / completedWithDates.length)
  }
}

export const insightsEngine = new InsightsEngine()
