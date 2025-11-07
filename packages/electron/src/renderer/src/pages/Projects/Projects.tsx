import type { FC, Key } from 'react'
import { Breadcrumb, Button, Checkbox, Form, Input, Modal, Space, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import { ProjectsActionBar } from '@renderer/pages/Projects/components/ProjectsActionBar'
import {
  ProjectList,
  type ProjectOptionalColumn
} from '@renderer/pages/Projects/components/ProjectList'
import { ProjectCardsGrid } from '@renderer/pages/Projects/components/ProjectCardsGrid'
import { ProjectSummaryList } from '@renderer/pages/Projects/components/ProjectSummaryList'
import { CreateProjectModal } from '@renderer/pages/Projects/components/CreateProjectModal'
import { EditProjectModal } from '@renderer/pages/Projects/components/EditProjectModal'
import ProjectSavedViewsControls from '@renderer/pages/Projects/components/ProjectSavedViewsControls'
import { useProjectsPage } from '@renderer/pages/Projects/hooks/useProjectsPage'
import {
  PROJECTS_CONTAINER_STYLE,
  createProjectsBreadcrumb
} from '@renderer/pages/Projects/Projects.helpers'
import type { ProjectsPageProps } from '@renderer/pages/Projects/Projects.types'
import type { ProjectSummary } from '@renderer/store/slices/projects'
import { ShellHeaderPortal } from '@renderer/layout/Shell/ShellHeader.context'
import { usePrimaryBreadcrumb } from '@renderer/layout/Shell/hooks/usePrimaryBreadcrumb'
import { useBreadcrumbStyle } from '@renderer/layout/Shell/hooks/useBreadcrumbStyle'

const OPTIONAL_PROJECT_COLUMNS: ProjectOptionalColumn[] = ['owner']
const OPTIONAL_COLUMNS_STORAGE_KEY = 'projects:optionalColumns'

const ProjectsPage: FC<ProjectsPageProps> = () => {
  const { t } = useTranslation('projects')
  const navigate = useNavigate()
  const {
    messageContext,
    filteredProjects,
    listStatus,
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
    isLoading,
    savedViews,
    selectedSavedViewId,
    saveCurrentView,
    deleteSavedView,
    selectSavedView
  } = useProjectsPage({
    onProjectCreated: (projectId) => navigate(`/projects/${projectId}`)
  })
  const [tablePage, setTablePage] = useState(1)
  const [tablePageSize, setTablePageSize] = useState(10)
  const [cardPage, setCardPage] = useState(1)
  const [listPage, setListPage] = useState(1)
  const CARD_PAGE_SIZE = 8
  const LIST_PAGE_SIZE = 12
  const [saveViewForm] = Form.useForm<{ name: string }>()
  const [isSaveViewModalOpen, setSaveViewModalOpen] = useState(false)
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([])
  const [deleteTargets, setDeleteTargets] = useState<ProjectSummary[] | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const hasWindow = typeof window !== 'undefined'
  const hasOptionalColumns = OPTIONAL_PROJECT_COLUMNS.length > 0
  const [visibleOptionalColumns, setVisibleOptionalColumns] =
    useState<ProjectOptionalColumn[]>(OPTIONAL_PROJECT_COLUMNS)

  useEffect(() => {
    if (!hasWindow) {
      return
    }
    try {
      const stored = window.localStorage.getItem(OPTIONAL_COLUMNS_STORAGE_KEY)
      if (!stored) {
        return
      }
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        const valid = parsed.filter((item): item is ProjectOptionalColumn =>
          OPTIONAL_PROJECT_COLUMNS.includes(item as ProjectOptionalColumn)
        )
        if (valid.length > 0) {
          setVisibleOptionalColumns(valid)
        }
      }
    } catch {
      // ignore stored value errors
    }
  }, [hasWindow])

  useEffect(() => {
    if (!hasWindow) {
      return
    }
    try {
      window.localStorage.setItem(
        OPTIONAL_COLUMNS_STORAGE_KEY,
        JSON.stringify(visibleOptionalColumns)
      )
    } catch {
      // ignore persistence errors
    }
  }, [hasWindow, visibleOptionalColumns])

  const optionalColumnOptions = useMemo(
    () =>
      OPTIONAL_PROJECT_COLUMNS.map((column) => ({
        label: column === 'owner' ? t('list.columns.owner') : column,
        value: column
      })),
    [t]
  )

  const optionalFieldControls = useMemo(
    () => ({
      content: (
        <Checkbox.Group
          options={optionalColumnOptions}
          value={visibleOptionalColumns}
          onChange={(values) => setVisibleOptionalColumns(values as ProjectOptionalColumn[])}
        />
      ),
      hasOptions: hasOptionalColumns,
      disabled: viewMode !== 'table'
    }),
    [hasOptionalColumns, optionalColumnOptions, visibleOptionalColumns, viewMode]
  )

  const handleOpenProject = (projectId: string) => {
    navigate(`/projects/${projectId}`)
  }

  const breadcrumbItems = useMemo(() => createProjectsBreadcrumb(t), [t])
  const emphasizedBreadcrumbItems = usePrimaryBreadcrumb(breadcrumbItems)
  const breadcrumbStyle = useBreadcrumbStyle(emphasizedBreadcrumbItems)

  useEffect(() => {
    if (viewMode === 'cards') {
      setCardPage(1)
    }
    if (viewMode === 'list') {
      setListPage(1)
    }
  }, [viewMode])

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredProjects.length / tablePageSize))
    if (tablePage > maxPage) {
      setTablePage(maxPage)
    }
  }, [filteredProjects.length, tablePage, tablePageSize])

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredProjects.length / CARD_PAGE_SIZE))
    if (cardPage > maxPage) {
      setCardPage(maxPage)
    }
  }, [filteredProjects.length, cardPage])

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredProjects.length / LIST_PAGE_SIZE))
    if (listPage > maxPage) {
      setListPage(maxPage)
    }
  }, [filteredProjects.length, listPage])

  useEffect(() => {
    if (viewMode !== 'table' && selectedProjectIds.length > 0) {
      setSelectedProjectIds([])
    }
  }, [selectedProjectIds.length, viewMode])

  useEffect(() => {
    if (selectedProjectIds.length === 0) {
      return
    }
    const deletableIds = new Set(
      filteredProjects.filter((project) => project.role === 'admin').map((project) => project.id)
    )
    const cleaned = selectedProjectIds.filter((id) => deletableIds.has(id))
    if (cleaned.length !== selectedProjectIds.length) {
      setSelectedProjectIds(cleaned)
    }
  }, [filteredProjects, selectedProjectIds])

  const handleOpenSaveViewModal = () => {
    saveViewForm.resetFields()
    setSaveViewModalOpen(true)
  }

  const handleSaveView = async () => {
    try {
      const { name } = await saveViewForm.validateFields()
      const created = saveCurrentView(name)
      if (created) {
        setSaveViewModalOpen(false)
        saveViewForm.resetFields()
      }
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'errorFields' in error) {
        return
      }
    }
  }

  const openProjectDeleteConfirm = useCallback(
    (targets: ProjectSummary | ProjectSummary[]) => {
      if (!canManageProjects || deleteLoading) {
        return
      }
      const list = Array.isArray(targets) ? targets : [targets]
      const deletable = list.filter((project) => project.role === 'admin')
      if (deletable.length === 0) {
        return
      }
      setDeleteTargets(deletable)
    },
    [canManageProjects, deleteLoading]
  )

  const closeProjectDeleteConfirm = useCallback(() => {
    if (deleteLoading) {
      return
    }
    setDeleteTargets(null)
  }, [deleteLoading])

  const confirmProjectDelete = useCallback(async () => {
    if (!deleteTargets || deleteTargets.length === 0) {
      return
    }
    setDeleteLoading(true)
    const removedIds: string[] = []
    for (const project of deleteTargets) {
      const success = await handleDeleteProject(project)
      if (success) {
        removedIds.push(project.id)
      }
    }
    setDeleteLoading(false)
    setDeleteTargets(null)
    if (removedIds.length > 0) {
      setSelectedProjectIds((prev) => prev.filter((id) => !removedIds.includes(id)))
    }
  }, [deleteTargets, handleDeleteProject])

  const selectedProjects = useMemo(
    () =>
      filteredProjects.filter(
        (project) => selectedProjectIds.includes(project.id) && project.role === 'admin'
      ),
    [filteredProjects, selectedProjectIds]
  )

  const bulkDeleteButton = useMemo(() => {
    if (!canManageProjects || viewMode !== 'table') {
      return null
    }
    return (
      <Button
        key="bulk-delete-projects"
        icon={<DeleteOutlined />}
        danger
        onClick={() => openProjectDeleteConfirm(selectedProjects)}
        disabled={selectedProjects.length === 0 || deleteLoading}
        loading={deleteLoading}
      >
        {t('actions.deleteSelected', {
          count: selectedProjects.length,
          defaultValue:
            selectedProjects.length > 0
              ? `Delete selected (${selectedProjects.length})`
              : 'Delete selected'
        })}
      </Button>
    )
  }, [canManageProjects, viewMode, openProjectDeleteConfirm, selectedProjects, deleteLoading, t])

  const savedViewControls = (
    <ProjectSavedViewsControls
      views={savedViews}
      selectedViewId={selectedSavedViewId}
      onSelect={selectSavedView}
      onCreate={handleOpenSaveViewModal}
      onDelete={deleteSavedView}
    />
  )

  const isProjectDeleting = useCallback(
    (projectId: string) =>
      (activeMutation === 'delete' && deletingProjectId === projectId) ||
      (deleteLoading && Boolean(deleteTargets?.some((project) => project.id === projectId))),
    [activeMutation, deleteLoading, deleteTargets, deletingProjectId]
  )

  const deleteModalTitle = useMemo(() => {
    if (!deleteTargets || deleteTargets.length === 0) {
      return ''
    }
    if (deleteTargets.length === 1) {
      const [project] = deleteTargets
      return t('modals.deleteProject.title', {
        name: project.name,
        key: project.key
      })
    }
    return t('modals.deleteProject.bulkTitle', { count: deleteTargets.length })
  }, [deleteTargets, t])

  const deleteModalDescription = useMemo(() => {
    if (!deleteTargets || deleteTargets.length === 0) {
      return ''
    }
    if (deleteTargets.length === 1) {
      return t('modals.deleteProject.description')
    }
    return t('modals.deleteProject.bulkDescription', { count: deleteTargets.length })
  }, [deleteTargets, t])

  const deleteConfirmItems = useMemo(
    () =>
      deleteTargets?.map((project) => ({
        id: project.id,
        label: `${project.name} (${project.key})`
      })) ?? [],
    [deleteTargets]
  )

  const tableRowSelection = useMemo(() => {
    if (!canManageProjects) {
      return undefined
    }
    return {
      selectedRowKeys: selectedProjectIds,
      onChange: (keys: Key[]) => {
        setSelectedProjectIds(keys.map((key) => String(key)))
      },
      getCheckboxProps: (record: ProjectSummary) => ({
        disabled: record.role !== 'admin' || deleteLoading
      })
    }
  }, [canManageProjects, deleteLoading, selectedProjectIds])

  return (
    <div style={PROJECTS_CONTAINER_STYLE}>
      <ShellHeaderPortal>
        <Space align="center" size={12} wrap style={{ width: '100%' }}>
          <Button
            icon={<ReloadOutlined />}
            onClick={refreshProjects}
            loading={listStatus === 'loading'}
            disabled={listStatus === 'loading'}
          >
            {t('actions.refresh')}
          </Button>
          <Breadcrumb items={emphasizedBreadcrumbItems} style={breadcrumbStyle} />
        </Space>
      </ShellHeaderPortal>
      {messageContext}
      <div>
        <Typography.Title level={3} style={{ marginBottom: 16 }}>
          {t('title')}
        </Typography.Title>
        <ProjectsActionBar
          onCreate={openCreateModal}
          searchValue={search}
          onSearchChange={setSearch}
          isCreating={activeMutation === 'create'}
          canCreate={canManageProjects}
          viewMode={viewMode}
          onViewModeChange={(mode) => {
            setViewMode(mode)
            if (mode === 'table') {
              setTablePage(1)
            }
            if (mode === 'cards') {
              setCardPage(1)
            }
            if (mode === 'list') {
              setListPage(1)
            }
          }}
          availableTags={availableTags}
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          ownedOnly={ownedOnly}
          onOwnedOnlyChange={setOwnedOnly}
          createdBetween={createdBetween}
          onCreatedBetweenChange={setCreatedBetween}
          savedViewsControls={savedViewControls}
          optionalFieldControls={optionalFieldControls}
          primaryActions={bulkDeleteButton ? [bulkDeleteButton] : []}
        />
      </div>
      {viewMode === 'table' ? (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <ProjectList
            projects={filteredProjects}
            loading={isLoading}
            onSelect={handleOpenProject}
            onEdit={openEditModal}
            onDelete={openProjectDeleteConfirm}
            canManage={canManageProjects}
            isDeleting={isProjectDeleting}
            deleteDisabled={deleteLoading}
            rowSelection={tableRowSelection}
            visibleOptionalColumns={visibleOptionalColumns}
            pagination={{
              current: tablePage,
              pageSize: tablePageSize,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              onChange: (page, size) => {
                setTablePage(page)
                if (typeof size === 'number' && size !== tablePageSize) {
                  setTablePageSize(size)
                }
              }
            }}
          />
        </Space>
      ) : null}
      {viewMode === 'cards' ? (
        <ProjectCardsGrid
          projects={filteredProjects}
          loading={isLoading}
          onSelect={handleOpenProject}
          page={cardPage}
          pageSize={CARD_PAGE_SIZE}
          onPageChange={setCardPage}
          onEdit={openEditModal}
          onDelete={openProjectDeleteConfirm}
          canManage={canManageProjects}
          isDeleting={isProjectDeleting}
          deleteDisabled={deleteLoading}
        />
      ) : null}
      {viewMode === 'list' ? (
        <ProjectSummaryList
          projects={filteredProjects}
          loading={isLoading}
          onSelect={handleOpenProject}
          onEdit={openEditModal}
          onDelete={openProjectDeleteConfirm}
          canManage={canManageProjects}
          isDeleting={isProjectDeleting}
          deleteDisabled={deleteLoading}
          page={listPage}
          pageSize={LIST_PAGE_SIZE}
          onPageChange={setListPage}
        />
      ) : null}
      <Modal
        open={Boolean(deleteTargets && deleteTargets.length > 0)}
        title={deleteModalTitle}
        onCancel={closeProjectDeleteConfirm}
        onOk={() => void confirmProjectDelete()}
        okText={t('modals.deleteProject.confirm')}
        cancelText={t('modals.deleteProject.cancel')}
        okButtonProps={{
          danger: true,
          loading: deleteLoading,
          disabled: !deleteTargets || deleteTargets.length === 0
        }}
        cancelButtonProps={{ disabled: deleteLoading }}
        closable={!deleteLoading}
        maskClosable={false}
        destroyOnHidden
      >
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          {deleteModalDescription ? (
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              {deleteModalDescription}
            </Typography.Paragraph>
          ) : null}
          {deleteConfirmItems.length > 1 ? (
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              {deleteConfirmItems.map((item) => (
                <li key={item.id}>
                  <Typography.Text>{item.label}</Typography.Text>
                </li>
              ))}
            </ul>
          ) : null}
          <Typography.Text type="danger">{t('modals.deleteProject.warning')}</Typography.Text>
        </Space>
      </Modal>
      <CreateProjectModal
        open={isCreateModalOpen}
        onCancel={closeCreateModal}
        onSubmit={handleCreateSubmit}
        form={createForm}
        submitting={activeMutation === 'create'}
      />
      <EditProjectModal
        open={isEditModalOpen}
        onCancel={closeEditModal}
        onSubmit={handleUpdateSubmit}
        form={updateForm}
        submitting={activeMutation === 'update'}
        projectName={editingProject?.name}
        projectKey={editingProject?.key}
      />
      <Modal
        open={isSaveViewModalOpen}
        title={t('views.modal.title')}
        onCancel={() => setSaveViewModalOpen(false)}
        okText={t('views.modal.save')}
        cancelText={t('views.modal.cancel')}
        onOk={handleSaveView}
        destroyOnHidden
      >
        <Form form={saveViewForm} layout="vertical">
          <Form.Item
            name="name"
            label={t('views.modal.nameLabel')}
            rules={[
              {
                required: true,
                message: t('views.modal.nameRequired')
              }
            ]}
          >
            <Input maxLength={80} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

ProjectsPage.displayName = 'ProjectsPage'

export { ProjectsPage }
export default ProjectsPage
