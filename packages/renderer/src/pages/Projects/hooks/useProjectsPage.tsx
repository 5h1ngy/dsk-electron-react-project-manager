import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { message } from 'antd'
import { useTranslation } from 'react-i18next'

import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import {
  clearProjectsError,
  createProject,
  updateProject,
  deleteProject,
  fetchProjects,
  selectProjects,
  selectProjectsError,
  selectProjectsMutationStatus,
  selectProjectsStatus
} from '@renderer/store/slices/projects'
import type { ProjectSummary } from '@renderer/store/slices/projects'
import { selectCurrentUser } from '@renderer/store/slices/auth/selectors'
import { useProjectForms } from '@renderer/pages/Projects/hooks/useProjectForms'
import type { CreateProjectValues, UpdateProjectValues } from '@renderer/pages/Projects/schemas/projectSchemas'

type ViewMode = 'table' | 'cards'
type RoleFilter = 'all' | 'admin' | 'edit' | 'view'
type CreatedRange = [string | null, string | null] | null

export interface UseProjectsPageOptions {
  onProjectCreated?: (projectId: string) => void
}

export interface UseProjectsPageResult {
  messageContext: ReactNode
  projects: ProjectSummary[]
  filteredProjects: ProjectSummary[]
  listStatus: ReturnType<typeof selectProjectsStatus>
  mutationStatus: ReturnType<typeof selectProjectsMutationStatus>
  activeMutation: 'create' | 'update' | 'delete' | null
  search: string
  setSearch: (value: string) => void
  selectedTags: string[]
  setSelectedTags: (tags: string[]) => void
  availableTags: string[]
  roleFilter: RoleFilter
  setRoleFilter: (role: RoleFilter) => void
  ownedOnly: boolean
  setOwnedOnly: (value: boolean) => void
  createdBetween: CreatedRange
  setCreatedBetween: (range: CreatedRange) => void
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  openCreateModal: () => void
  closeCreateModal: () => void
  isCreateModalOpen: boolean
  handleCreateSubmit: () => Promise<void>
  createForm: ReturnType<typeof useProjectForms>['createForm']
  editingProject: ProjectSummary | null
  openEditModal: (project: ProjectSummary) => void
  closeEditModal: () => void
  isEditModalOpen: boolean
  handleUpdateSubmit: () => Promise<void>
  updateForm: ReturnType<typeof useProjectForms>['updateForm']
  handleDeleteProject: (project: ProjectSummary) => Promise<void>
  deletingProjectId: string | null
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
  const [createdBetween, setCreatedBetween] = useState<CreatedRange>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [isCreateModalOpen, setCreateModalOpen] = useState(false)
  const [messageApi, messageContext] = message.useMessage()

  const { createForm, updateForm } = useProjectForms()

  const canManageProjects = useMemo(
    () => (currentUser?.roles ?? []).some((role) => role === 'Admin' || role === 'Maintainer'),
    [currentUser?.roles]
  )

  const isLoading = listStatus === 'loading'
  const [editingProject, setEditingProject] = useState<ProjectSummary | null>(null)
  const [isEditModalOpen, setEditModalOpen] = useState(false)
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null)
  const [activeMutation, setActiveMutation] = useState<'create' | 'update' | 'delete' | null>(null)
  const resolveErrorMessage = useCallback(
    (err: unknown) =>
      typeof err === 'string'
        ? err
        : err instanceof Error
          ? err.message
          : t('errors.generic', { defaultValue: 'Operazione non riuscita' }),
    [t]
  )

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
      if (createdBetween) {
        const createdAt = new Date(project.createdAt).getTime()
        const [start, end] = createdBetween
        if (start && createdAt < new Date(start).getTime()) {
          return false
        }
        if (end && createdAt > new Date(end).getTime()) {
          return false
        }
      }
      return true
    })
  }, [projects, search, selectedTags, roleFilter, ownedOnly, createdBetween, currentUser?.id])

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
      setActiveMutation('create')
      const project = await dispatch(createProject(values)).unwrap()
      messageApi.success(t('create.success', { defaultValue: 'Progetto creato' }))
      setCreateModalOpen(false)
      createForm.reset()
      options?.onProjectCreated?.(project.id)
    } catch (err) {
      messageApi.error(resolveErrorMessage(err))
    } finally {
      setActiveMutation(null)
    }
  })

  const closeEditModal = useCallback(() => {
    setEditModalOpen(false)
    setEditingProject(null)
    updateForm.reset()
  }, [updateForm])

  const openEditModal = useCallback(
    (project: ProjectSummary) => {
      if (project.role !== 'admin') {
        messageApi.warning(
          t('permissions.updateDenied', {
            defaultValue: 'Solo gli amministratori del progetto possono aggiornarlo.'
          })
        )
        return
      }
      setEditingProject(project)
      updateForm.reset({
        name: project.name,
        description: project.description ?? '',
        tags: project.tags ?? []
      })
      setEditModalOpen(true)
    },
    [messageApi, t, updateForm]
  )

  const handleUpdateSubmit = updateForm.handleSubmit(async (values: UpdateProjectValues) => {
    if (!editingProject) {
      return
    }
    if (editingProject.role !== 'admin') {
      messageApi.warning(
        t('permissions.updateDenied', {
          defaultValue: 'Solo gli amministratori del progetto possono aggiornarlo.'
        })
      )
      return
    }
    const normalizedDescription =
      values.description && values.description.trim().length > 0
        ? values.description.trim()
        : null
    try {
      setActiveMutation('update')
      await dispatch(
        updateProject({
          projectId: editingProject.id,
          input: {
            name: values.name,
            description: normalizedDescription,
            tags: values.tags ?? []
          }
        })
      ).unwrap()
      messageApi.success(t('update.success', { defaultValue: 'Progetto aggiornato' }))
      closeEditModal()
    } catch (err) {
      messageApi.error(resolveErrorMessage(err))
    } finally {
      setActiveMutation(null)
    }
  })

  const handleDeleteProject = useCallback(
    async (project: ProjectSummary) => {
      if (project.role !== 'admin') {
        messageApi.warning(
          t('permissions.deleteDenied', {
            defaultValue: 'Solo gli amministratori del progetto possono eliminarlo.'
          })
        )
        return
      }
      try {
        setActiveMutation('delete')
        setDeletingProjectId(project.id)
        await dispatch(deleteProject(project.id)).unwrap()
        messageApi.success(t('delete.success', { defaultValue: 'Progetto eliminato' }))
        if (editingProject?.id === project.id) {
          closeEditModal()
        }
      } catch (err) {
        messageApi.error(resolveErrorMessage(err))
      } finally {
        setActiveMutation(null)
        setDeletingProjectId(null)
      }
    },
    [closeEditModal, dispatch, editingProject?.id, messageApi, resolveErrorMessage, t]
  )

  return {
    messageContext,
    projects,
    filteredProjects,
    listStatus,
    mutationStatus,
    activeMutation,
    search,
    setSearch,
    selectedTags,
    setSelectedTags,
    availableTags,
    roleFilter,
    setRoleFilter,
    ownedOnly,
    setOwnedOnly,
    createdBetween,
    setCreatedBetween,
    viewMode,
    setViewMode,
    openCreateModal,
    closeCreateModal,
    isCreateModalOpen,
    handleCreateSubmit,
    createForm,
    editingProject,
    openEditModal,
    closeEditModal,
    isEditModalOpen,
    handleUpdateSubmit,
    updateForm,
    handleDeleteProject,
    deletingProjectId,
    canManageProjects,
    refreshProjects,
    isLoading
  }
}
