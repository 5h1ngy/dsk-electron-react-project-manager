import { useCallback, useEffect, useMemo, useState } from 'react'

import type { CreatedRange, RoleFilter } from '@renderer/pages/Projects/hooks/useProjectsPage'

const isBrowser = typeof window !== 'undefined'

export interface ProjectViewFilters {
  search: string
  tags: string[]
  role: RoleFilter
  ownedOnly: boolean
  createdRange: CreatedRange
}

export interface ProjectSavedView {
  id: string
  name: string
  filters: ProjectViewFilters
  createdAt: string
}

interface UseProjectSavedViewsResult {
  views: ProjectSavedView[]
  selectedId: string | null
  saveView: (name: string, filters: ProjectViewFilters) => ProjectSavedView
  deleteView: (id: string) => void
  selectView: (id: string | null) => void
  getViewById: (id: string) => ProjectSavedView | undefined
}

const buildStorageKey = (userId: string | null | undefined): string =>
  `projectViews:${userId ?? 'guest'}`

const readViews = (key: string): ProjectSavedView[] => {
  if (!isBrowser) {
    return []
  }
  try {
    const raw = window.localStorage.getItem(`${key}:list`)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter((item: unknown): item is ProjectSavedView => {
      if (!item || typeof item !== 'object') {
        return false
      }
      const candidate = item as ProjectSavedView
      return (
        typeof candidate.id === 'string' &&
        typeof candidate.name === 'string' &&
        typeof candidate.createdAt === 'string' &&
        !!candidate.filters &&
        typeof candidate.filters === 'object'
      )
    })
  } catch {
    return []
  }
}

const readSelectedId = (key: string): string | null => {
  if (!isBrowser) {
    return null
  }
  try {
    const value = window.localStorage.getItem(`${key}:selected`)
    return value ?? null
  } catch {
    return null
  }
}

const persist = (key: string, views: ProjectSavedView[], selectedId: string | null) => {
  if (!isBrowser) {
    return
  }
  try {
    window.localStorage.setItem(`${key}:list`, JSON.stringify(views))
    if (selectedId) {
      window.localStorage.setItem(`${key}:selected`, selectedId)
    } else {
      window.localStorage.removeItem(`${key}:selected`)
    }
  } catch {
    // ignore persistence errors
  }
}

const createId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `view-${Math.random().toString(36).slice(2, 10)}`
}

export const useProjectSavedViews = (
  userId: string | null | undefined
): UseProjectSavedViewsResult => {
  const storageKey = useMemo(() => buildStorageKey(userId), [userId])
  const [views, setViews] = useState<ProjectSavedView[]>(() => readViews(storageKey))
  const [selectedId, setSelectedId] = useState<string | null>(() => readSelectedId(storageKey))

  useEffect(() => {
    setViews(readViews(storageKey))
    setSelectedId(readSelectedId(storageKey))
  }, [storageKey])

  useEffect(() => {
    persist(storageKey, views, selectedId)
  }, [storageKey, views, selectedId])

  const saveView = useCallback((name: string, filters: ProjectViewFilters) => {
    const trimmedName = name.trim()
    const newView: ProjectSavedView = {
      id: createId(),
      name: trimmedName.length > 0 ? trimmedName : new Date().toLocaleString(),
      filters,
      createdAt: new Date().toISOString()
    }
    setViews((current) => {
      const withoutDuplicate = current.filter((view) => view.name !== newView.name)
      return [...withoutDuplicate, newView]
    })
    setSelectedId(newView.id)
    return newView
  }, [])

  const deleteView = useCallback((id: string) => {
    setViews((current) => current.filter((view) => view.id !== id))
    setSelectedId((current) => (current === id ? null : current))
  }, [])

  const selectView = useCallback((id: string | null) => {
    setSelectedId(id)
  }, [])

  const getViewById = useCallback((id: string) => views.find((view) => view.id === id), [views])

  return {
    views,
    selectedId,
    saveView,
    deleteView,
    selectView,
    getViewById
  }
}

export default useProjectSavedViews
