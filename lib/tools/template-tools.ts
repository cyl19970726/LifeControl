import { tool, zodSchema } from 'ai'
import { z } from 'zod'
import { TemplateService } from '../services/template-service'

// Initialize service
const templateService = new TemplateService()

// Create Template Tool
export const createTemplateTool = tool({
  description: 'Create a new template',
  parameters: z.object({
    name: z.string(),
    description: z.string().optional(),
    category: z.enum(['project', 'review']),
    icon: z.string().optional(),
    tags: z.array(z.string()).default([]),
    structure: z.object({
      blocks: z.array(z.object({
        type: z.enum(['text', 'table', 'todo', 'heading', 'callout']),
        content: z.any(),
        position: z.number(),
        required: z.boolean(),
        customizable: z.boolean(),
        aiPrompt: z.string().optional()
      })),
      customFields: z.array(z.object({
        name: z.string(),
        type: z.enum(['text', 'date', 'select', 'number', 'boolean']),
        defaultValue: z.any().optional(),
        options: z.array(z.string()).optional(),
        required: z.boolean(),
        description: z.string().optional()
      })).optional()
    }),
    userId: z.string(),
    isPublic: z.boolean().default(false)
  }),
  execute: async (params) => {
    try {
      const template = await templateService.createTemplate({
        name: params.name,
        description: params.description,
        category: params.category,
        icon: params.icon,
        tags: params.tags,
        structure: params.structure,
        userId: params.userId,
        isPublic: params.isPublic
      })

      return {
        success: true,
        template,
        message: `Created ${params.category} template "${params.name}" successfully`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to create template "${params.name}"`
      }
    }
  }
})

// Get Template Tool
export const getTemplateTool = tool({
  description: 'Get a specific template by ID',
  parameters: z.object({
    templateId: z.string()
  }),
  execute: async (params) => {
    try {
      const template = await templateService.getTemplate(params.templateId)
      
      if (!template) {
        return {
          success: false,
          message: 'Template not found'
        }
      }

      return {
        success: true,
        template,
        message: 'Template retrieved successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to get template'
      }
    }
  }
})

// List Templates Tool
export const listTemplatesTool = tool({
  description: 'List templates by category or user',
  parameters: z.object({
    userId: z.string(),
    category: z.enum(['project', 'review']).optional(),
    isPublic: z.boolean().optional(),
    limit: z.number().min(1).max(50).default(10)
  }),
  execute: async (params) => {
    try {
      const templates = await templateService.getTemplatesByUser(params.userId, {
        category: params.category,
        isPublic: params.isPublic,
        limit: params.limit
      })

      return {
        success: true,
        templates,
        count: templates.length,
        message: `Found ${templates.length} templates`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to list templates'
      }
    }
  }
})

// Create from Template Tool
export const createFromTemplateTool = tool({
  description: 'Create blocks from a template',
  parameters: z.object({
    templateId: z.string(),
    userId: z.string(),
    customData: z.object({
      projectName: z.string().optional(),
      projectDescription: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      priority: z.enum(['high', 'medium', 'low']).optional(),
      tags: z.array(z.string()).optional()
    }).passthrough().optional()
  }),
  execute: async (params) => {
    try {
      const result = await templateService.createFromTemplate(
        params.templateId,
        params.userId,
        params.customData
      )

      return {
        success: true,
        blocks: result.blocks,
        templateName: result.templateName,
        message: `Created ${result.blocks.length} blocks from template "${result.templateName}"`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to create from template'
      }
    }
  }
})

// Update Template Tool
export const updateTemplateTool = tool({
  description: 'Update an existing template',
  parameters: z.object({
    templateId: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    category: z.enum(['project', 'review']).optional(),
    icon: z.string().optional(),
    tags: z.array(z.string()).optional(),
    structure: z.object({
      blocks: z.array(z.object({
        type: z.enum(['text', 'table', 'todo', 'heading', 'callout']),
        content: z.any(),
        position: z.number(),
        required: z.boolean(),
        customizable: z.boolean(),
        aiPrompt: z.string().optional()
      })),
      customFields: z.array(z.object({
        name: z.string(),
        type: z.enum(['text', 'date', 'select', 'number', 'boolean']),
        defaultValue: z.any().optional(),
        options: z.array(z.string()).optional(),
        required: z.boolean(),
        description: z.string().optional()
      })).optional()
    }).optional(),
    isPublic: z.boolean().optional()
  }),
  execute: async (params) => {
    try {
      const template = await templateService.updateTemplate(params.templateId, {
        name: params.name,
        description: params.description,
        category: params.category,
        icon: params.icon,
        tags: params.tags,
        structure: params.structure,
        isPublic: params.isPublic
      })

      return {
        success: true,
        template,
        message: 'Template updated successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to update template'
      }
    }
  }
})

// Delete Template Tool
export const deleteTemplateTool = tool({
  description: 'Delete a template',
  parameters: z.object({
    templateId: z.string()
  }),
  execute: async (params) => {
    try {
      await templateService.deleteTemplate(params.templateId)

      return {
        success: true,
        message: 'Template deleted successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to delete template'
      }
    }
  }
})

// Search Templates Tool
export const searchTemplatesTool = tool({
  description: 'Search for templates',
  parameters: z.object({
    query: z.string(),
    userId: z.string(),
    category: z.enum(['project', 'review']).optional(),
    limit: z.number().min(1).max(20).default(10)
  }),
  execute: async (params) => {
    try {
      const templates = await templateService.searchTemplates(params.query, {
        userId: params.userId,
        category: params.category,
        limit: params.limit
      })

      return {
        success: true,
        templates,
        count: templates.length,
        message: `Found ${templates.length} templates matching "${params.query}"`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to search templates'
      }
    }
  }
})

// Export all tools
export const templateTools = {
  createTemplate: createTemplateTool,
  getTemplate: getTemplateTool,
  listTemplates: listTemplatesTool,
  createFromTemplate: createFromTemplateTool,
  updateTemplate: updateTemplateTool,
  deleteTemplate: deleteTemplateTool,
  searchTemplates: searchTemplatesTool
}