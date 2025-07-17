import { tool } from 'ai'
import { z } from 'zod'
import { BlockService } from '../services/block-service'
import { VectorService } from '../rag/vector-service'
import { EmbeddingService } from '../rag/embedding-service'

// Initialize services
const embeddingService = new EmbeddingService()
const vectorService = new VectorService(embeddingService)
const blockService = new BlockService(vectorService)

// Create Text Block Tool
export const createTextBlockTool = tool({
  description: 'Create a text block with formatted content',
  parameters: z.object({
    text: z.string().describe('The text content'),
    category: z.string().optional().describe('Category for organization'),
    tags: z.array(z.string()).optional().describe('Tags for the block'),
    parentId: z.string().optional().describe('Parent block ID if this is a child block'),
    userId: z.string().describe('User ID')
  }),
  execute: async (params) => {
    try {
      const block = await blockService.createBlock({
        type: 'text',
        content: {
          text: params.text,
          formatting: {}
        },
        metadata: {
          category: params.category || 'general',
          tags: params.tags || [],
          aiGenerated: true
        },
        parentId: params.parentId,
        userId: params.userId
      })

      return {
        success: true,
        block,
        message: `Created text block successfully`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to create text block'
      }
    }
  }
})

// Create Heading Block Tool
export const createHeadingBlockTool = tool({
  description: 'Create a heading block for document structure',
  parameters: z.object({
    text: z.string().describe('The heading text'),
    level: z.number().min(1).max(6).describe('Heading level (1-6, where 1 is largest)'),
    anchor: z.string().optional().describe('Optional anchor ID for linking'),
    category: z.string().optional().describe('Category for organization'),
    parentId: z.string().optional().describe('Parent block ID'),
    userId: z.string().describe('User ID')
  }),
  execute: async (params) => {
    try {
      const block = await blockService.createBlock({
        type: 'heading',
        content: {
          level: params.level,
          text: params.text,
          anchor: params.anchor
        },
        metadata: {
          category: params.category || 'general',
          aiGenerated: true
        },
        parentId: params.parentId,
        userId: params.userId
      })

      return {
        success: true,
        block,
        message: `Created heading block (level ${params.level}) successfully`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to create heading block'
      }
    }
  }
})

// Create Todo Block Tool
export const createTodoBlockTool = tool({
  description: 'Create a todo/task block for task management',
  parameters: z.object({
    text: z.string().describe('The task description'),
    priority: z.enum(['high', 'medium', 'low']).optional().describe('Task priority'),
    dueDate: z.string().optional().describe('Due date (ISO string format)'),
    scheduledAt: z.string().optional().describe('Scheduled time (ISO string format)'),
    category: z.string().optional().describe('Category for organization'),
    tags: z.array(z.string()).optional().describe('Tags for the task'),
    parentId: z.string().optional().describe('Parent block ID'),
    userId: z.string().describe('User ID')
  }),
  execute: async (params) => {
    try {
      const metadata: any = {
        category: params.category || 'tasks',
        tags: params.tags || [],
        priority: params.priority,
        aiGenerated: true
      }

      if (params.dueDate) {
        metadata.dueDate = new Date(params.dueDate)
      }
      if (params.scheduledAt) {
        metadata.scheduledAt = new Date(params.scheduledAt)
      }

      const block = await blockService.createBlock({
        type: 'todo',
        content: {
          text: params.text,
          checked: false,
          priority: params.priority
        },
        metadata,
        parentId: params.parentId,
        userId: params.userId
      })

      return {
        success: true,
        block,
        message: `Created todo block successfully`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to create todo block'
      }
    }
  }
})

