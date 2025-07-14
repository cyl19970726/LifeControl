import type { Task, Prisma } from "@prisma/client"
import { BaseRepository } from "./base-repository"

export type TaskWithRelations = Task & {
  project?: { id: string; name: string; status: string }
}

export class TaskRepository extends BaseRepository<Task> {
  async create(data: Prisma.TaskCreateInput): Promise<Task> {
    return this.prisma.task.create({
      data,
      include: {
        project: { select: { id: true, name: true, status: true } },
      },
    })
  }

  async findById(id: string): Promise<TaskWithRelations | null> {
    return this.prisma.task.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, status: true } },
      },
    }) as TaskWithRelations | null
  }

  async update(id: string, data: Prisma.TaskUpdateInput): Promise<Task> {
    return this.prisma.task.update({
      where: { id },
      data,
      include: {
        project: { select: { id: true, name: true, status: true } },
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
        project: { select: { id: true, name: true, status: true } },
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
        project: { select: { id: true, name: true, status: true } },
      },
      orderBy: { dueDate: "asc" },
    }) as TaskWithRelations[]
  }

  async findUpcoming(userId: string, days = 7): Promise<TaskWithRelations[]> {
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + days)

    return this.prisma.task.findMany({
      where: {
        userId,
        completed: false,
        dueDate: {
          lte: endDate,
        },
      },
      include: {
        project: { select: { id: true, name: true, status: true } },
      },
      orderBy: { dueDate: "asc" },
    }) as TaskWithRelations[]
  }

  async markCompleted(id: string): Promise<Task> {
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
    const now = new Date()

    const [total, completed, overdue] = await Promise.all([
      this.prisma.task.count({ where: { userId } }),
      this.prisma.task.count({ where: { userId, completed: true } }),
      this.prisma.task.count({
        where: {
          userId,
          completed: false,
          dueDate: { lt: now },
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
