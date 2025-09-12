import type { JSX } from 'react'
import { Breadcrumb, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

import { ProjectsActionBar } from '@renderer/pages/Projects/components/ProjectsActionBar'
import { ProjectList } from '@renderer/pages/Projects/components/ProjectList'
import { ProjectCardsGrid } from '@renderer/pages/Projects/components/ProjectCardsGrid'
import { CreateProjectModal } from '@renderer/pages/Projects/components/CreateProjectModal'
import { useProjectsPage } from '@renderer/pages/Projects/hooks/useProjectsPage'
import { PROJECTS_CONTAINER_STYLE, createProjectsBreadcrumb } from '@renderer/pages/Projects/Projects.helpers'
import type { ProjectsPageProps } from '@renderer/pages/Projects/Projects.types'

const ProjectsPage = ({}: ProjectsPageProps): JSX.Element => {
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
    createdBetween,
    setCreatedBetween,
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
  const [cardPage, setCardPage] = useState(1)
  const CARD_PAGE_SIZE = 8

  const handleOpenProject = (projectId: string) => {
    navigate(`/projects/${projectId}`)
  }

  const breadcrumbItems = useMemo(() => createProjectsBreadcrumb(t), [t])

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

  return (
    <div style={PROJECTS_CONTAINER_STYLE}>
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
          page={cardPage}
          pageSize={CARD_PAGE_SIZE}
          onPageChange={setCardPage}
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

ProjectsPage.displayName = 'ProjectsPage'

export { ProjectsPage }
export default ProjectsPage