// Create Table Block Tool
export const createTableBlockTool = tool({
  description: 'Create a table block for structured data',
  parameters: z.object({
    headers: z.array(z.string()).describe('Column headers'),
    rows: z.array(z.array(z.string())).describe('Table rows (array of arrays)'),
    category: z.string().optional().describe('Category for organization'),
    tags: z.array(z.string()).optional().describe('Tags for the table'),
    parentId: z.string().optional().describe('Parent block ID'),
    userId: z.string().describe('User ID')
  }),
  execute: async (params) => {
    try {
      const block = await blockService.createBlock({
        type: 'table',
        content: {
          headers: params.headers,
          rows: params.rows
        },
        metadata: {
          category: params.category || 'data',
          tags: params.tags || [],
          aiGenerated: true
        },
        parentId: params.parentId,
        userId: params.userId
      })

      return {
        success: true,
        block,
        message: `Created table block with ${params.headers.length} columns and ${params.rows.length} rows`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to create table block'
      }
    }
  }
})

// Create Callout Block Tool
export const createCalloutBlockTool = tool({
  description: 'Create a callout block for highlighting important information',
  parameters: z.object({
    text: z.string().describe('The callout text'),
    type: z.enum(['info', 'warning', 'error', 'success']).describe('Callout type for styling'),
    icon: z.string().optional().describe('Optional icon (emoji or icon name)'),
    category: z.string().optional().describe('Category for organization'),
    parentId: z.string().optional().describe('Parent block ID'),
    userId: z.string().describe('User ID')
  }),
  execute: async (params) => {
    try {
      const block = await blockService.createBlock({
        type: 'callout',
        content: {
          type: params.type,
          text: params.text,
          icon: params.icon
        },
        metadata: {
          category: params.category || 'general',
          aiGenerated: true
        },
        parentId: params.parentId,
        userId: params.userId
      })

      return {
        success: true,
        block,
        message: `Created ${params.type} callout block successfully`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to create callout block'
      }
    }
  }
})

// Create Page Block Tool
export const createPageBlockTool = tool({
  description: 'Create a page block that can contain other blocks',
  parameters: z.object({
    title: z.string().describe('Page title'),
    description: z.string().optional().describe('Page description'),
    icon: z.string().optional().describe('Page icon (emoji)'),
    layout: z.enum(['default', 'dashboard', 'kanban', 'calendar']).optional().describe('Page layout type'),
    visibility: z.enum(['private', 'shared']).optional().describe('Page visibility'),
    category: z.string().optional().describe('Category for organization'),
    tags: z.array(z.string()).optional().describe('Tags for the page'),
    userId: z.string().describe('User ID')
  }),
  execute: async (params) => {
    try {
      const block = await blockService.createBlock({
        type: 'page',
        content: {
          title: params.title,
          description: params.description,
          childBlocks: [],
          layout: params.layout || 'default',
          visibility: params.visibility || 'private',
          icon: params.icon
        },
        metadata: {
          category: params.category || 'pages',
          tags: params.tags || [],
          aiGenerated: true
        },
        userId: params.userId
      })

      return {
        success: true,
        block,
        pageUrl: `/p/${block.id}`,
        message: `Created page "${params.title}" successfully. You can access it at /p/${block.id}`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to create page block'
      }
    }
  }
})

// Update Todo Status Tool
export const updateTodoStatusTool = tool({
  description: 'Update the completion status of a todo block',
  parameters: z.object({
    blockId: z.string().describe('Todo block ID'),
    checked: z.boolean().describe('New completion status'),
    userId: z.string().describe('User ID')
  }),
  execute: async (params) => {
    try {
      const block = await blockService.getBlock(params.blockId)
      if (!block || block.type !== 'todo') {
        return {
          success: false,
          message: 'Todo block not found'
        }
      }

      const updatedContent = {
        ...block.content as any,
        checked: params.checked
      }

      const updatedMetadata = {
        ...block.metadata as any,
        completedAt: params.checked ? new Date() : undefined
      }

      const updatedBlock = await blockService.updateBlock(params.blockId, {
        content: updatedContent,
        metadata: updatedMetadata
      })

      return {
        success: true,
        block: updatedBlock,
        message: `Todo ${params.checked ? 'completed' : 'uncompleted'} successfully`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to update todo status'
      }
    }
  }
})

