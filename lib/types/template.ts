import { z } from 'zod'

// Template Category Types
export type TemplateCategory = 'project' | 'review'

// Template Block Schema
export const TemplateBlockSchema = z.object({
  type: z.enum(['text', 'table', 'todo', 'heading', 'callout']),
  content: z.any(),
  position: z.number(),
  required: z.boolean(),
  customizable: z.boolean(),
  aiPrompt: z.string().optional()
})

// Custom Field Schema
export const CustomFieldSchema = z.object({
  name: z.string(),
  type: z.enum(['text', 'date', 'select', 'number', 'boolean']),
  defaultValue: z.any().optional(),
  options: z.array(z.string()).optional(),
  required: z.boolean(),
  description: z.string().optional()
})

// Template Metadata Schema
export const TemplateMetadataSchema = z.object({
  version: z.string().default('1.0'),
  author: z.string().optional(),
  lastUsed: z.date().optional(),
  usageCount: z.number().default(0),
  customizations: z.record(z.string(), z.any()).optional()
})

// Template Schema
export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  category: z.enum(['project', 'review']),
  icon: z.string().optional(),
  tags: z.array(z.string()).default([]),
  structure: z.object({
    blocks: z.array(TemplateBlockSchema),
    customFields: z.array(CustomFieldSchema).optional()
  }),
  metadata: TemplateMetadataSchema,
  userId: z.string(),
  isPublic: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date()
})

// Create Template Schema
export const CreateTemplateSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  category: z.enum(['project', 'review']),
  icon: z.string().optional(),
  tags: z.array(z.string()).default([]),
  structure: z.object({
    blocks: z.array(TemplateBlockSchema),
    customFields: z.array(CustomFieldSchema).optional()
  }),
  metadata: TemplateMetadataSchema.partial().optional(),
  userId: z.string(),
  isPublic: z.boolean().default(false)
})

// Update Template Schema
export const UpdateTemplateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  category: z.enum(['project', 'review']).optional(),
  icon: z.string().optional(),
  tags: z.array(z.string()).optional(),
  structure: z.object({
    blocks: z.array(TemplateBlockSchema),
    customFields: z.array(CustomFieldSchema).optional()
  }).optional(),
  metadata: TemplateMetadataSchema.partial().optional(),
  isPublic: z.boolean().optional()
})

// Export types
export type Template = z.infer<typeof TemplateSchema>
export type CreateTemplate = z.infer<typeof CreateTemplateSchema>
export type UpdateTemplate = z.infer<typeof UpdateTemplateSchema>
export type TemplateBlock = z.infer<typeof TemplateBlockSchema>
export type CustomField = z.infer<typeof CustomFieldSchema>
export type TemplateMetadata = z.infer<typeof TemplateMetadataSchema>