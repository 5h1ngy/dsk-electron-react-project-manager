import { Note } from '@services/models/Note'
import { NoteTag } from '@services/models/NoteTag'
import { Task } from '@services/models/Task'
import type { NoteDetailsDTO, NoteSummaryDTO, NoteTaskLinkDTO } from '@services/services/note/types'
import { mapUserSummary } from '@services/services/task/helpers'

const mapLinkedTasks = (tasks: Task[] = []): NoteTaskLinkDTO[] =>
  tasks.map((task) => ({
    id: task.id,
    key: task.key,
    title: task.title
  }))

const mapTags = (tags: NoteTag[] = []): string[] =>
  Array.from(new Set(tags.map((tag) => tag.tag.toLowerCase()))).sort()

export const mapNoteSummary = (note: Note): NoteSummaryDTO => {
  const ownerSummary = mapUserSummary(note.owner ?? null)
  if (!ownerSummary) {
    throw new Error('Note owner relation missing')
  }

  return {
    id: note.id,
    projectId: note.projectId,
    title: note.title,
    notebook: note.notebook ?? null,
    isPrivate: note.isPrivate,
    tags: mapTags(note.tags ?? []),
    owner: ownerSummary,
    createdAt: note.createdAt!,
    updatedAt: note.updatedAt!,
    linkedTasks: mapLinkedTasks(note.tasks ?? [])
  }
}

export const mapNoteDetails = (note: Note): NoteDetailsDTO => ({
  ...mapNoteSummary(note),
  body: note.bodyMd
})