// Add Block to Page Tool
export const addBlockToPageTool = tool({
  description: 'Add a block as a child to a page block',
  parameters: z.object({
    pageId: z.string().describe('Page block ID'),
    childBlockId: z.string().describe('Block ID to add as child'),
    userId: z.string().describe('User ID')
  }),
  execute: async (params) => {
    try {
      const pageBlock = await blockService.getBlock(params.pageId)
      if (!pageBlock || pageBlock.type !== 'page') {
        return {
          success: false,
          message: 'Page block not found'
        }
      }

      const pageContent = pageBlock.content as any
      const updatedChildBlocks = [...(pageContent.childBlocks || []), params.childBlockId]

      const updatedContent = {
        ...pageContent,
        childBlocks: updatedChildBlocks
      }

      // Also update the child block's parentId
      await blockService.updateBlock(params.childBlockId, {
        parentId: params.pageId
      })

      const updatedPage = await blockService.updateBlock(params.pageId, {
        content: updatedContent
      })

      return {
        success: true,
        block: updatedPage,
        message: `Added block to page successfully`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to add block to page'
      }
    }
  }
})

// Keep the existing search and utility tools
export const searchBlocksTool = tool({
  description: 'Search for content blocks using semantic search',
  parameters: z.object({
    query: z.string().describe('Search query'),
    userId: z.string().describe('User ID'),
    type: z.enum(['text', 'table', 'todo', 'heading', 'callout', 'page']).optional().describe('Filter by block type'),
    category: z.string().optional().describe('Filter by category'),
    limit: z.number().min(1).max(20).default(5).describe('Maximum number of results')
  }),
  execute: async (params) => {
    try {
      const blocks = await blockService.searchBlocks(params.query, params.userId, {
        type: params.type,
        category: params.category,
        limit: params.limit
      })

      return {
        success: true,
        blocks,
        count: blocks.length,
        message: `Found ${blocks.length} blocks matching "${params.query}"`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to search blocks'
      }
    }
  }
})

export const getBlockTool = tool({
  description: 'Get a specific block by ID',
  parameters: z.object({
    blockId: z.string().describe('Block ID')
  }),
  execute: async (params) => {
    try {
      const block = await blockService.getBlock(params.blockId)
      
      if (!block) {
        return {
          success: false,
          message: 'Block not found'
        }
      }

      return {
        success: true,
        block,
        message: 'Block retrieved successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to get block'
      }
    }
  }
})

export const deleteBlockTool = tool({
  description: 'Delete a content block',
  parameters: z.object({
    blockId: z.string().describe('Block ID to delete')
  }),
  execute: async (params) => {
    try {
      await blockService.deleteBlock(params.blockId)

      return {
        success: true,
        message: 'Block deleted successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to delete block'
      }
    }
  }
})

export const getTodaysTasksTool = tool({
  description: 'Get tasks scheduled for today',
  parameters: z.object({
    userId: z.string().describe('User ID')
  }),
  execute: async (params) => {
    try {
      const tasks = await blockService.getTodaysTasks(params.userId)

      return {
        success: true,
        tasks,
        count: tasks.length,
        message: `Found ${tasks.length} tasks for today`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to get today\'s tasks'
      }
    }
  }
})

export const getBlockStatsTool = tool({
  description: 'Get statistics about user\'s blocks',
  parameters: z.object({
    userId: z.string().describe('User ID')
  }),
  execute: async (params) => {
    try {
      const stats = await blockService.getBlockStats(params.userId)

      return {
        success: true,
        stats,
        message: 'Block statistics retrieved successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to get block statistics'
      }
    }
  }
})

// Export all tools
export const blockTools = {
  createTextBlock: createTextBlockTool,
  createHeadingBlock: createHeadingBlockTool,
  createTodoBlock: createTodoBlockTool,
  createTableBlock: createTableBlockTool,
  createCalloutBlock: createCalloutBlockTool,
  createPageBlock: createPageBlockTool,
  updateTodoStatus: updateTodoStatusTool,
  addBlockToPage: addBlockToPageTool,
  searchBlocks: searchBlocksTool,
  getBlock: getBlockTool,
  deleteBlock: deleteBlockTool,
  getTodaysTasks: getTodaysTasksTool,
  getBlockStats: getBlockStatsTool
}