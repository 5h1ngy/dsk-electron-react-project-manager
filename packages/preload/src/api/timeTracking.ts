import type {
  CreateTimeEntryInput,
  UpdateTimeEntryInput,
  ProjectTimeSummaryInput
} from '@main/services/timeTracking/schemas'
import type { ProjectTimeSummaryDTO, TimeEntryDTO } from '@main/services/timeTracking/types'
import { invokeIpc } from '@preload/api/shared'

const CHANNELS = {
  log: 'time:log',
  update: 'time:update',
  remove: 'time:delete',
  summary: 'time:summary'
} as const

export const timeTrackingApi = {
  log: async (token: string, payload: CreateTimeEntryInput) =>
    await invokeIpc<TimeEntryDTO>(CHANNELS.log, token, payload),
  update: async (token: string, entryId: string, payload: UpdateTimeEntryInput) =>
    await invokeIpc<TimeEntryDTO>(CHANNELS.update, token, entryId, payload),
  remove: async (token: string, entryId: string) =>
    await invokeIpc<{ success: boolean }>(CHANNELS.remove, token, entryId),
  summary: async (token: string, payload: ProjectTimeSummaryInput) =>
    await invokeIpc<ProjectTimeSummaryDTO>(CHANNELS.summary, token, payload)
}
