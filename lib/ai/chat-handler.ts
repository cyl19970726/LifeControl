import { generateText, streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { toolRegistry } from '../tools/tool-registry'
import { BlockService } from '../services/block-service'
import { VectorService } from '../rag/vector-service'
import { EmbeddingService } from '../rag/embedding-service'
import { SYSTEM_PROMPT, CONTEXT_PROMPT } from './prompts'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  content: string
  toolCalls?: any[]
  blocks?: any[]
}

export class ChatHandler {
  private blockService: BlockService
  private model = openai('gpt-4-turbo-preview')

  constructor() {
    const embeddingService = new EmbeddingService()
    const vectorService = new VectorService(embeddingService)
    this.blockService = new BlockService(vectorService)
  }

  async processMessage(
    message: string,
    userId: string,
    previousMessages: ChatMessage[] = []
  ): Promise<ChatResponse> {
    // 1. Search for relevant blocks
    const relevantBlocks = await this.searchRelevantContent(message, userId)
    
    // 2. Get today's tasks for context
    const todaysTasks = await this.blockService.getTodaysTasks(userId)
    
    // 3. Build context
    const context = this.buildContext(relevantBlocks, todaysTasks, userId)
    
    // 4. Process with LLM
    const response = await generateText({
      model: this.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'system', content: context },
        ...previousMessages,
        { role: 'user', content: message }
      ],
      tools: toolRegistry,
      toolChoice: 'auto'
    })

    // 5. Process tool results
    const processedResponse = await this.processToolResults(response, userId)

    return {
      content: processedResponse.text,
      toolCalls: processedResponse.toolCalls,
      blocks: processedResponse.blocks
    }
  }

  async streamMessage(
    message: string,
    userId: string,
    previousMessages: ChatMessage[] = []
  ) {
    // 1. Search for relevant blocks
    const relevantBlocks = await this.searchRelevantContent(message, userId)
    
    // 2. Get today's tasks for context
    const todaysTasks = await this.blockService.getTodaysTasks(userId)
    
    // 3. Build context
    const context = this.buildContext(relevantBlocks, todaysTasks, userId)
    
    // 4. Stream response with LLM
    const result = await streamText({
      model: this.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'system', content: context },
        ...previousMessages,
        { role: 'user', content: message }
      ],
      tools: toolRegistry,
      toolChoice: 'auto'
    })

    return result
  }

  private async searchRelevantContent(query: string, userId: string): Promise<any[]> {
    try {
      const results = await this.blockService.searchBlocks(query, userId, {
        limit: 10
      })
      return results
    } catch (error) {
      console.error('Error searching relevant content:', error)
      return []
    }
  }

  private buildContext(relevantBlocks: any[], todaysTasks: any[], userId: string): string {
    const now = new Date()
    
    // Format relevant blocks
    const recentBlocksText = relevantBlocks.length > 0
      ? relevantBlocks.map(block => 
          `- ${block.type}: ${this.extractBlockSummary(block)} (ID: ${block.id})`
        ).join('\n')
      : 'No relevant blocks found'

    // Format today's tasks
    const todaysTasksText = todaysTasks.length > 0
      ? todaysTasks.map(task => {
          const content = task.content as any
          const metadata = task.metadata as any
          const scheduledTime = metadata?.scheduledAt 
            ? new Date(metadata.scheduledAt).toLocaleTimeString() 
            : 'Not scheduled'
          return `- ${content.text} (${content.checked ? 'Completed' : 'Pending'}) - ${scheduledTime}`
        }).join('\n')
      : 'No tasks scheduled for today'

    return CONTEXT_PROMPT
      .replace('{{userId}}', userId)
      .replace('{{currentTime}}', now.toLocaleTimeString())
      .replace('{{currentDate}}', now.toLocaleDateString())
      .replace('{{recentBlocks}}', recentBlocksText)
      .replace('{{todaysTasks}}', todaysTasksText)
  }

  private extractBlockSummary(block: any): string {
    const content = block.content as any
    
    switch (block.type) {
      case 'text':
        return content.text?.substring(0, 100) + '...'
      case 'heading':
        return content.text
      case 'todo':
        return content.text
      case 'table':
        return `Table with ${content.headers?.length || 0} columns`
      case 'callout':
        return `${content.type}: ${content.text?.substring(0, 50)}...`
      default:
        return 'Unknown content'
    }
  }

  private async processToolResults(response: any, userId: string): Promise<any> {
    const blocks = []
    
    // Extract blocks created or updated by tools
    if (response.toolResults) {
      for (const result of response.toolResults) {
        if (result.block) {
          blocks.push(result.block)
        } else if (result.blocks) {
          blocks.push(...result.blocks)
        }
      }
    }

    return {
      text: response.text,
      toolCalls: response.toolCalls,
      blocks
    }
  }

  async generateSuggestions(userId: string): Promise<string[]> {
    const [todaysTasks, stats, upcomingTasks] = await Promise.all([
      this.blockService.getTodaysTasks(userId),
      this.blockService.getBlockStats(userId),
      this.blockService.getBlocksByUser(userId, { limit: 5 })
    ])

    const suggestions = []

    // Suggest based on today's tasks
    if (todaysTasks.length === 0) {
      suggestions.push("Plan today's tasks")
    } else if (todaysTasks.length > 5) {
      suggestions.push("Review and prioritize today's tasks")
    }

    // Suggest based on incomplete todos
    const incompleteTodos = stats.totalTodos - stats.completedTodos
    if (incompleteTodos > 10) {
      suggestions.push("Review and clean up incomplete tasks")
    }

    // Suggest daily review
    const now = new Date()
    if (now.getHours() >= 18) {
      suggestions.push("Write today's review")
    }

    // Suggest project creation
    if (stats.blocksByType['text'] > stats.blocksByType['todo']) {
      suggestions.push("Convert notes into actionable tasks")
    }

    return suggestions
  }
}