import type { IpcError, IpcResponse, PreloadApi } from '@preload/types'
import type { HealthResponse } from '@main/ipc/health'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

const resolveBaseUrl = (): string => {
  let clientOrigin: string | undefined
  if (typeof window !== 'undefined' && window.location) {
    clientOrigin = window.location.origin
    const override = (window as unknown as { __API_BASE_URL?: string }).__API_BASE_URL
    if (override) {
      return normalizeBaseUrl(override, clientOrigin)
    }
  }

  const nodeEnvValue =
    typeof process !== 'undefined' && process.env ? process.env.API_BASE_URL : undefined

  const importMetaEnv = typeof import.meta !== 'undefined' ? import.meta.env : undefined
  const viteValue = importMetaEnv?.VITE_API_BASE_URL as string | undefined
  const devDefault =
    importMetaEnv && 'DEV' in importMetaEnv && (importMetaEnv.DEV as boolean) && clientOrigin
      ? `${clientOrigin}/api`
      : undefined

  const envValue = viteValue ?? nodeEnvValue ?? devDefault ?? 'http://localhost:3333'
  return normalizeBaseUrl(envValue, clientOrigin)
}

const normalizeBaseUrl = (value: string, clientOrigin?: string): string => {
  if (value.startsWith('/') && clientOrigin) {
    return `${clientOrigin}${value}`.replace(/\/$/, '')
  }
  if (!value.startsWith('http')) {
    return `http://${value}`.replace(/\/$/, '')
  }
  return value.replace(/\/$/, '')
}

const baseUrl = resolveBaseUrl()

const toSuccess = <T>(data: T): IpcResponse<T> => ({
  ok: true,
  data
})

const toError = (code: string, message: string): IpcError => ({
  ok: false,
  code,
  message
})

interface RequestOptions {
  token?: string
  body?: unknown
  query?: Record<string, string | number | boolean | undefined | null>
}

const buildUrl = (path: string, query?: RequestOptions['query']): string => {
  const url = new URL(path.replace(/^\//, ''), `${baseUrl}/`)
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return
      }
      url.searchParams.set(key, String(value))
    })
  }
  return url.toString()
}

