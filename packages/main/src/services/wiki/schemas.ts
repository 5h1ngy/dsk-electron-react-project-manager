import { z } from 'zod'

export const wikiPageIdSchema = z.string().trim().min(1).max(36)

const titleSchema = z.string().trim().min(1, 'Titolo obbligatorio').max(160)
const summarySchema = z.string().trim().max(240).nullish()
const contentSchema = z.string().min(1, 'Contenuto obbligatorio')

export const createWikiPageSchema = z.object({
  title: titleSchema,
  summary: summarySchema,
  content: contentSchema
})

export const updateWikiPageSchema = z.object({
  title: titleSchema,
  summary: summarySchema,
  content: contentSchema
})

export type CreateWikiPageInput = z.input<typeof createWikiPageSchema>
export type UpdateWikiPageInput = z.input<typeof updateWikiPageSchema>
