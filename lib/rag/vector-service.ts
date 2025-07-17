import { db } from '../db/client'
import { Block } from '../types/block'
import { EmbeddingService } from './embedding-service'

export interface VectorSearchResult {
  id: string
  score: number
  content: string
  metadata: any
}

export interface VectorSearchOptions {
  userId: string
  limit?: number
  threshold?: number
  type?: string
  category?: string
}

export class VectorService {
  constructor(
    private embeddingService: EmbeddingService
  ) {}

  async upsertBlock(block: Block): Promise<void> {
    // 1. Extract text content from block
    const textContent = this.extractTextContent(block.content)
    
    // 2. Generate embedding
    const embedding = await this.embeddingService.generateEmbedding(textContent)
    
    // 3. Store in vector index
    await db.vectorIndex.upsert({
      where: { blockId: block.id },
      create: {
        blockId: block.id,
        userId: block.userId,
        content: textContent,
        embedding: JSON.stringify(embedding),
        metadata: JSON.stringify({
          type: block.type,
          category: (block.metadata as any)?.category || 'general',
          tags: (block.metadata as any)?.tags || [],
          createdAt: block.createdAt,
          templateId: block.templateId
        })
      },
      update: {
        content: textContent,
        embedding: JSON.stringify(embedding),
        metadata: JSON.stringify({
          type: block.type,
          category: (block.metadata as any)?.category || 'general',
          tags: (block.metadata as any)?.tags || [],
          createdAt: block.createdAt,
          templateId: block.templateId
        }),
        updatedAt: new Date()
      }
    })
  }

  async deleteBlock(blockId: string): Promise<void> {
    await db.vectorIndex.delete({
      where: { blockId }
    })
  }

  async search(query: string, options: VectorSearchOptions): Promise<VectorSearchResult[]> {
    // 1. Generate query embedding
    const queryEmbedding = await this.embeddingService.generateEmbedding(query)
    
    // 2. Build filter conditions
    const whereConditions: any = {
      userId: options.userId
    }
    
    if (options.type) {
      whereConditions.metadata = {
        path: ['type'],
        equals: options.type
      }
    }
    
    if (options.category) {
      whereConditions.metadata = {
        path: ['category'],
        equals: options.category
      }
    }
    
    // 3. Get candidate vectors from database
    const vectors = await db.vectorIndex.findMany({
      where: whereConditions,
      take: options.limit || 50
    })
    
    // 4. Calculate similarity scores
    const results = vectors
      .map(vector => {
        const vectorEmbedding = JSON.parse(vector.embedding || '[]')
        const similarity = this.calculateCosineSimilarity(queryEmbedding, vectorEmbedding)
        
        return {
          id: vector.blockId,
          score: similarity,
          content: vector.content,
          metadata: vector.metadata
        }
      })
      .filter(result => result.score > (options.threshold || 0.5))
      .sort((a, b) => b.score - a.score)
      .slice(0, options.limit || 10)
    
    return results
  }

  async searchSimilar(blockId: string, options: VectorSearchOptions): Promise<VectorSearchResult[]> {
    // 1. Get the reference block's embedding
    const referenceVector = await db.vectorIndex.findUnique({
      where: { blockId }
    })
    
    if (!referenceVector) {
      throw new Error('Block not found in vector index')
    }
    
    const referenceEmbedding = JSON.parse(referenceVector.embedding || '[]')
    
    // 2. Find similar blocks
    const vectors = await db.vectorIndex.findMany({
      where: {
        userId: options.userId,
        blockId: { not: blockId } // Exclude the reference block
      },
      take: options.limit || 50
    })
    
    // 3. Calculate similarity scores
    const results = vectors
      .map(vector => {
        const vectorEmbedding = JSON.parse(vector.embedding || '[]')
        const similarity = this.calculateCosineSimilarity(referenceEmbedding, vectorEmbedding)
        
        return {
          id: vector.blockId,
          score: similarity,
          content: vector.content,
          metadata: vector.metadata
        }
      })
      .filter(result => result.score > (options.threshold || 0.6))
      .sort((a, b) => b.score - a.score)
      .slice(0, options.limit || 5)
    
    return results
  }

  async hybridSearch(query: string, options: VectorSearchOptions): Promise<VectorSearchResult[]> {
    // 1. Vector search
    const vectorResults = await this.search(query, options)
    
    // 2. Keyword search
    const keywordResults = await this.keywordSearch(query, options)
    
    // 3. Combine and re-rank results
    const combinedResults = this.combineSearchResults(vectorResults, keywordResults)
    
    return combinedResults.slice(0, options.limit || 10)
  }

  private async keywordSearch(query: string, options: VectorSearchOptions): Promise<VectorSearchResult[]> {
    const whereConditions: any = {
      userId: options.userId,
      content: {
        contains: query,
        mode: 'insensitive'
      }
    }
    
    if (options.type) {
      whereConditions.metadata = {
        path: ['type'],
        equals: options.type
      }
    }
    
    const vectors = await db.vectorIndex.findMany({
      where: whereConditions,
      take: options.limit || 20
    })
    
    return vectors.map(vector => ({
      id: vector.blockId,
      score: this.calculateKeywordScore(query, vector.content),
      content: vector.content,
      metadata: vector.metadata
    }))
  }

  private combineSearchResults(
    vectorResults: VectorSearchResult[],
    keywordResults: VectorSearchResult[]
  ): VectorSearchResult[] {
    const resultMap = new Map<string, VectorSearchResult>()
    
    // Add vector results with higher weight
    vectorResults.forEach(result => {
      resultMap.set(result.id, {
        ...result,
        score: result.score * 0.7 // Weight vector search
      })
    })
    
    // Add keyword results, combining scores if already exists
    keywordResults.forEach(result => {
      const existing = resultMap.get(result.id)
      if (existing) {
        existing.score = existing.score + (result.score * 0.3) // Weight keyword search
      } else {
        resultMap.set(result.id, {
          ...result,
          score: result.score * 0.3
        })
      }
    })
    
    return Array.from(resultMap.values())
      .sort((a, b) => b.score - a.score)
  }

  private extractTextContent(content: any): string {
    if (typeof content === 'string') {
      return content
    }
    
    if (typeof content === 'object' && content !== null) {
      if (content.text) {
        return content.text
      }
      
      if (content.type === 'table' && content.rows) {
        return content.rows.flat().join(' ')
      }
      
      if (content.title && content.description) {
        // Handle page blocks
        return `${content.title} ${content.description || ''}`
      }
      
      // Extract all string values from object
      const extractStrings = (obj: any): string[] => {
        const strings: string[] = []
        for (const value of Object.values(obj)) {
          if (typeof value === 'string') {
            strings.push(value)
          } else if (typeof value === 'object' && value !== null) {
            strings.push(...extractStrings(value))
          }
        }
        return strings
      }
      
      return extractStrings(content).join(' ')
    }
    
    return ''
  }

  private calculateCosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      return 0
    }
    
    let dotProduct = 0
    let normA = 0
    let normB = 0
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }
    
    if (normA === 0 || normB === 0) {
      return 0
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  private calculateKeywordScore(query: string, content: string): number {
    const queryWords = query.toLowerCase().split(/\s+/)
    const contentWords = content.toLowerCase().split(/\s+/)
    
    let matches = 0
    queryWords.forEach(word => {
      if (contentWords.includes(word)) {
        matches++
      }
    })
    
    return matches / queryWords.length
  }
}