import type { JSX } from 'react'
import { Breadcrumb, Form, Input, Modal, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

import { ProjectsActionBar } from '@renderer/pages/Projects/components/ProjectsActionBar'
import { ProjectList } from '@renderer/pages/Projects/components/ProjectList'
import { ProjectCardsGrid } from '@renderer/pages/Projects/components/ProjectCardsGrid'
import { CreateProjectModal } from '@renderer/pages/Projects/components/CreateProjectModal'
import { EditProjectModal } from '@renderer/pages/Projects/components/EditProjectModal'
import ProjectSavedViewsControls from '@renderer/pages/Projects/components/ProjectSavedViewsControls'
import { useProjectsPage } from '@renderer/pages/Projects/hooks/useProjectsPage'
import { PROJECTS_CONTAINER_STYLE, createProjectsBreadcrumb } from '@renderer/pages/Projects/Projects.helpers'
import type { ProjectsPageProps } from '@renderer/pages/Projects/Projects.types'
import { ShellHeaderPortal } from '@renderer/layout/Shell/ShellHeader.context'
import { usePrimaryBreadcrumb } from '@renderer/layout/Shell/hooks/usePrimaryBreadcrumb'

const ProjectsPage = ({}: ProjectsPageProps): JSX.Element => {
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
  const [cardPage, setCardPage] = useState(1)
  const CARD_PAGE_SIZE = 8
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
  }, [viewMode])

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredProjects.length / CARD_PAGE_SIZE))
    if (cardPage > maxPage) {
      setCardPage(maxPage)
    }
  }, [filteredProjects.length, cardPage])

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
    } catch (error: any) {
      if (error?.errorFields) {
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
        <Breadcrumb items={emphasizedBreadcrumbItems} />
      </ShellHeaderPortal>
      {messageContext}
      <div>
        <Typography.Title level={3} style={{ marginBottom: 16 }}>
          {t('title')}
        </Typography.Title>
        <ProjectsActionBar
          onCreate={openCreateModal}
          onRefresh={refreshProjects}
          searchValue={search}
          onSearchChange={setSearch}
          isRefreshing={listStatus === 'loading'}
          isCreating={activeMutation === 'create'}
          canCreate={canManageProjects}
          viewMode={viewMode}
          onViewModeChange={(mode) => {
            setViewMode(mode)
            if (mode === 'cards') {
              setCardPage(1)
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
        />
      ) : (
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
      )}
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
        destroyOnClose
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





