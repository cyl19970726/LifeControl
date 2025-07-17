import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { TemplateService } from '../services/template-service'
import { BlockService } from '../services/block-service'
import { VectorService } from '../rag/vector-service'
import { EmbeddingService } from '../rag/embedding-service'

export interface TemplateInstantiationResult {
  templateId: string
  templateName: string
  createdBlocks: any[]
  success: boolean
  message: string
}

export interface TemplateCustomization {
  projectName?: string
  description?: string
  dueDate?: Date
  priority?: 'high' | 'medium' | 'low'
  category?: string
  customFields?: Record<string, any>
}

export class TemplateEngine {
  private templateService: TemplateService
  private blockService: BlockService
  private model = openai('gpt-4-turbo-preview')

  constructor() {
    this.templateService = new TemplateService()
    const embeddingService = new EmbeddingService()
    const vectorService = new VectorService(embeddingService)
    this.blockService = new BlockService(vectorService)
  }

  async instantiateTemplate(
    templateId: string,
    userId: string,
    userInput: string,
    customization?: TemplateCustomization
  ): Promise<TemplateInstantiationResult> {
    try {
      // 1. 获取模板
      const template = await this.templateService.getTemplate(templateId)
      if (!template) {
        throw new Error('Template not found')
      }

      // 2. 分析用户输入以提取相关信息
      const extractedData = await this.extractDataFromInput(userInput, template)

      // 3. 合并自定义数据
      const mergedData = {
        ...extractedData,
        ...customization
      }

      // 4. 实例化模板
      const result = await this.templateService.createFromTemplate(
        templateId,
        userId,
        mergedData
      )

      // 5. 使用AI增强内容
      const enhancedBlocks = await this.enhanceBlocksWithAI(
        result.blocks,
        userInput,
        mergedData
      )

      return {
        templateId,
        templateName: result.templateName,
        createdBlocks: enhancedBlocks,
        success: true,
        message: `Successfully created ${result.templateName} with ${enhancedBlocks.length} blocks`
      }
    } catch (error) {
      return {
        templateId,
        templateName: 'Unknown',
        createdBlocks: [],
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async suggestTemplate(
    userInput: string,
    userId: string
  ): Promise<{
    suggestedTemplate: any | null
    confidence: number
    reasoning: string
  }> {
    try {
      // 获取用户的模板
      const templates = await this.templateService.getTemplatesByUser(userId, {
        limit: 20
      })

      if (templates.length === 0) {
        return {
          suggestedTemplate: null,
          confidence: 0,
          reasoning: 'No templates available'
        }
      }

      // 使用AI分析最适合的模板
      const response = await generateText({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are a template suggestion assistant. Based on the user input, suggest the most appropriate template.
            
            Available templates:
            ${templates.map(t => `- ${t.name} (${t.category}): ${t.description}`).join('\n')}
            
            Return a JSON object with:
            - templateId: The ID of the suggested template
            - confidence: Confidence score (0-1)
            - reasoning: Why this template was chosen
            
            If no template is suitable, return null for templateId.`
          },
          {
            role: 'user',
            content: userInput
          }
        ]
      })

      const suggestion = JSON.parse(response.text)
      
      if (suggestion.templateId) {
        const suggestedTemplate = templates.find(t => t.id === suggestion.templateId)
        return {
          suggestedTemplate,
          confidence: suggestion.confidence,
          reasoning: suggestion.reasoning
        }
      }

      return {
        suggestedTemplate: null,
        confidence: 0,
        reasoning: suggestion.reasoning || 'No suitable template found'
      }
    } catch (error) {
      console.error('Error suggesting template:', error)
      return {
        suggestedTemplate: null,
        confidence: 0,
        reasoning: 'Error analyzing templates'
      }
    }
  }

  async createCustomTemplate(
    userInput: string,
    userId: string,
    category: 'project' | 'review'
  ): Promise<any> {
    try {
      // 使用AI生成模板结构
      const response = await generateText({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are a template creation assistant. Based on the user's requirements, create a template structure.
            
            Return a JSON object with:
            - name: Template name
            - description: Template description
            - structure: Object with blocks array
            - Each block should have: type, content, position, required, customizable, aiPrompt
            
            Block types available: text, heading, table, todo, callout
            Categories: ${category}
            
            Make the template practical and well-structured.`
          },
          {
            role: 'user',
            content: `Create a ${category} template for: ${userInput}`
          }
        ]
      })

      const templateData = JSON.parse(response.text)
      
      // 创建模板
      const template = await this.templateService.createTemplate({
        name: templateData.name,
        description: templateData.description,
        category,
        tags: [], // 添加必需的 tags 字段
        structure: templateData.structure,
        userId,
        isPublic: false
      })

      return template
    } catch (error) {
      console.error('Error creating custom template:', error)
      throw new Error('Failed to create custom template')
    }
  }

  private async extractDataFromInput(
    userInput: string,
    template: any
  ): Promise<Record<string, any>> {
    try {
      const response = await generateText({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `Extract relevant information from user input for template instantiation.
            
            Template: ${template.name}
            Category: ${template.category}
            
            Extract information that would be useful for filling the template blocks.
            Return a JSON object with extracted data.
            
            Common fields to extract:
            - projectName
            - description
            - goals
            - timeline
            - priority
            - category
            - participants
            - resources
            
            Only extract information that is actually mentioned or can be reasonably inferred.`
          },
          {
            role: 'user',
            content: userInput
          }
        ]
      })

      return JSON.parse(response.text)
    } catch (error) {
      console.error('Error extracting data from input:', error)
      return {}
    }
  }

  private async enhanceBlocksWithAI(
    blocks: any[],
    userInput: string,
    data: Record<string, any>
  ): Promise<any[]> {
    const enhancedBlocks = []

    for (const block of blocks) {
      try {
        // 找到模板块定义中的AI提示
        const aiPrompt = (block as any).aiPrompt
        
        if (aiPrompt) {
          // 使用AI增强内容
          const enhancedContent = await this.enhanceBlockContent(
            block,
            aiPrompt,
            userInput,
            data
          )
          
          // 更新块内容
          const updatedBlock = await this.blockService.updateBlock(block.id, {
            content: enhancedContent
          })
          
          enhancedBlocks.push(updatedBlock)
        } else {
          enhancedBlocks.push(block)
        }
      } catch (error) {
        console.error('Error enhancing block:', error)
        enhancedBlocks.push(block)
      }
    }

    return enhancedBlocks
  }

  private async enhanceBlockContent(
    block: any,
    aiPrompt: string,
    userInput: string,
    data: Record<string, any>
  ): Promise<any> {
    try {
      const response = await generateText({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are a content generation assistant. ${aiPrompt}
            
            Block type: ${block.type}
            Current content: ${JSON.stringify(block.content)}
            
            Available data: ${JSON.stringify(data)}
            
            Generate appropriate content for this block based on the prompt and available data.
            Return the content in the correct format for the block type.`
          },
          {
            role: 'user',
            content: userInput
          }
        ]
      })

      // 解析并格式化内容
      const newContent = JSON.parse(response.text)
      
      // 确保内容格式正确
      return this.validateAndFormatContent(newContent, block.type)
    } catch (error) {
      console.error('Error enhancing block content:', error)
      return block.content
    }
  }

  private validateAndFormatContent(content: any, blockType: string): any {
    switch (blockType) {
      case 'text':
        return {
          text: typeof content === 'string' ? content : content.text || ''
        }
      
      case 'heading':
        return {
          level: content.level || 2,
          text: content.text || ''
        }
      
      case 'todo':
        return {
          text: content.text || '',
          checked: content.checked || false,
          priority: content.priority || 'medium'
        }
      
      case 'table':
        return {
          headers: content.headers || ['Item', 'Value'],
          rows: content.rows || []
        }
      
      case 'callout':
        return {
          type: content.type || 'info',
          text: content.text || ''
        }
      
      default:
        return content
    }
  }

  // 获取模板使用统计
  async getTemplateStats(userId: string): Promise<any> {
    const templates = await this.templateService.getTemplatesByUser(userId)
    
    const stats = {
      totalTemplates: templates.length,
      byCategory: {} as Record<string, number>,
      mostUsed: null as any,
      recentlyCreated: templates
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5)
    }

    // 按类别统计
    templates.forEach(template => {
      stats.byCategory[template.category] = (stats.byCategory[template.category] || 0) + 1
    })

    // 找出最常用的模板
    const templateUsage = templates.map(template => ({
      ...template,
      usageCount: (template.metadata as any)?.usageCount || 0
    }))
    
    stats.mostUsed = templateUsage.sort((a, b) => b.usageCount - a.usageCount)[0]

    return stats
  }
}