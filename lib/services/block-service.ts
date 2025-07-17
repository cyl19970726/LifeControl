import { db } from '../db/client'
import { Block, CreateBlock, UpdateBlock, BlockMetadata } from '../types/block'
import { VectorService } from '../rag/vector-service'

export class BlockService {
  constructor(
    private vectorService: VectorService
  ) {}

  async createBlock(data: CreateBlock): Promise<Block> {
    // 1. Create block in database
    const block = await db.block.create({
      data: {
        type: data.type,
        content: data.content,
        metadata: {
          ...data.metadata,
          tags: data.metadata?.tags || [],
          category: data.metadata?.category || 'general',
          linkedBlocks: data.metadata?.linkedBlocks || [],
          mentions: data.metadata?.mentions || [],
          aiGenerated: data.metadata?.aiGenerated || false
        },
        templateId: data.templateId,
        parentId: data.parentId,
        userId: data.userId
      }
    })

    // 2. Generate vector embedding and store
    await this.vectorService.upsertBlock(block as Block)

    return block as any as Block
  }

  async updateBlock(id: string, updates: UpdateBlock): Promise<Block> {
    // 1. Update block in database
    const block = await db.block.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    })

    // 2. Update vector index if content changed
    if (updates.content) {
      await this.vectorService.upsertBlock(block as Block)
    }

    return block as any as Block
  }

  async deleteBlock(id: string): Promise<void> {
    // 1. Delete from vector index
    await this.vectorService.deleteBlock(id)

    // 2. Delete from database (cascades to children)
    await db.block.delete({
      where: { id }
    })
  }

  async getBlock(id: string): Promise<Block | null> {
    const block = await db.block.findUnique({
      where: { id },
      include: {
        children: true,
        parent: true,
        template: true
      }
    })

    return block as any as Block | null
  }

  async getBlocksByUser(userId: string, options?: {
    type?: string
    category?: string
    limit?: number
    offset?: number
  }): Promise<Block[]> {
    const where: any = { userId }
    
    if (options?.type) {
      where.type = options.type
    }
    
    if (options?.category) {
      where.metadata = {
        path: ['category'],
        equals: options.category
      }
    }

    const blocks = await db.block.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
      include: {
        children: true,
        parent: true,
        template: true
      }
    })

    return blocks as any as Block[]
  }

  async getBlocksByTemplate(templateId: string): Promise<Block[]> {
    const blocks = await db.block.findMany({
      where: { templateId },
      orderBy: { createdAt: 'desc' },
      include: {
        children: true,
        parent: true,
        template: true
      }
    })

    return blocks as any as Block[]
  }

  async searchBlocks(query: string, userId: string, options?: {
    type?: string
    category?: string
    limit?: number
  }): Promise<Block[]> {
    // 1. Use vector search for semantic search
    const vectorResults = await this.vectorService.search(query, {
      userId,
      limit: options?.limit || 10
    })

    // 2. Get full block data from database
    const blockIds = vectorResults.map(r => r.id)
    if (blockIds.length === 0) return []

    const blocks = await db.block.findMany({
      where: {
        id: { in: blockIds },
        ...(options?.type && { type: options.type }),
        ...(options?.category && {
          metadata: {
            path: ['category'],
            equals: options.category
          }
        })
      },
      include: {
        children: true,
        parent: true,
        template: true
      }
    })

    // 3. Sort by relevance score from vector search
    const sortedBlocks = blocks.sort((a, b) => {
      const scoreA = vectorResults.find(r => r.id === a.id)?.score || 0
      const scoreB = vectorResults.find(r => r.id === b.id)?.score || 0
      return scoreB - scoreA
    })

    return sortedBlocks as any as Block[]
  }

  async getBlockChildren(parentId: string): Promise<Block[]> {
    const blocks = await db.block.findMany({
      where: { parentId },
      orderBy: { createdAt: 'asc' },
      include: {
        children: true,
        template: true
      }
    })

    return blocks as any as Block[]
  }

  async updateBlockMetadata(id: string, metadata: Partial<BlockMetadata>): Promise<Block> {
    const block = await db.block.update({
      where: { id },
      data: {
        metadata: {
          ...metadata
        },
        updatedAt: new Date()
      }
    })

    return block as any as Block
  }

  async getTodaysTasks(userId: string): Promise<Block[]> {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // 简化实现：获取所有todo类型的blocks，在应用层过滤
    const blocks = await db.block.findMany({
      where: {
        userId,
        type: 'todo'
      },
      orderBy: {
        createdAt: 'asc'
      },
      include: {
        template: true
      }
    })

    // 在应用层过滤今日任务
    const todayTasks = blocks.filter(block => {
      const metadata = block.metadata as any
      if (metadata?.scheduledAt) {
        const scheduledAt = new Date(metadata.scheduledAt)
        return scheduledAt >= startOfDay && scheduledAt < endOfDay
      }
      if (metadata?.dueDate) {
        const dueDate = new Date(metadata.dueDate)
        return dueDate >= startOfDay && dueDate < endOfDay
      }
      return false
    })

    return todayTasks as any as Block[]
  }

  async getBlockStats(userId: string): Promise<{
    totalBlocks: number
    blocksByType: Record<string, number>
    completedTodos: number
    totalTodos: number
  }> {
    const totalBlocks = await db.block.count({
      where: { userId }
    })

    const blocksByType = await db.block.groupBy({
      by: ['type'],
      where: { userId },
      _count: {
        id: true
      }
    })

    const todos = await db.block.findMany({
      where: {
        userId,
        type: 'todo'
      },
      select: {
        content: true
      }
    })

    const completedTodos = todos.filter(
      todo => (todo.content as any)?.checked === true
    ).length

    return {
      totalBlocks,
      blocksByType: blocksByType.reduce((acc, item) => {
        acc[item.type] = item._count.id
        return acc
      }, {} as Record<string, number>),
      completedTodos,
      totalTodos: todos.length
    }
  }
}