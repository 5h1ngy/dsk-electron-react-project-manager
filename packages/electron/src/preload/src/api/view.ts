import type { SavedViewDTO } from '@services/services/view/types'
import type {
  CreateViewInput,
  ListViewsInput,
  UpdateViewInput
} from '@services/services/view/schemas'
import { invokeIpc } from '@preload/api/shared'

const CHANNELS = {
  list: 'view:list',
  create: 'view:create',
  update: 'view:update',
  remove: 'view:delete'
} as const

export const viewApi = {
  list: async (token: string, payload: ListViewsInput) =>
    await invokeIpc<SavedViewDTO[]>(CHANNELS.list, token, payload),
  create: async (token: string, payload: CreateViewInput) =>
    await invokeIpc<SavedViewDTO>(CHANNELS.create, token, payload),
  update: async (token: string, viewId: string, payload: UpdateViewInput) =>
    await invokeIpc<SavedViewDTO>(CHANNELS.update, token, viewId, payload),
  remove: async (token: string, viewId: string) =>
    await invokeIpc<{ success: boolean }>(CHANNELS.remove, token, viewId)
}