const httpRequest = async <T>(
  method: HttpMethod,
  path: string,
  options: RequestOptions = {}
): Promise<IpcResponse<T>> => {
  try {
    const response = await fetch(
      buildUrl(path, options.query),
      {
        method,
        headers: {
          ...(options.body ? { 'Content-Type': 'application/json' } : {}),
          ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        credentials: 'include'
      }
    )

    const isJson = response.headers.get('content-type')?.includes('application/json')
    const payload = isJson ? await response.json() : await response.text()

    if (response.ok) {
      return toSuccess(payload as T)
    }

    if (payload && typeof payload === 'object' && 'error' in payload) {
      const details = (payload as { error: { code?: string; message?: string } }).error
      return toError(details.code ?? 'ERR_HTTP', details.message ?? 'Richiesta non riuscita')
    }

    return toError('ERR_HTTP', response.statusText || 'Richiesta non riuscita')
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Impossibile raggiungere il server backend'
    return toError('ERR_NETWORK', message)
  }
}

const unsupported = (): IpcResponse<never> =>
  toError('ERR_UNSUPPORTED', 'Operazione non supportata in modalità web')

const buildHttpBridge = (): PreloadApi => ({
  health: {
    check: async () => {
      const response = await httpRequest<HealthResponse>('GET', '/health')
      if (response.ok) {
        return response.data
      }
      throw new Error(response.message)
    }
  },
  auth: {
    login: async (payload) => await httpRequest('POST', '/auth/login', { body: payload }),
    register: async (payload) => await httpRequest('POST', '/auth/register', { body: payload }),
    logout: async (token) => await httpRequest('POST', '/auth/logout', { token }),
    session: async (token) => await httpRequest('GET', '/auth/session', { token }),
    listUsers: async (token) => await httpRequest('GET', '/auth/users', { token }),
    createUser: async (token, payload) =>
      await httpRequest('POST', '/auth/users', { token, body: payload }),
    updateUser: async (token, userId, payload) =>
      await httpRequest('PUT', `/auth/users/${userId}`, { token, body: payload }),
    deleteUser: async (token, userId) =>
      await httpRequest('DELETE', `/auth/users/${userId}`, { token })
  },
  project: {
    list: async (token) => await httpRequest('GET', '/projects', { token }),
    get: async (token, projectId) =>
      await httpRequest('GET', `/projects/${projectId}`, { token }),
    create: async (token, payload) =>
      await httpRequest('POST', '/projects', { token, body: payload }),
    update: async (token, projectId, payload) =>
      await httpRequest('PUT', `/projects/${projectId}`, { token, body: payload }),
    remove: async (token, projectId) =>
      await httpRequest('DELETE', `/projects/${projectId}`, { token }),
    addMember: async (token, projectId, payload) =>
      await httpRequest('PUT', `/projects/${projectId}/members`, { token, body: payload }),
    removeMember: async (token, projectId, userId) =>
      await httpRequest('DELETE', `/projects/${projectId}/members/${userId}`, { token })
  },
  task: {
    list: async (token, projectId) =>
      await httpRequest('GET', `/projects/${projectId}/tasks`, { token }),
    get: async (token, taskId) => await httpRequest('GET', `/tasks/${taskId}`, { token }),
    create: async (token, payload) =>
      await httpRequest('POST', '/tasks', { token, body: payload }),
    update: async (token, taskId, payload) =>
      await httpRequest('PUT', `/tasks/${taskId}`, { token, body: payload }),
    move: async (token, taskId, payload) =>
      await httpRequest('POST', `/tasks/${taskId}/move`, { token, body: payload }),
    remove: async (token, taskId) =>
      await httpRequest('DELETE', `/tasks/${taskId}`, { token }),
    listComments: async (token, taskId) =>
      await httpRequest('GET', `/tasks/${taskId}/comments`, { token }),
    addComment: async (token, payload) => {
      const { taskId, ...body } = payload as { taskId: string } & Record<string, unknown>
      return await httpRequest('POST', `/tasks/${taskId}/comments`, { token, body })
    },
    search: async (token, payload) =>
      await httpRequest('POST', '/tasks/search', { token, body: payload })
  },
  taskStatus: {
    list: async (token, payload) =>
      await httpRequest('GET', `/projects/${payload.projectId}/statuses`, { token }),
    create: async (token, payload) =>
      await httpRequest('POST', `/projects/${payload.projectId}/statuses`, {
        token,
        body: payload
      }),
    update: async (token, statusId, payload) =>
      await httpRequest('PUT', `/statuses/${statusId}`, {
        token,
        body: payload
      }),
    reorder: async (token, payload) =>
      await httpRequest('POST', `/projects/${payload.projectId}/statuses/reorder`, {
        token,
        body: payload
      }),
    remove: async (token, payload) =>
      await httpRequest('DELETE', `/statuses/${payload.statusId}`, {
        token,
        body: { fallbackStatusId: payload.fallbackStatusId }
      })
  },
  note: {
    list: async (token, payload) =>
      await httpRequest('POST', '/notes/query', { token, body: payload }),
    get: async (token, noteId) => await httpRequest('GET', `/notes/${noteId}`, { token }),
    create: async (token, payload) =>
      await httpRequest('POST', '/notes', { token, body: payload }),
    update: async (token, noteId, payload) =>
      await httpRequest('PUT', `/notes/${noteId}`, { token, body: payload }),
    remove: async (token, noteId) =>
      await httpRequest('DELETE', `/notes/${noteId}`, { token }),
    search: async (token, payload) =>
      await httpRequest('POST', '/notes/search', { token, body: payload })
  },
  wiki: {
    list: async (token, projectId) =>
      await httpRequest('GET', `/projects/${projectId}/wiki`, { token }),
    get: async (token, projectId, pageId) =>
      await httpRequest('GET', `/projects/${projectId}/wiki/${pageId}`, { token }),
    create: async (token, projectId, payload) =>
      await httpRequest('POST', `/projects/${projectId}/wiki`, { token, body: payload }),
    update: async (token, projectId, pageId, payload) =>
      await httpRequest('PUT', `/projects/${projectId}/wiki/${pageId}`, {
        token,
        body: payload
      }),
    remove: async (token, projectId, pageId) =>
      await httpRequest('DELETE', `/projects/${projectId}/wiki/${pageId}`, { token }),
    revisions: async (token, projectId, pageId) =>
      await httpRequest('GET', `/projects/${projectId}/wiki/${pageId}/revisions`, {
        token
      }),
    restore: async (token, projectId, pageId, revisionId) =>
      await httpRequest(
        'POST',
        `/projects/${projectId}/wiki/${pageId}/revisions/${revisionId}/restore`,
        { token }
      )
  },
  view: {
    list: async (token, payload) =>
      await httpRequest('GET', `/projects/${payload.projectId}/views`, { token }),
    create: async (token, payload) =>
      await httpRequest('POST', `/projects/${payload.projectId}/views`, {
        token,
        body: payload
      }),
    update: async (token, viewId, payload) =>
      await httpRequest('PUT', `/views/${viewId}`, { token, body: payload }),
    remove: async (token, viewId) =>
      await httpRequest('DELETE', `/views/${viewId}`, { token })
  },
  role: {
    list: async (token) => await httpRequest('GET', '/roles', { token }),
    permissions: async (token) => await httpRequest('GET', '/roles/permissions', { token }),
    create: async (token, payload) =>
      await httpRequest('POST', '/roles', { token, body: payload }),
    update: async (token, roleId, payload) =>
      await httpRequest('PUT', `/roles/${roleId}`, { token, body: payload }),
    remove: async (token, roleId) =>
      await httpRequest('DELETE', `/roles/${roleId}`, { token }),
    syncDefaults: async (token) =>
      await httpRequest('POST', '/roles/sync-defaults', { token })
  },
  database: {
    export: async () => unsupported(),
    import: async () => unsupported(),
    restart: async () => unsupported(),
    onExportProgress: () => () => undefined,
    onImportProgress: () => () => undefined
  },
  sprint: {
    list: async (token, projectId) =>
      await httpRequest('GET', `/projects/${projectId}/sprints`, { token }),
    get: async (token, sprintId) =>
      await httpRequest('GET', `/sprints/${sprintId}`, { token }),
    create: async (token, payload) =>
      await httpRequest('POST', `/projects/${payload.projectId}/sprints`, {
        token,
        body: payload
      }),
    update: async (token, sprintId, payload) =>
      await httpRequest('PUT', `/sprints/${sprintId}`, { token, body: payload }),
    remove: async (token, sprintId) =>
      await httpRequest('DELETE', `/sprints/${sprintId}`, { token })
  }
})

export const ensureHttpBridge = (): void => {
  if (typeof window === 'undefined') {
    return
  }
  if (window.api) {
    return
  }
  window.api = buildHttpBridge()
}
