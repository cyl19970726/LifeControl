import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { BlockService } from '../services/block-service'
import { VectorService } from '../rag/vector-service'
import { EmbeddingService } from '../rag/embedding-service'
import { formatDateForSSR } from '../utils/time'
import { FILL_SUGGESTION_PROMPT, CONTENT_EXTRACTION_PROMPT } from './prompts'

export interface FillResult {
  action: 'create' | 'update' | 'append'
  targetBlockId?: string
  newBlock?: any
  updatedContent?: any
  confidence: number
  reasoning: string
}

export interface ContentAnalysis {
  intent: string
  category: string
  priority?: 'high' | 'medium' | 'low'
  timeInfo?: {
    scheduledAt?: Date
    dueDate?: Date
    isAllDay?: boolean
  }
  extractedContent: any
  keywords: string[]
  entities: string[]
}

export class AutoFillEngine {
  private blockService: BlockService
  private model = openai('gpt-4-turbo-preview')

  constructor() {
    const embeddingService = new EmbeddingService()
    const vectorService = new VectorService(embeddingService)
    this.blockService = new BlockService(vectorService)
  }

  async analyzeAndFill(
    userInput: string,
    userId: string,
    context?: any[]
  ): Promise<FillResult> {
    // 1. 分析用户输入内容
    const analysis = await this.analyzeUserInput(userInput)
    
    // 2. 搜索相关的现有块
    const relevantBlocks = await this.blockService.searchBlocks(
      userInput, 
      userId, 
      { limit: 10 }
    )

    // 3. 确定填充策略
    const strategy = await this.determineFillStrategy(
      analysis,
      relevantBlocks,
      userInput
    )

    // 4. 执行填充操作
    const result = await this.executeFillStrategy(strategy, analysis, userId)

    return result
  }

