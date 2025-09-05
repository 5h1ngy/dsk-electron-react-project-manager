import type { JSX } from 'react'
import { Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Breadcrumb } from 'antd'
import { useMemo } from 'react'

import { ProjectsActionBar } from './components/ProjectsActionBar'
import { ProjectList } from './components/ProjectList'
import { ProjectCardsGrid } from './components/ProjectCardsGrid'
import { CreateProjectModal } from './components/CreateProjectModal'
import { useProjectsPage } from './hooks/useProjectsPage'

const ProjectsPage = (): JSX.Element => {
  const { t } = useTranslation('projects')
  const navigate = useNavigate()
  const {
    messageContext,
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
  } = useProjectsPage({
    onProjectCreated: (projectId) => navigate(`/projects/${projectId}`)
  })

  const handleOpenProject = (projectId: string) => {
    navigate(`/projects/${projectId}`)
  }

  const breadcrumbItems = useMemo(
    () => [
      {
        title: t('breadcrumbs.projects')
      }
    ],
    [t]
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {messageContext}
      <Breadcrumb items={breadcrumbItems} />
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
          isCreating={mutationStatus === 'loading' && isCreateModalOpen}
          canCreate={canManageProjects}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          availableTags={availableTags}
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          ownedOnly={ownedOnly}
          onOwnedOnlyChange={setOwnedOnly}
        />
      </div>
      {viewMode === 'table' ? (
        <ProjectList
          projects={filteredProjects}
          loading={isLoading}
          onSelect={handleOpenProject}
        />
      ) : (
        <ProjectCardsGrid
          projects={filteredProjects}
          loading={isLoading}
          onSelect={handleOpenProject}
        />
      )}
      <CreateProjectModal
        open={isCreateModalOpen}
        onCancel={closeCreateModal}
        onSubmit={handleCreateSubmit}
        form={createForm}
        submitting={mutationStatus === 'loading'}
      />
    </div>
  )
}

export default ProjectsPage




