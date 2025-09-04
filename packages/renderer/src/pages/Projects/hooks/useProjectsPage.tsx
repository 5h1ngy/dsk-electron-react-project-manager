import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { message } from 'antd'
import { useTranslation } from 'react-i18next'

import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import {
  clearProjectsError,
  createProject,
  fetchProjects,
  selectProjects,
  selectProjectsError,
  selectProjectsMutationStatus,
  selectProjectsStatus
} from '@renderer/store/slices/projects'
import type { ProjectSummary } from '@renderer/store/slices/projects'
import { selectCurrentUser } from '@renderer/store/slices/auth/selectors'
import { useProjectForms } from './useProjectForms'
import type { CreateProjectValues } from '../schemas/projectSchemas'

type ViewMode = 'table' | 'cards'
type RoleFilter = 'all' | 'admin' | 'edit' | 'view'

export interface UseProjectsPageOptions {
  onProjectCreated?: (projectId: string) => void
}

export interface UseProjectsPageResult {
  messageContext: ReactNode
  projects: ProjectSummary[]
  filteredProjects: ProjectSummary[]
  listStatus: ReturnType<typeof selectProjectsStatus>
  mutationStatus: ReturnType<typeof selectProjectsMutationStatus>
  search: string
  setSearch: (value: string) => void
  selectedTags: string[]
  setSelectedTags: (tags: string[]) => void
  availableTags: string[]
  roleFilter: RoleFilter
  setRoleFilter: (role: RoleFilter) => void
  ownedOnly: boolean
  setOwnedOnly: (value: boolean) => void
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  openCreateModal: () => void
  closeCreateModal: () => void
  isCreateModalOpen: boolean
  handleCreateSubmit: () => Promise<void>
  createForm: ReturnType<typeof useProjectForms>['createForm']
  canManageProjects: boolean
  refreshProjects: () => void
  isLoading: boolean
}

const matchesSearch = (project: ProjectSummary, needle: string): boolean => {
  const haystacks = [project.name, project.key, ...(project.tags ?? [])]
  return haystacks.some((value) => value.toLowerCase().includes(needle))
}

export const useProjectsPage = (options?: UseProjectsPageOptions): UseProjectsPageResult => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation('projects')
  const projects = useAppSelector(selectProjects)
  const listStatus = useAppSelector(selectProjectsStatus)
  const mutationStatus = useAppSelector(selectProjectsMutationStatus)
  const error = useAppSelector(selectProjectsError)
  const currentUser = useAppSelector(selectCurrentUser)

  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [ownedOnly, setOwnedOnly] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [isCreateModalOpen, setCreateModalOpen] = useState(false)
  const [messageApi, messageContext] = message.useMessage()

  const { createForm } = useProjectForms()

  const canManageProjects = useMemo(
    () => (currentUser?.roles ?? []).some((role) => role === 'Admin' || role === 'Maintainer'),
    [currentUser?.roles]
  )

  const isLoading = listStatus === 'loading'

  useEffect(() => {
    if (listStatus === 'idle') {
      void dispatch(fetchProjects())
    }
  }, [dispatch, listStatus])

  useEffect(() => {
    if (error) {
      messageApi.error(error, 4, () => {
        dispatch(clearProjectsError())
      })
    }
  }, [dispatch, error, messageApi])

  const availableTags = useMemo(() => {
    const set = new Set<string>()
    for (const project of projects) {
      for (const tag of project.tags ?? []) {
        set.add(tag)
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [projects])

  const filteredProjects = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return projects.filter((project) => {
      if (needle && !matchesSearch(project, needle)) {
        return false
      }
      if (selectedTags.length > 0) {
        const projectTags = project.tags ?? []
        const hasAllTags = selectedTags.every((tag) => projectTags.includes(tag))
        if (!hasAllTags) {
          return false
        }
      }
      if (roleFilter !== 'all' && project.role !== roleFilter) {
        return false
      }
      if (ownedOnly && project.createdBy !== currentUser?.id) {
        return false
      }
      return true
    })
  }, [projects, search, selectedTags, roleFilter, ownedOnly, currentUser?.id])

  const openCreateModal = useCallback(() => {
    if (!canManageProjects) {
      messageApi.warning(
        t('permissions.createDenied', {
          defaultValue: 'Solo gli amministratori o i manutentori possono creare progetti.'
        })
      )
      return
    }
    createForm.reset({
      key: '',
      name: '',
      description: null,
      tags: []
    })
    setCreateModalOpen(true)
  }, [canManageProjects, createForm, messageApi, t])

  const closeCreateModal = useCallback(() => {
    setCreateModalOpen(false)
  }, [])

  const refreshProjects = useCallback(() => {
    void dispatch(fetchProjects())
  }, [dispatch])

  const handleCreateSubmit = createForm.handleSubmit(async (values: CreateProjectValues) => {
    if (!canManageProjects) {
      messageApi.warning(
        t('permissions.createDenied', {
          defaultValue: 'Solo gli amministratori o i manutentori possono creare progetti.'
        })
      )
      return
    }
    try {
      const project = await dispatch(createProject(values)).unwrap()
      messageApi.success(t('create.success', { defaultValue: 'Progetto creato' }))
      setCreateModalOpen(false)
      createForm.reset()
      options?.onProjectCreated?.(project.id)
    } catch (err) {
      const messageText =
        typeof err === 'string'
          ? err
          : err instanceof Error
            ? err.message
            : t('errors.generic', { defaultValue: 'Operazione non riuscita' })
      messageApi.error(messageText)
    }
  })

  return {
    messageContext,
    projects,
    filteredProjects,
    listStatus,
    mutationStatus,
    search,
    setSearch,
    selectedTags,
    setSelectedTags,
    availableTags,
    roleFilter,
    setRoleFilter,
    ownedOnly,
    setOwnedOnly,
    viewMode,
    setViewMode,
    openCreateModal,
    closeCreateModal,
    isCreateModalOpen,
    handleCreateSubmit,
    createForm,
    canManageProjects,
    refreshProjects,
    isLoading
  }
}
