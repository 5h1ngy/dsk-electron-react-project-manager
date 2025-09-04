import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { message } from 'antd'
import { useTranslation } from 'react-i18next'

import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import {
  addProjectMember,
  clearProjectsError,
  createProject,
  fetchProjectById,
  fetchProjects,
  removeProjectMember,
  selectProject,
  selectProjects,
  selectProjectsError,
  selectProjectsMutationStatus,
  selectProjectsStatus,
  selectSelectedProject,
  selectSelectedProjectId,
  updateProject
} from '@renderer/store/slices/projects'
import type { ProjectDetails } from '@renderer/store/slices/projects'
import { useProjectForms } from './useProjectForms'
import type { CreateProjectValues, UpdateProjectValues } from '../schemas/projectSchemas'
import type { ProjectMemberRoleInput } from '@main/services/projectValidation'
import { selectCurrentUser } from '@renderer/store/slices/auth/selectors'

export interface UseProjectsPageResult {
  messageContext: ReactNode
  projects: ReturnType<typeof selectProjects>
  filteredProjects: ReturnType<typeof selectProjects>
  selectedProject: ProjectDetails | null
  selectedProjectId: string | null
  listStatus: ReturnType<typeof selectProjectsStatus>
  mutationStatus: ReturnType<typeof selectProjectsMutationStatus>
  filter: string
  setFilter: (value: string) => void
  isCreateModalOpen: boolean
  openCreateModal: () => void
  closeCreateModal: () => void
  handleCreateSubmit: () => void
  handleUpdateSubmit: () => void
  selectProjectById: (projectId: string) => void
  refreshProjects: () => void
  isLoading: boolean
  createForm: ReturnType<typeof useProjectForms>['createForm']
  updateForm: ReturnType<typeof useProjectForms>['updateForm']
  addMember: (projectId: string, userId: string, role: ProjectMemberRoleInput) => Promise<void>
  removeMember: (projectId: string, userId: string) => Promise<void>
  canManageProjects: boolean
}

