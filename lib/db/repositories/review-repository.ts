import type { Review, Prisma } from "@prisma/client"
import { BaseRepository } from "./base-repository"

export type ReviewWithRelations = Review & {
  projects: Array<{ id: string; name: string }>
}

export class ReviewRepository extends BaseRepository<Review> {
  async create(data: Prisma.ReviewCreateInput): Promise<Review> {
    return this.prisma.review.create({
      data,
      include: {
        projects: { select: { id: true, name: true } },
      },
    })
  }

  async findById(id: string): Promise<ReviewWithRelations | null> {
    return this.prisma.review.findUnique({
      where: { id },
      include: {
        projects: { select: { id: true, name: true } },
      },
    }) as ReviewWithRelations | null
  }

  async update(id: string, data: Prisma.ReviewUpdateInput): Promise<Review> {
    return this.prisma.review.update({
      where: { id },
      data,
      include: {
        projects: { select: { id: true, name: true } },
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.review.delete({
      where: { id },
    })
  }

  async findByUserId(userId: string): Promise<ReviewWithRelations[]> {
    return this.prisma.review.findMany({
      where: { userId },
      include: {
        projects: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }) as ReviewWithRelations[]
  }

  async findByType(userId: string, type: string): Promise<Review[]> {
    return this.prisma.review.findMany({
      where: {
        userId,
        type: type as any,
      },
      orderBy: { createdAt: "desc" },
    })
  }

  async findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Review[]> {
    return this.prisma.review.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: "desc" },
    })
  }

  async analyzePatterns(
    userId: string,
    timeRange: "week" | "month" | "quarter",
  ): Promise<{
    totalReviews: number
    averageMood: number
    commonTags: Array<{ tag: string; count: number }>
    moodTrend: Array<{ date: string; mood: number }>
  }> {
    const now = new Date()
    let startDate: Date

    switch (timeRange) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "quarter":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
    }

    const reviews = await this.findByDateRange(userId, startDate, now)

    // 计算平均心情
    const moodsWithValues = reviews.filter((r) => r.mood !== null).map((r) => r.mood!)
    const averageMood =
      moodsWithValues.length > 0 ? moodsWithValues.reduce((sum, mood) => sum + mood, 0) / moodsWithValues.length : 5

    // 统计标签频率
    const tagCounts = new Map<string, number>()
    reviews.forEach((review) => {
      review.tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      })
    })

    const commonTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // 心情趋势
    const moodTrend = reviews
      .filter((r) => r.mood !== null)
      .map((r) => ({
        date: r.createdAt.toISOString().split("T")[0],
        mood: r.mood!,
      }))
      .slice(0, 30)

    return {
      totalReviews: reviews.length,
      averageMood: Math.round(averageMood * 10) / 10,
      commonTags,
      moodTrend,
    }
  }
}
