import { blockTools } from './block-tools'
import { templateTools } from './template-tools'
import { timeTools } from './time-tools'
import { autoFillTools } from './auto-fill-tools'
import { enhancedTemplateTools } from './enhanced-template-tools'

// Export all tools in a single registry
export const toolRegistry = {
  // Block Management Tools
  ...blockTools,
  
  // Template Management Tools
  ...templateTools,
  
  // Time Management Tools
  ...timeTools,
  
  // Auto-Fill Tools
  ...autoFillTools,
  
  // Enhanced Template Tools
  ...enhancedTemplateTools
}

// Export individual tool categories
export { blockTools, templateTools, timeTools, autoFillTools, enhancedTemplateTools }

// Export tool names for easy reference
export const toolNames = {
  // Block tools - typed versions
  createTextBlock: 'createTextBlock',
  createHeadingBlock: 'createHeadingBlock',
  createTodoBlock: 'createTodoBlock',
  createTableBlock: 'createTableBlock',
  createCalloutBlock: 'createCalloutBlock',
  createPageBlock: 'createPageBlock',
  updateTodoStatus: 'updateTodoStatus',
  addBlockToPage: 'addBlockToPage',
  searchBlocks: 'searchBlocks',
  getBlock: 'getBlock',
  getTodaysTasks: 'getTodaysTasks',
  
  // Template tools
  createTemplate: 'createTemplate',
  getTemplate: 'getTemplate',
  listTemplates: 'listTemplates',
  createFromTemplate: 'createFromTemplate',
  updateTemplate: 'updateTemplate',
  deleteTemplate: 'deleteTemplate',
  searchTemplates: 'searchTemplates',
  
  // Time tools
  scheduleTask: 'scheduleTask',
  parseTime: 'parseTime',
  getTodaysSchedule: 'getTodaysSchedule',
  getUpcomingTasks: 'getUpcomingTasks',
  updateDashboard: 'updateDashboard',
  rescheduleTask: 'rescheduleTask',
  markTaskComplete: 'markTaskComplete',
  getTimeInsights: 'getTimeInsights',
  
  // Auto-fill tools
  intelligentFill: 'intelligentFill',
  getFillSuggestions: 'getFillSuggestions',
  analyzeContent: 'analyzeContent',
  smartBlockCreation: 'smartBlockCreation',
  
  // Enhanced template tools
  smartTemplateInstantiation: 'smartTemplateInstantiation',
  templateSuggestion: 'templateSuggestion',
  customTemplateCreation: 'customTemplateCreation',
  templateStats: 'templateStats',
  smartProjectCreation: 'smartProjectCreation',
  smartReviewCreation: 'smartReviewCreation'
} as const

// Tool descriptions for AI context
export const toolDescriptions = {
  // Block Management - Typed Tools
  createTextBlock: 'Creates a text block with formatted content',
  createHeadingBlock: 'Creates a heading block for document structure (levels 1-6)',
  createTodoBlock: 'Creates a todo/task block with priority and scheduling',
  createTableBlock: 'Creates a table block with headers and rows for structured data',
  createCalloutBlock: 'Creates a callout block for highlighting important information',
  createPageBlock: 'Creates a page block that can contain other blocks',
  updateTodoStatus: 'Updates the completion status of a todo block',
  addBlockToPage: 'Adds a block as a child to a page block',
  searchBlocks: 'Searches blocks using semantic search',
  getBlock: 'Retrieves a specific block by ID',
  getTodaysTasks: 'Gets tasks scheduled for today',
  
  // Template Management
  createTemplate: 'Creates a new template for projects or reviews',
  getTemplate: 'Retrieves a specific template by ID',
  listTemplates: 'Lists templates by category or user',
  createFromTemplate: 'Creates blocks from a template',
  updateTemplate: 'Updates an existing template',
  deleteTemplate: 'Deletes a template',
  searchTemplates: 'Searches templates by name or description',
  
  // Time Management
  scheduleTask: 'Schedules a task for a specific time',
  parseTime: 'Parses natural language time expressions',
  getTodaysSchedule: 'Gets today\'s scheduled tasks and events',
  getUpcomingTasks: 'Gets upcoming tasks and deadlines',
  updateDashboard: 'Updates dashboard with current tasks',
  rescheduleTask: 'Reschedules a task to a new time',
  markTaskComplete: 'Marks a task as completed',
  getTimeInsights: 'Gets insights about time usage and productivity',
  
  // Auto-Fill System
  intelligentFill: 'Intelligently fills user content into appropriate blocks',
  getFillSuggestions: 'Gets suggestions for how to organize user content',
  analyzeContent: 'Analyzes user content and extracts structured information',
  smartBlockCreation: 'Creates blocks intelligently based on user input',
  
  // Enhanced Template System
  smartTemplateInstantiation: 'Intelligently instantiates templates with AI-enhanced content',
  templateSuggestion: 'Suggests the most appropriate template based on user input',
  customTemplateCreation: 'Creates custom templates based on user requirements',
  templateStats: 'Gets statistics about user templates and usage patterns',
  smartProjectCreation: 'Creates projects intelligently using templates and AI',
  smartReviewCreation: 'Creates reviews intelligently using templates and AI'
}