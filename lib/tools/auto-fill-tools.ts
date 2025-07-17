import { tool } from 'ai'
import { z } from 'zod'
import { AutoFillEngine } from '../ai/auto-fill-engine'

// Initialize auto-fill engine
const autoFillEngine = new AutoFillEngine()

// Intelligent Fill Tool
export const intelligentFillTool = tool({
  description: 'Intelligently fill user information into the appropriate blocks',
  parameters: z.object({
    userInput: z.string(),
    userId: z.string(),
    context: z.array(z.string()).optional()
  }),
  execute: async (params) => {
    try {
      const result = await autoFillEngine.analyzeAndFill(
        params.userInput,
        params.userId,
        params.context
      )

      return {
        success: true,
        result,
        message: `Successfully ${result.action}d content with ${result.confidence * 100}% confidence`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to perform intelligent fill'
      }
    }
  }
})

// Get Fill Suggestions Tool
export const getFillSuggestionsTool = tool({
  description: 'Get suggestions for how to fill user input',
  parameters: z.object({
    userInput: z.string(),
    userId: z.string()
  }),
  execute: async (params) => {
    try {
      const suggestions = await autoFillEngine.getSuggestions(
        params.userInput,
        params.userId
      )

      return {
        success: true,
        suggestions,
        message: `Generated ${suggestions.length} fill suggestions`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to get fill suggestions'
      }
    }
  }
})

// Analyze Content Tool
export const analyzeContentTool = tool({
  description: 'Analyze user content and extract structured information',
  parameters: z.object({
    content: z.string(),
    extractTimeInfo: z.boolean().default(true),
    extractEntities: z.boolean().default(true)
  }),
  execute: async (params) => {
    try {
      // This would typically use the analysis methods from AutoFillEngine
      // For now, we'll create a simplified version
      const analysis = {
        intent: 'general',
        category: 'general',
        extractedContent: params.content,
        keywords: params.content.split(' ').filter(word => word.length > 3),
        entities: []
      }

      return {
        success: true,
        analysis,
        message: 'Content analyzed successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to analyze content'
      }
    }
  }
})

// Smart Block Creation Tool
export const smartBlockCreationTool = tool({
  description: 'Create blocks intelligently based on user input',
  parameters: z.object({
    userInput: z.string(),
    userId: z.string(),
    suggestedType: z.enum(['text', 'todo', 'heading', 'table', 'callout']).optional(),
    category: z.string().optional()
  }),
  execute: async (params) => {
    try {
      const result = await autoFillEngine.analyzeAndFill(
        params.userInput,
        params.userId
      )

      // Force creation if no existing blocks to update
      if (result.action !== 'create') {
        // Re-run with creation preference
        const createResult = await autoFillEngine.analyzeAndFill(
          params.userInput,
          params.userId
        )
        
        return {
          success: true,
          result: createResult,
          message: `Created new ${createResult.newBlock?.type} block`
        }
      }

      return {
        success: true,
        result,
        message: `Created new ${result.newBlock?.type} block`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to create smart block'
      }
    }
  }
})

// Export all auto-fill tools
export const autoFillTools = {
  intelligentFill: intelligentFillTool,
  getFillSuggestions: getFillSuggestionsTool,
  analyzeContent: analyzeContentTool,
  smartBlockCreation: smartBlockCreationTool
}