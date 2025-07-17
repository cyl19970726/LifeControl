import { z } from 'zod'

// Block Types
export type BlockType = 'text' | 'table' | 'todo' | 'heading' | 'callout' | 'page'

// Block Content Schemas
export const TextBlockContentSchema = z.object({
  text: z.string(),
  formatting: z.record(z.string(), z.any()).optional()
})

export const HeadingBlockContentSchema = z.object({
  level: z.number().min(1).max(6),
  text: z.string(),
  anchor: z.string().optional()
})

export const TableBlockContentSchema = z.object({
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string()))
})

export const TodoBlockContentSchema = z.object({
  text: z.string(),
  checked: z.boolean(),
  priority: z.enum(['high', 'medium', 'low']).optional()
})

export const CalloutBlockContentSchema = z.object({
  type: z.enum(['info', 'warning', 'error', 'success']),
  text: z.string(),
  icon: z.string().optional()
})

export const PageBlockContentSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  childBlocks: z.array(z.string()).default([]),
  layout: z.enum(['default', 'dashboard', 'kanban', 'calendar']).default('default'),
  visibility: z.enum(['private', 'shared']).default('private'),
  icon: z.string().optional(),
  coverImage: z.string().optional()
})

// Block Metadata Schema
export const BlockMetadataSchema = z.object({
  tags: z.array(z.string()).default([]),
  category: z.string().default('general'),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  scheduledAt: z.date().optional(),
  completedAt: z.date().optional(),
  dueDate: z.date().optional(),
  linkedBlocks: z.array(z.string()).default([]),
  mentions: z.array(z.string()).default([]),
  aiGenerated: z.boolean().default(false),
  confidence: z.number().min(0).max(1).optional()
})

// Block Schema
export const BlockSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'table', 'todo', 'heading', 'callout', 'page']),
  content: z.union([
    TextBlockContentSchema,
    HeadingBlockContentSchema,
    TableBlockContentSchema,
    TodoBlockContentSchema,
    CalloutBlockContentSchema,
    PageBlockContentSchema
  ]),
  metadata: BlockMetadataSchema,
  templateId: z.string().optional(),
  parentId: z.string().optional(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
})

// Create Block Schema
export const CreateBlockSchema = z.object({
  type: z.enum(['text', 'table', 'todo', 'heading', 'callout', 'page']),
  content: z.union([
    TextBlockContentSchema,
    HeadingBlockContentSchema,
    TableBlockContentSchema,
    TodoBlockContentSchema,
    CalloutBlockContentSchema,
    PageBlockContentSchema
  ]),
  metadata: BlockMetadataSchema.partial(),
  templateId: z.string().optional(),
  parentId: z.string().optional(),
  userId: z.string()
})

// Update Block Schema
export const UpdateBlockSchema = z.object({
  type: z.enum(['text', 'table', 'todo', 'heading', 'callout', 'page']).optional(),
  content: z.union([
    TextBlockContentSchema,
    HeadingBlockContentSchema,
    TableBlockContentSchema,
    TodoBlockContentSchema,
    CalloutBlockContentSchema,
    PageBlockContentSchema
  ]).optional(),
  metadata: BlockMetadataSchema.partial().optional(),
  templateId: z.string().optional(),
  parentId: z.string().optional()
})

// Export types
export type Block = z.infer<typeof BlockSchema>
export type CreateBlock = z.infer<typeof CreateBlockSchema>
export type UpdateBlock = z.infer<typeof UpdateBlockSchema>
export type BlockContent = Block['content']
export type BlockMetadata = z.infer<typeof BlockMetadataSchema>