export const useProjectsPage = (initialProjectId?: string | null): UseProjectsPageResult => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation('projects')
  const projects = useAppSelector(selectProjects)
  const listStatus = useAppSelector(selectProjectsStatus)
  const mutationStatus = useAppSelector(selectProjectsMutationStatus)
  const selectedProjectId = useAppSelector(selectSelectedProjectId)
  const selectedProject = useAppSelector(selectSelectedProject)
  const error = useAppSelector(selectProjectsError)
  const currentUser = useAppSelector(selectCurrentUser)
  const canManageProjects = (currentUser?.roles ?? []).some(
    (role) => role === 'Admin' || role === 'Maintainer'
  )
  const [filter, setFilter] = useState('')
  const [messageApi, messageContext] = message.useMessage()
  const [isCreateModalOpen, setCreateModalOpen] = useState(false)

  const { createForm, updateForm } = useProjectForms()

  const isLoading = listStatus === 'loading'

  useEffect(() => {
    if (selectedProject) {
      updateForm.reset({
        name: selectedProject.name,
        description: selectedProject.description ?? null
      })
    }
  }, [selectedProject, updateForm])

  useEffect(() => {
    if (listStatus === 'idle') {
      void dispatch(fetchProjects())
    }
  }, [dispatch, listStatus])

  useEffect(() => {
    if (initialProjectId) {
      dispatch(selectProject(initialProjectId))
      void dispatch(fetchProjectById(initialProjectId))
    }
  }, [dispatch, initialProjectId])

  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      dispatch(selectProject(projects[0].id))
    }
  }, [dispatch, projects, selectedProjectId])

  useEffect(() => {
    if (selectedProjectId && !selectedProject) {
      void dispatch(fetchProjectById(selectedProjectId))
    }
  }, [dispatch, selectedProjectId, selectedProject])

  useEffect(() => {
    if (error) {
      messageApi.error(error, 4, () => {
        dispatch(clearProjectsError())
      })
    }
  }, [dispatch, error, messageApi])

  const filteredProjects = useMemo(() => {
    if (!filter.trim()) {
      return projects
    }
    const lowerFilter = filter.trim().toLowerCase()
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(lowerFilter) ||
        project.key.toLowerCase().includes(lowerFilter)
    )
  }, [filter, projects])

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
      description: null
    })
    setCreateModalOpen(true)
  }, [canManageProjects, createForm, messageApi, t])

  const closeCreateModal = useCallback(() => {
    setCreateModalOpen(false)
  }, [])

  const refreshProjects = useCallback(() => {
    void dispatch(fetchProjects())
    if (selectedProjectId) {
      void dispatch(fetchProjectById(selectedProjectId))
    }
  }, [dispatch, selectedProjectId])

  const handleCreateSubmit = createForm.handleSubmit(async (values: CreateProjectValues) => {
    try {
      if (!canManageProjects) {
        messageApi.warning(
          t('permissions.createDenied', {
            defaultValue: 'Solo gli amministratori o i manutentori possono creare progetti.'
          })
        )
        return
      }
      const project = await dispatch(createProject(values)).unwrap()
      messageApi.success(t('create.success', { defaultValue: 'Progetto creato' }))
      setCreateModalOpen(false)
      createForm.reset()
      dispatch(selectProject(project.id))
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
  const handleUpdateSubmit = updateForm.handleSubmit(async (values: UpdateProjectValues) => {
    if (!selectedProjectId) {
      return
    }
    if (!canManageProjects) {
      messageApi.warning(
        t('permissions.updateDenied', {
          defaultValue:
            'Solo gli amministratori o i manutentori possono modificare i progetti.'
        })
      )
      return
    }
    try {
      await dispatch(updateProject({ projectId: selectedProjectId, input: values })).unwrap()
      messageApi.success(t('update.success', { defaultValue: 'Progetto aggiornato' }))
      updateForm.reset(values)
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

  const selectProjectById = useCallback(
    (projectId: string) => {
      dispatch(selectProject(projectId))
      void dispatch(fetchProjectById(projectId))
    },
    [dispatch]
  )
  const addMember = useCallback(
    async (projectId: string, userId: string, role: ProjectMemberRoleInput) => {
      if (!canManageProjects) {
        messageApi.warning(
          t('permissions.manageMembersDenied', {
            defaultValue:
              'Solo gli amministratori o i manutentori possono gestire i membri del progetto.'
          })
        )
        return
      }
      try {
        await dispatch(addProjectMember({ projectId, userId, role })).unwrap()
        messageApi.success(t('members.addSuccess', { defaultValue: 'Membro aggiunto' }))
      } catch (err) {
        const messageText =
          typeof err === 'string'
            ? err
            : err instanceof Error
              ? err.message
              : t('errors.generic', { defaultValue: 'Operazione non riuscita' })
        messageApi.error(messageText)
      }
    },
    [canManageProjects, dispatch, messageApi, t]
  )
  const removeMember = useCallback(
    async (projectId: string, userId: string) => {
      if (!canManageProjects) {
        messageApi.warning(
          t('permissions.manageMembersDenied', {
            defaultValue:
              'Solo gli amministratori o i manutentori possono gestire i membri del progetto.'
          })
        )
        return
      }
      try {
        await dispatch(removeProjectMember({ projectId, userId })).unwrap()
        messageApi.success(t('members.removeSuccess', { defaultValue: 'Membro rimosso' }))
      } catch (err) {
        const messageText =
          typeof err === 'string'
            ? err
            : err instanceof Error
              ? err.message
              : t('errors.generic', { defaultValue: 'Operazione non riuscita' })
        messageApi.error(messageText)
      }
    },
    [canManageProjects, dispatch, messageApi, t]
  )

  return {
    messageContext,
    projects,
    filteredProjects,
    selectedProject,
    selectedProjectId,
    listStatus,
    mutationStatus,
    filter,
    setFilter,
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,
    handleCreateSubmit,
    handleUpdateSubmit,
    selectProjectById,
    refreshProjects,
    isLoading,
    createForm,
    updateForm,
    addMember,
    removeMember,
    canManageProjects
  }
}









