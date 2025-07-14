import { prisma } from "../client"

export abstract class BaseRepository<T> {
  protected prisma = prisma

  abstract create(data: any): Promise<T>
  abstract findById(id: string): Promise<T | null>
  abstract update(id: string, data: any): Promise<T>
  abstract delete(id: string): Promise<void>
  abstract findByUserId(userId: string): Promise<T[]>
}