  private async analyzeUserInput(userInput: string): Promise<ContentAnalysis> {
    try {
      const response = await generateText({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are a content analyzer. Analyze the user input and extract structured information.
            
            Return a JSON object with:
            - intent: The user's intent (create_task, update_project, add_note, schedule_event, etc.)
            - category: Content category (work, personal, fitness, project, etc.)
            - priority: Priority level if mentioned (high, medium, low)
            - timeInfo: Any time-related information
            - extractedContent: The main content or description
            - keywords: Important keywords
            - entities: Named entities (people, places, things)
            
            Be specific and accurate in your analysis.`
          },
          {
            role: 'user',
            content: userInput
          }
        ]
      })

      const analysis = JSON.parse(response.text)
      
      // Process time information
      if (analysis.timeInfo) {
        analysis.timeInfo = this.parseTimeInfo(analysis.timeInfo)
      }

      return analysis
    } catch (error) {
      console.error('Error analyzing user input:', error)
      
      // Fallback analysis
      return {
        intent: 'general',
        category: 'general',
        extractedContent: userInput,
        keywords: userInput.split(' ').filter(word => word.length > 3),
        entities: []
      }
    }
  }

  private async determineFillStrategy(
    analysis: ContentAnalysis,
    relevantBlocks: any[],
    userInput: string
  ): Promise<{
    action: 'create' | 'update' | 'append'
    targetBlockId?: string
    confidence: number
    reasoning: string
  }> {
    // 如果没有相关块，创建新的
    if (relevantBlocks.length === 0) {
      return {
        action: 'create',
        confidence: 0.9,
        reasoning: 'No relevant blocks found, creating new block'
      }
    }

    // 使用 AI 来决定最佳策略
    try {
      const prompt = FILL_SUGGESTION_PROMPT
        .replace('{{input}}', userInput)
        .replace('{{blocks}}', JSON.stringify(relevantBlocks.map(block => ({
          id: block.id,
          type: block.type,
          category: (block.metadata as any)?.category,
          content: this.summarizeBlockContent(block.content),
          lastUpdated: block.updatedAt
        }))))

      const response = await generateText({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are a content organization assistant. Based on the user input and available blocks, suggest the best action.
            
            Return a JSON object with:
            - action: "create", "update", or "append"
            - targetBlockId: The ID of the block to update/append to (if applicable)
            - confidence: Confidence score (0-1)
            - reasoning: Explanation of the decision
            
            Consider:
            - Content relevance and similarity
            - Block type compatibility
            - Recency of updates
            - User intent`
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      return JSON.parse(response.text)
    } catch (error) {
      console.error('Error determining fill strategy:', error)
      
      // 默认策略：选择最相关的块进行更新
      const bestMatch = relevantBlocks[0]
      return {
        action: 'update',
        targetBlockId: bestMatch.id,
        confidence: 0.6,
        reasoning: 'Fallback: Selected most relevant block for update'
      }
    }
  }

  private async executeFillStrategy(
    strategy: any,
    analysis: ContentAnalysis,
    userId: string
  ): Promise<FillResult> {
    try {
      switch (strategy.action) {
        case 'create':
          return await this.createNewBlock(analysis, userId)
        
        case 'update':
          return await this.updateExistingBlock(
            strategy.targetBlockId,
            analysis,
            userId
          )
        
        case 'append':
          return await this.appendToBlock(
            strategy.targetBlockId,
            analysis,
            userId
          )
        
        default:
          throw new Error(`Unknown strategy action: ${strategy.action}`)
      }
    } catch (error) {
      console.error('Error executing fill strategy:', error)
      
      // 失败时创建新块
      return await this.createNewBlock(analysis, userId)
    }
  }

  private async createNewBlock(
    analysis: ContentAnalysis,
    userId: string
  ): Promise<FillResult> {
    const blockType = this.determineBlockType(analysis)
    const content = this.generateBlockContent(analysis, blockType)
    
    const newBlock = await this.blockService.createBlock({
      type: blockType,
      content,
      metadata: {
        category: analysis.category,
        priority: analysis.priority,
        tags: analysis.keywords,
        scheduledAt: analysis.timeInfo?.scheduledAt,
        dueDate: analysis.timeInfo?.dueDate,
        aiGenerated: true
      },
      userId
    })

    return {
      action: 'create',
      newBlock,
      confidence: 0.85,
      reasoning: `Created new ${blockType} block for ${analysis.intent}`
    }
  }

  private async updateExistingBlock(
    blockId: string,
    analysis: ContentAnalysis,
    userId: string
  ): Promise<FillResult> {
    const existingBlock = await this.blockService.getBlock(blockId)
    if (!existingBlock) {
      throw new Error('Target block not found')
    }

    const updatedContent = this.mergeContent(
      existingBlock.content,
      analysis,
      existingBlock.type
    )

    const updatedBlock = await this.blockService.updateBlock(blockId, {
      content: updatedContent,
      metadata: {
        ...existingBlock.metadata,
        ...(analysis.timeInfo?.scheduledAt && { scheduledAt: analysis.timeInfo.scheduledAt }),
        ...(analysis.timeInfo?.dueDate && { dueDate: analysis.timeInfo.dueDate }),
        ...(analysis.priority && { priority: analysis.priority })
      }
    })

    return {
      action: 'update',
      targetBlockId: blockId,
      updatedContent: updatedContent,
      confidence: 0.8,
      reasoning: `Updated existing ${existingBlock.type} block with new information`
    }
  }

  private async appendToBlock(
    blockId: string,
    analysis: ContentAnalysis,
    userId: string
  ): Promise<FillResult> {
    const existingBlock = await this.blockService.getBlock(blockId)
    if (!existingBlock) {
      throw new Error('Target block not found')
    }

    const appendedContent = this.appendContent(
      existingBlock.content,
      analysis,
      existingBlock.type
    )

    const updatedBlock = await this.blockService.updateBlock(blockId, {
      content: appendedContent
    })

    return {
      action: 'append',
      targetBlockId: blockId,
      updatedContent: appendedContent,
      confidence: 0.75,
      reasoning: `Appended new information to existing ${existingBlock.type} block`
    }
  }

  private determineBlockType(analysis: ContentAnalysis): 'text' | 'todo' | 'heading' | 'table' | 'callout' {
    const intent = analysis.intent.toLowerCase()
    
    if (intent.includes('task') || intent.includes('todo') || intent.includes('reminder')) {
      return 'todo'
    }
    
    if (intent.includes('heading') || intent.includes('title') || intent.includes('section')) {
      return 'heading'
    }
    
    if (intent.includes('table') || intent.includes('data') || intent.includes('comparison')) {
      return 'table'
    }
    
    if (intent.includes('warning') || intent.includes('alert') || intent.includes('important')) {
      return 'callout'
    }
    
    return 'text'
  }

  private generateBlockContent(analysis: ContentAnalysis, blockType: string): any {
    switch (blockType) {
      case 'text':
        return {
          text: analysis.extractedContent
        }
      
      case 'todo':
        return {
          text: analysis.extractedContent,
          checked: false,
          priority: analysis.priority || 'medium'
        }
      
      case 'heading':
        return {
          level: 2,
          text: analysis.extractedContent
        }
      
      case 'table':
        return {
          headers: ['Item', 'Details'],
          rows: [[analysis.extractedContent, '']]
        }
      
      case 'callout':
        return {
          type: analysis.priority === 'high' ? 'warning' : 'info',
          text: analysis.extractedContent
        }
      
      default:
        return {
          text: analysis.extractedContent
        }
    }
  }

  private mergeContent(existingContent: any, analysis: ContentAnalysis, blockType: string): any {
    switch (blockType) {
      case 'text':
        return {
          ...existingContent,
          text: `${existingContent.text}\n\n${analysis.extractedContent}`
        }
      
      case 'todo':
        // 对于待办事项，如果是更新，可能是改变状态或描述
        return {
          ...existingContent,
          text: analysis.extractedContent,
          ...(analysis.priority && { priority: analysis.priority })
        }
      
      case 'table':
        // 对于表格，添加新行
        return {
          ...existingContent,
          rows: [
            ...existingContent.rows,
            [analysis.extractedContent, '']
          ]
        }
      
      default:
        return existingContent
    }
  }

  private appendContent(existingContent: any, analysis: ContentAnalysis, blockType: string): any {
    switch (blockType) {
      case 'text':
        return {
          ...existingContent,
          text: `${existingContent.text}\n\n• ${analysis.extractedContent}`
        }
      
      case 'table':
        return {
          ...existingContent,
          rows: [
            ...existingContent.rows,
            [analysis.extractedContent, formatDateForSSR(new Date())]
          ]
        }
      
      default:
        return this.mergeContent(existingContent, analysis, blockType)
    }
  }

  private parseTimeInfo(timeInfo: any): any {
    if (!timeInfo) return undefined
    
    const result: any = {}
    
    if (timeInfo.scheduledAt) {
      result.scheduledAt = new Date(timeInfo.scheduledAt)
    }
    
    if (timeInfo.dueDate) {
      result.dueDate = new Date(timeInfo.dueDate)
    }
    
    if (timeInfo.isAllDay !== undefined) {
      result.isAllDay = timeInfo.isAllDay
    }
    
    return result
  }

  private summarizeBlockContent(content: any): string {
    if (typeof content === 'string') {
      return content.substring(0, 100) + '...'
    }
    
    if (content.text) {
      return content.text.substring(0, 100) + '...'
    }
    
    if (content.headers && content.rows) {
      return `Table with ${content.headers.length} columns and ${content.rows.length} rows`
    }
    
    return 'Content summary not available'
  }

  // 公共方法：获取填充建议
  async getSuggestions(userInput: string, userId: string): Promise<string[]> {
    const analysis = await this.analyzeUserInput(userInput)
    const relevantBlocks = await this.blockService.searchBlocks(userInput, userId, { limit: 5 })
    
    const suggestions = []
    
    // 基于意图的建议
    if (analysis.intent.includes('task')) {
      suggestions.push('Create a new task')
      suggestions.push('Add to existing project')
    }
    
    if (analysis.intent.includes('project')) {
      suggestions.push('Create new project')
      suggestions.push('Update existing project')
    }
    
    // 基于现有块的建议
    if (relevantBlocks.length > 0) {
      const mostRelevant = relevantBlocks[0]
      suggestions.push(`Update "${this.summarizeBlockContent(mostRelevant.content)}"`)
    }
    
    return suggestions
  }
}