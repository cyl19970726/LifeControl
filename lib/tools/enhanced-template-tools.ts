import { tool } from 'ai'
import { z } from 'zod'
import { TemplateEngine } from '../ai/template-engine'

// Initialize template engine
const templateEngine = new TemplateEngine()

// Smart Template Instantiation Tool
export const smartTemplateInstantiationTool = tool({
  description: 'Intelligently instantiate a template with AI-enhanced content',
  parameters: z.object({
    templateId: z.string(),
    userId: z.string(),
    userInput: z.string(),
    customization: z.object({
      projectName: z.string().optional(),
      description: z.string().optional(),
      dueDate: z.string().optional(),
      priority: z.enum(['high', 'medium', 'low']).optional(),
      category: z.string().optional(),
      customFields: z.object({}).passthrough().optional()
    }).optional()
  }),
  execute: async (params) => {
    try {
      const customization = params.customization ? {
        ...params.customization,
        dueDate: params.customization.dueDate ? new Date(params.customization.dueDate) : undefined
      } : undefined

      const result = await templateEngine.instantiateTemplate(
        params.templateId,
        params.userId,
        params.userInput,
        customization
      )

      return {
        success: result.success,
        result,
        message: result.message
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to instantiate template'
      }
    }
  }
})

// Template Suggestion Tool
export const templateSuggestionTool = tool({
  description: 'Suggest the most appropriate template based on user input',
  parameters: z.object({
    userInput: z.string(),
    userId: z.string()
  }),
  execute: async (params) => {
    try {
      const suggestion = await templateEngine.suggestTemplate(
        params.userInput,
        params.userId
      )

      return {
        success: true,
        suggestion,
        message: suggestion.suggestedTemplate 
          ? `Suggested template: ${suggestion.suggestedTemplate.name}` 
          : 'No suitable template found'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to suggest template'
      }
    }
  }
})

// Custom Template Creation Tool
export const customTemplateCreationTool = tool({
  description: 'Create a custom template based on user requirements',
  parameters: z.object({
    userInput: z.string(),
    userId: z.string(),
    category: z.enum(['project', 'review']),
    name: z.string().optional(),
    description: z.string().optional()
  }),
  execute: async (params) => {
    try {
      const template = await templateEngine.createCustomTemplate(
        params.userInput,
        params.userId,
        params.category
      )

      return {
        success: true,
        template,
        message: `Created custom ${params.category} template: ${template.name}`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to create custom template'
      }
    }
  }
})

// Template Stats Tool
export const templateStatsTool = tool({
  description: 'Get statistics about user templates',
  parameters: z.object({
    userId: z.string()
  }),
  execute: async (params) => {
    try {
      const stats = await templateEngine.getTemplateStats(params.userId)

      return {
        success: true,
        stats,
        message: `Found ${stats.totalTemplates} templates`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to get template statistics'
      }
    }
  }
})

// Smart Project Creation Tool
export const smartProjectCreationTool = tool({
  description: 'Create a project intelligently using templates and AI',
  parameters: z.object({
    projectDescription: z.string(),
    userId: z.string(),
    dueDate: z.string().optional(),
    priority: z.enum(['high', 'medium', 'low']).default('medium'),
    category: z.string().default('general')
  }),
  execute: async (params) => {
    try {
      // 1. 首先尝试建议现有模板
      const suggestion = await templateEngine.suggestTemplate(
        params.projectDescription,
        params.userId
      )

      let result
      
      if (suggestion.suggestedTemplate && suggestion.confidence > 0.7) {
        // 使用建议的模板
        result = await templateEngine.instantiateTemplate(
          suggestion.suggestedTemplate.id,
          params.userId,
          params.projectDescription,
          {
            dueDate: params.dueDate ? new Date(params.dueDate) : undefined,
            priority: params.priority,
            category: params.category
          }
        )
      } else {
        // 创建自定义模板
        const customTemplate = await templateEngine.createCustomTemplate(
          params.projectDescription,
          params.userId,
          'project'
        )

        result = await templateEngine.instantiateTemplate(
          customTemplate.id,
          params.userId,
          params.projectDescription,
          {
            dueDate: params.dueDate ? new Date(params.dueDate) : undefined,
            priority: params.priority,
            category: params.category
          }
        )
      }

      return {
        success: result.success,
        project: result,
        usedTemplate: suggestion.suggestedTemplate?.name || 'Custom template',
        message: `Created project with ${result.createdBlocks.length} blocks`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to create smart project'
      }
    }
  }
})

// Smart Review Creation Tool
export const smartReviewCreationTool = tool({
  description: 'Create a review intelligently using templates and AI',
  parameters: z.object({
    reviewDescription: z.string(),
    userId: z.string(),
    reviewType: z.enum(['daily', 'weekly', 'monthly', 'project']).default('daily'),
    date: z.string().optional()
  }),
  execute: async (params) => {
    try {
      // 尝试建议现有模板
      const suggestion = await templateEngine.suggestTemplate(
        `${params.reviewType} review: ${params.reviewDescription}`,
        params.userId
      )

      let result
      
      if (suggestion.suggestedTemplate && suggestion.confidence > 0.7) {
        // 使用建议的模板
        result = await templateEngine.instantiateTemplate(
          suggestion.suggestedTemplate.id,
          params.userId,
          params.reviewDescription,
          {
            category: 'review',
            customFields: {
              reviewType: params.reviewType,
              reviewDate: params.date || new Date().toISOString()
            }
          }
        )
      } else {
        // 创建自定义模板
        const customTemplate = await templateEngine.createCustomTemplate(
          `${params.reviewType} review: ${params.reviewDescription}`,
          params.userId,
          'review'
        )

        result = await templateEngine.instantiateTemplate(
          customTemplate.id,
          params.userId,
          params.reviewDescription,
          {
            category: 'review',
            customFields: {
              reviewType: params.reviewType,
              reviewDate: params.date || new Date().toISOString()
            }
          }
        )
      }

      return {
        success: result.success,
        review: result,
        usedTemplate: suggestion.suggestedTemplate?.name || 'Custom template',
        message: `Created ${params.reviewType} review with ${result.createdBlocks.length} blocks`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to create smart review'
      }
    }
  }
})

// Export enhanced template tools
export const enhancedTemplateTools = {
  smartTemplateInstantiation: smartTemplateInstantiationTool,
  templateSuggestion: templateSuggestionTool,
  customTemplateCreation: customTemplateCreationTool,
  templateStats: templateStatsTool,
  smartProjectCreation: smartProjectCreationTool,
  smartReviewCreation: smartReviewCreationTool
}