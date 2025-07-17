import { db } from '../db/client'
import { Template, CreateTemplate, UpdateTemplate, TemplateBlock } from '../types/template'
import { BlockService } from './block-service'
import { VectorService } from '../rag/vector-service'
import { EmbeddingService } from '../rag/embedding-service'

export class TemplateService {
  private blockService: BlockService

  constructor() {
    const embeddingService = new EmbeddingService()
    const vectorService = new VectorService(embeddingService)
    this.blockService = new BlockService(vectorService)
  }

  async createTemplate(data: CreateTemplate): Promise<Template> {
    const template = await db.template.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        icon: data.icon,
        tags: JSON.stringify(data.tags),
        structure: JSON.stringify(data.structure),
        metadata: JSON.stringify(data.metadata || {}),
        userId: data.userId,
        isPublic: data.isPublic || false
      }
    })

    return this.parseTemplate(template)
  }

  async getTemplate(id: string): Promise<Template | null> {
    const template = await db.template.findUnique({
      where: { id },
      include: {
        user: true,
        blocks: true
      }
    })

    if (!template) return null

    return this.parseTemplate(template)
  }

  async updateTemplate(id: string, updates: UpdateTemplate): Promise<Template> {
    const template = await db.template.update({
      where: { id },
      data: {
        ...updates,
        tags: updates.tags ? JSON.stringify(updates.tags) : undefined,
        structure: updates.structure ? JSON.stringify(updates.structure) : undefined,
        metadata: updates.metadata ? JSON.stringify(updates.metadata) : undefined,
        updatedAt: new Date()
      }
    })

    return this.parseTemplate(template)
  }

  async deleteTemplate(id: string): Promise<void> {
    await db.template.delete({
      where: { id }
    })
  }

  async getTemplatesByUser(userId: string, options?: {
    category?: string
    isPublic?: boolean
    limit?: number
  }): Promise<Template[]> {
    const where: any = {
      OR: [
        { userId },
        { isPublic: true }
      ]
    }

    if (options?.category) {
      where.category = options.category
    }

    if (options?.isPublic !== undefined) {
      where.isPublic = options.isPublic
    }

    const templates = await db.template.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
      include: {
        user: true,
        blocks: true
      }
    })

    return templates.map(template => this.parseTemplate(template))
  }

  async searchTemplates(query: string, options?: {
    userId?: string
    category?: string
    limit?: number
  }): Promise<Template[]> {
    const where: any = {
      OR: [
        { name: { contains: query } },
        { description: { contains: query } }
      ]
    }

    if (options?.userId) {
      where.OR.push({ userId: options.userId })
    }

    if (options?.category) {
      where.category = options.category
    }

    const templates = await db.template.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 20,
      include: {
        user: true,
        blocks: true
      }
    })

    return templates.map(template => this.parseTemplate(template))
  }

  async createFromTemplate(templateId: string, userId: string, customData?: Record<string, any>): Promise<{
    blocks: any[]
    templateName: string
  }> {
    const template = await this.getTemplate(templateId)
    if (!template) {
      throw new Error('Template not found')
    }

    const blocks = []
    const templateBlocks = template.structure.blocks

    // Sort blocks by position
    const sortedBlocks = templateBlocks.sort((a, b) => a.position - b.position)

    // Create blocks from template
    for (const templateBlock of sortedBlocks) {
      const blockData = {
        type: templateBlock.type,
        content: this.processTemplateContent(templateBlock.content, customData),
        metadata: {
          category: template.category,
          tags: template.tags,
          aiGenerated: true
        },
        templateId: template.id,
        userId
      }

      const block = await this.blockService.createBlock(blockData)
      blocks.push(block)
    }

    // Update template usage count
    await this.updateTemplateUsage(templateId)

    return {
      blocks,
      templateName: template.name
    }
  }

  private async updateTemplateUsage(templateId: string): Promise<void> {
    const template = await db.template.findUnique({
      where: { id: templateId }
    })

    if (template) {
      const metadata = JSON.parse(template.metadata || '{}')
      metadata.usageCount = (metadata.usageCount || 0) + 1
      metadata.lastUsed = new Date()

      await db.template.update({
        where: { id: templateId },
        data: {
          metadata: JSON.stringify(metadata)
        }
      })
    }
  }

  private processTemplateContent(content: any, customData?: Record<string, any>): any {
    if (typeof content === 'string') {
      return this.replaceTemplateVariables(content, customData)
    }

    if (typeof content === 'object' && content !== null) {
      const processedContent = { ...content }
      
      for (const [key, value] of Object.entries(processedContent)) {
        if (typeof value === 'string') {
          processedContent[key] = this.replaceTemplateVariables(value, customData)
        } else if (typeof value === 'object' && value !== null) {
          processedContent[key] = this.processTemplateContent(value, customData)
        }
      }

      return processedContent
    }

    return content
  }

  private replaceTemplateVariables(text: string, customData?: Record<string, any>): string {
    let result = text

    // Replace common variables
    result = result.replace(/\{\{date\}\}/g, new Date().toLocaleDateString())
    result = result.replace(/\{\{time\}\}/g, new Date().toLocaleTimeString())
    result = result.replace(/\{\{datetime\}\}/g, new Date().toLocaleString())

    // Replace custom variables
    if (customData) {
      for (const [key, value] of Object.entries(customData)) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
        result = result.replace(regex, String(value))
      }
    }

    return result
  }

  private parseTemplate(template: any): Template {
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      icon: template.icon,
      tags: template.tags ? JSON.parse(template.tags) : [],
      structure: JSON.parse(template.structure),
      metadata: JSON.parse(template.metadata || '{}'),
      userId: template.userId,
      isPublic: template.isPublic,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt
    }
  }

  // Predefined templates
  async createDefaultTemplates(userId: string): Promise<void> {
    // Basic Project Template
    await this.createTemplate({
      name: 'Basic Project Template',
      description: 'A basic template for project management',
      category: 'project',
      icon: '📋',
      tags: ['project', 'basic', 'management'],
      structure: {
        blocks: [
          {
            type: 'heading',
            content: { level: 1, text: 'Project Name' },
            position: 0,
            required: true,
            customizable: true,
            aiPrompt: 'Generate a project name based on user description'
          },
          {
            type: 'text',
            content: { text: 'Project description and objectives...' },
            position: 1,
            required: true,
            customizable: true,
            aiPrompt: 'Generate project description and main objectives'
          },
          {
            type: 'table',
            content: {
              headers: ['Property', 'Value'],
              rows: [
                ['Status', 'Active'],
                ['Priority', 'Medium'],
                ['Start Date', ''],
                ['Due Date', ''],
                ['Owner', '']
              ]
            },
            position: 2,
            required: true,
            customizable: true,
            aiPrompt: 'Fill in project basic information'
          },
          {
            type: 'heading',
            content: { level: 2, text: 'Tasks' },
            position: 3,
            required: false,
            customizable: true
          },
          {
            type: 'todo',
            content: { text: 'Project setup', checked: false },
            position: 4,
            required: false,
            customizable: true
          }
        ]
      },
      userId,
      isPublic: true
    })

    // Daily Review Template
    await this.createTemplate({
      name: 'Daily Review Template',
      description: 'Template for daily work review and reflection',
      category: 'review',
      icon: '📅',
      tags: ['review', 'daily', 'reflection'],
      structure: {
        blocks: [
          {
            type: 'heading',
            content: { level: 1, text: '{{date}} Daily Review' },
            position: 0,
            required: true,
            customizable: true,
            aiPrompt: 'Generate daily review title with current date'
          },
          {
            type: 'heading',
            content: { level: 2, text: 'Today\'s Accomplishments' },
            position: 1,
            required: true,
            customizable: false
          },
          {
            type: 'text',
            content: { text: 'What I accomplished today...' },
            position: 2,
            required: false,
            customizable: true,
            aiPrompt: 'Summarize user\'s accomplishments based on their input'
          },
          {
            type: 'heading',
            content: { level: 2, text: 'Challenges Faced' },
            position: 3,
            required: true,
            customizable: false
          },
          {
            type: 'text',
            content: { text: 'Challenges I encountered...' },
            position: 4,
            required: false,
            customizable: true,
            aiPrompt: 'Identify and summarize challenges from user input'
          },
          {
            type: 'heading',
            content: { level: 2, text: 'Tomorrow\'s Plan' },
            position: 5,
            required: true,
            customizable: false
          },
          {
            type: 'todo',
            content: { text: 'Important task for tomorrow', checked: false },
            position: 6,
            required: false,
            customizable: true,
            aiPrompt: 'Suggest tomorrow\'s tasks based on current progress'
          }
        ]
      },
      userId,
      isPublic: true
    })
  }
}