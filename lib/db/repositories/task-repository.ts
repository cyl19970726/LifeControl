import type { Task, Prisma } from "@prisma/client"
import { BaseRepository } from "./base-repository"

export type TaskWithRelations = Task & {
  project?: { id: string; name: string }
}

export class TaskRepository extends BaseRepository<Task> {
  async create(data: Prisma.TaskCreateInput): Promise<Task> {
    return this.prisma.task.create({
      data,
      include: {
        project: { select: { id: true, name: true } },
      },
    })
  }

  async findById(id: string): Promise<TaskWithRelations | null> {
    return this.prisma.task.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true } },
      },
    }) as TaskWithRelations | null
  }

  async update(id: string, data: Prisma.TaskUpdateInput): Promise<Task> {
    return this.prisma.task.update({
      where: { id },
      data,
      include: {
        project: { select: { id: true, name: true } },
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({
      where: { id },
    })
  }

  async findByUserId(userId: string): Promise<TaskWithRelations[]> {
    return this.prisma.task.findMany({
      where: { userId },
      include: {
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }) as TaskWithRelations[]
  }

  async findByProjectId(projectId: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    })
  }

  async findByStatus(userId: string, completed: boolean): Promise<TaskWithRelations[]> {
    return this.prisma.task.findMany({
      where: {
        userId,
        completed,
      },
      include: {
        project: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: "asc" },
    }) as TaskWithRelations[]
  }

  async findOverdueTasks(userId: string): Promise<TaskWithRelations[]> {
    return this.prisma.task.findMany({
      where: {
        userId,
        completed: false,
        dueDate: {
          lt: new Date(),
        },
      },
      include: {
        project: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: "asc" },
    }) as TaskWithRelations[]
  }

  async findUpcomingTasks(userId: string, days: number = 7): Promise<TaskWithRelations[]> {
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + days)

    return this.prisma.task.findMany({
      where: {
        userId,
        completed: false,
        dueDate: {
          gte: new Date(),
          lte: endDate,
        },
      },
      include: {
        project: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: "asc" },
    }) as TaskWithRelations[]
  }

  async completeTask(id: string): Promise<Task> {
    return this.prisma.task.update({
      where: { id },
      data: {
        completed: true,
        completedAt: new Date(),
      },
    })
  }

  async getTaskStats(userId: string): Promise<{
    total: number
    completed: number
    pending: number
    overdue: number
    completionRate: number
  }> {
    const [total, completed, overdue] = await Promise.all([
      this.prisma.task.count({ where: { userId } }),
      this.prisma.task.count({ where: { userId, completed: true } }),
      this.prisma.task.count({
        where: {
          userId,
          completed: false,
          dueDate: { lt: new Date() },
        },
      }),
    ])

    const pending = total - completed
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      total,
      completed,
      pending,
      overdue,
      completionRate,
    }
  }
}
