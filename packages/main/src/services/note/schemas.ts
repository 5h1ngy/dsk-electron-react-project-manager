import { z } from 'zod'

const identifierSchema = z
  .string()
  .trim()
  .min(1, 'Identifier is required')
  .max(36, 'Identifier too long')

export const noteTitleSchema = z
  .string()
  .trim()
  .min(1, 'Title is required')
  .max(160, 'Title must be at most 160 characters')

export const notebookSchema = z
  .string()
  .trim()
  .min(1, 'Notebook name is required')
  .max(80, 'Notebook name too long')

export const noteTagSchema = z
  .string()
  .trim()
  .min(1, 'Tag cannot be empty')
  .max(40, 'Tag too long')

export const noteBodySchema = z
  .string()
  .trim()
  .min(1, 'Body is required')
  .max(50000, 'Body is too long')

export const createNoteSchema = z.object({
  projectId: identifierSchema,
  title: noteTitleSchema,
  body: noteBodySchema,
  isPrivate: z.boolean().optional().default(false),
  notebook: notebookSchema.nullable().optional(),
  tags: z.array(noteTagSchema).max(20).optional().default([]),
  linkedTaskIds: z.array(identifierSchema).max(20).optional().default([])
})

export const updateNoteSchema = z
  .object({
    title: noteTitleSchema.optional(),
    body: noteBodySchema.optional(),
    isPrivate: z.boolean().optional(),
    notebook: notebookSchema.nullable().optional(),
    tags: z.array(noteTagSchema).max(20).optional(),
    linkedTaskIds: z.array(identifierSchema).max(20).optional()
  })
  .refine((value) => Object.keys(value).length > 0, 'At least one field must be provided')

export const listNotesSchema = z.object({
  projectId: identifierSchema,
  notebook: notebookSchema.optional(),
  tag: noteTagSchema.optional(),
  includePrivate: z.boolean().optional().default(false)
})

export const noteIdSchema = identifierSchema

export const searchNotesSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, 'Query is required')
    .max(120, 'Query is too long'),
  projectId: identifierSchema.optional()
})

export type CreateNoteInput = z.infer<typeof createNoteSchema>
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>
export type ListNotesInput = z.infer<typeof listNotesSchema>
export type SearchNotesInput = z.infer<typeof searchNotesSchema>
