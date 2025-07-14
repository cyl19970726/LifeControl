import type { Project, Prisma } from "@prisma/client"
import { BaseRepository } from "./base-repository"

export type ProjectWithRelations = Project & {
  goals: Array<{ id: string; title: string; stage: string }>
  tasks: Array<{ id: string; title: string; completed: boolean }>
  reviews: Array<{ id: string; content: string; createdAt: Date }>
  _count: {
    tasks: number
    reviews: number
  }
}

export class ProjectRepository extends BaseRepository<Project> {
  async create(data: Prisma.ProjectCreateInput): Promise<Project> {
    return this.prisma.project.create({
      data,
      include: {
        goals: { select: { id: true, title: true, stage: true } },
        tasks: { select: { id: true, title: true, completed: true } },
        reviews: { select: { id: true, content: true, createdAt: true } },
        _count: { select: { tasks: true, reviews: true } },
      },
    })
  }

  async findById(id: string): Promise<ProjectWithRelations | null> {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        goals: { select: { id: true, title: true, stage: true } },
        tasks: {
          select: { id: true, title: true, completed: true, dueDate: true },
          orderBy: { createdAt: "desc" },
        },
        reviews: {
          select: { id: true, content: true, createdAt: true, type: true },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { tasks: true, reviews: true } },
      },
    }) as ProjectWithRelations | null
  }

  async update(id: string, data: Prisma.ProjectUpdateInput): Promise<Project> {
    return this.prisma.project.update({
      where: { id },
      data,
      include: {
        goals: { select: { id: true, title: true, stage: true } },
        tasks: { select: { id: true, title: true, completed: true } },
        reviews: { select: { id: true, content: true, createdAt: true } },
        _count: { select: { tasks: true, reviews: true } },
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.project.delete({
      where: { id },
    })
  }

  async findByUserId(userId: string): Promise<ProjectWithRelations[]> {
    return this.prisma.project.findMany({
      where: { userId },
      include: {
        goals: { select: { id: true, title: true, stage: true } },
        tasks: { select: { id: true, title: true, completed: true } },
        reviews: { select: { id: true, content: true, createdAt: true } },
        _count: { select: { tasks: true, reviews: true } },
      },
      orderBy: { updatedAt: "desc" },
    }) as ProjectWithRelations[]
  }

  async findByStatus(userId: string, status: string): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: {
        userId,
        status: status as any,
      },
      orderBy: { updatedAt: "desc" },
    })
  }

  async getProjectStats(id: string): Promise<{
    totalTasks: number
    completedTasks: number
    totalReviews: number
    progressPercentage: number
  }> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        tasks: { select: { completed: true } },
        _count: { select: { reviews: true } },
      },
    })

    if (!project) {
      throw new Error("Project not found")
    }

    const totalTasks = project.tasks.length
    const completedTasks = project.tasks.filter((t) => t.completed).length
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return {
      totalTasks,
      completedTasks,
      totalReviews: project._count.reviews,
      progressPercentage,
    }
  }
}
