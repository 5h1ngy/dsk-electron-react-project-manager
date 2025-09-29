import type { FC } from 'react'
import { Breadcrumb, Button, Form, Input, Modal, Space, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

import { ReloadOutlined } from '@ant-design/icons'
import { ProjectsActionBar } from '@renderer/pages/Projects/components/ProjectsActionBar'
import { ProjectList } from '@renderer/pages/Projects/components/ProjectList'
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
import { ShellHeaderPortal } from '@renderer/layout/Shell/ShellHeader.context'
import { usePrimaryBreadcrumb } from '@renderer/layout/Shell/hooks/usePrimaryBreadcrumb'

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

  const handleOpenProject = (projectId: string) => {
    navigate(`/projects/${projectId}`)
  }

  const breadcrumbItems = useMemo(() => createProjectsBreadcrumb(t), [t])
  const emphasizedBreadcrumbItems = usePrimaryBreadcrumb(breadcrumbItems)

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

  const savedViewControls = (
    <ProjectSavedViewsControls
      views={savedViews}
      selectedViewId={selectedSavedViewId}
      onSelect={selectSavedView}
      onCreate={handleOpenSaveViewModal}
      onDelete={deleteSavedView}
    />
  )

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
          <Breadcrumb items={emphasizedBreadcrumbItems} />
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
        />
      </div>
      {viewMode === 'table' ? (
        <ProjectList
          projects={filteredProjects}
          loading={isLoading}
          onSelect={handleOpenProject}
          onEdit={openEditModal}
          onDelete={handleDeleteProject}
          deletingProjectId={activeMutation === 'delete' ? deletingProjectId : null}
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
          onDelete={handleDeleteProject}
          deletingProjectId={activeMutation === 'delete' ? deletingProjectId : null}
        />
      ) : null}
      {viewMode === 'list' ? (
        <ProjectSummaryList
          projects={filteredProjects}
          loading={isLoading}
          onSelect={handleOpenProject}
          onEdit={openEditModal}
          onDelete={handleDeleteProject}
          deletingProjectId={activeMutation === 'delete' ? deletingProjectId : null}
          page={listPage}
          pageSize={LIST_PAGE_SIZE}
          onPageChange={setListPage}
        />
      ) : null}
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
