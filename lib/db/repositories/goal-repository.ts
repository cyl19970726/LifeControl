import type { Goal, Prisma } from "@prisma/client"
import { BaseRepository } from "./base-repository"

export type GoalWithRelations = Goal & {
  projects: Array<{ id: string; name: string; status: string }>
  _count: {
    projects: number
  }
}

export class GoalRepository extends BaseRepository<Goal> {
  async create(data: Prisma.GoalCreateInput): Promise<Goal> {
    return this.prisma.goal.create({
      data,
      include: {
        projects: { select: { id: true, name: true, status: true } },
        _count: { select: { projects: true } },
      },
    })
  }

  async findById(id: string): Promise<GoalWithRelations | null> {
    return this.prisma.goal.findUnique({
      where: { id },
      include: {
        projects: {
          select: { id: true, name: true, status: true, updatedAt: true },
          orderBy: { updatedAt: "desc" },
        },
        _count: { select: { projects: true } },
      },
    }) as GoalWithRelations | null
  }

  async update(id: string, data: Prisma.GoalUpdateInput): Promise<Goal> {
    return this.prisma.goal.update({
      where: { id },
      data,
      include: {
        projects: { select: { id: true, name: true, status: true } },
        _count: { select: { projects: true } },
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.goal.delete({
      where: { id },
    })
  }

  async findByUserId(userId: string): Promise<GoalWithRelations[]> {
    return this.prisma.goal.findMany({
      where: { userId },
      include: {
        projects: { select: { id: true, name: true, status: true } },
        _count: { select: { projects: true } },
      },
      orderBy: { updatedAt: "desc" },
    }) as GoalWithRelations[]
  }

  async findByStage(userId: string, stage: string): Promise<Goal[]> {
    return this.prisma.goal.findMany({
      where: {
        userId,
        stage: stage as any,
      },
      orderBy: { updatedAt: "desc" },
    })
  }

  async linkToProject(goalId: string, projectId: string): Promise<void> {
    await this.prisma.goal.update({
      where: { id: goalId },
      data: {
        projects: {
          connect: { id: projectId },
        },
      },
    })
  }

  async unlinkFromProject(goalId: string, projectId: string): Promise<void> {
    await this.prisma.goal.update({
      where: { id: goalId },
      data: {
        projects: {
          disconnect: { id: projectId },
        },
      },
    })
  }
}
