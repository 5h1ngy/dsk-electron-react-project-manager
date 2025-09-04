import { Col, Empty, Row, Typography } from 'antd'
import { useParams } from 'react-router-dom'

import { ProjectsActionBar } from './components/ProjectsActionBar'
import { ProjectDetailsCard } from './components/ProjectDetailsCard'
import { ProjectList } from './components/ProjectList'
import { CreateProjectModal } from './components/CreateProjectModal'
import { ProjectBoard } from './components/ProjectBoard'
import { useProjectsPage } from './hooks/useProjectsPage'

const ProjectsPage = (): JSX.Element => {
  const { projectId: routeProjectId } = useParams<{ projectId?: string }>()
  const {
    messageContext,
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
    selectProjectById,
    refreshProjects,
    isLoading,
    createForm,
    canManageProjects
  } = useProjectsPage(routeProjectId ?? null)

  const detailsLoading = mutationStatus === 'loading' && !selectedProject
  const projectRole = selectedProject?.role ?? 'view'
  const canManageTasks =
    canManageProjects || (projectRole === 'admin' || projectRole === 'edit')

  return (
    <>
      {messageContext}
      <Row gutter={24}>
        <Col span={16}>
          <Typography.Title level={3} style={{ marginBottom: 24 }}>
            Progetti
          </Typography.Title>
          <ProjectsActionBar
            onCreate={openCreateModal}
            onRefresh={refreshProjects}
            searchValue={filter}
            onSearchChange={setFilter}
            isRefreshing={listStatus === 'loading'}
            isCreating={mutationStatus === 'loading' && isCreateModalOpen}
            canCreate={canManageProjects}
          />
          {filteredProjects.length === 0 && !isLoading ? (
            <Empty description="Nessun progetto trovato" />
          ) : (
            <ProjectList
              projects={filteredProjects}
              selectedProjectId={selectedProjectId}
              onSelect={selectProjectById}
              loading={isLoading}
            />
          )}
        </Col>
        <Col span={8}>
          <ProjectDetailsCard project={selectedProject} loading={detailsLoading} />
        </Col>
      </Row>
      <div style={{ marginTop: 32 }}>
        <ProjectBoard project={selectedProject} canManageTasks={canManageTasks} />
      </div>
      <CreateProjectModal
        open={isCreateModalOpen}
        onCancel={closeCreateModal}
        onSubmit={handleCreateSubmit}
        form={createForm}
        submitting={mutationStatus === 'loading'}
      />
    </>
  )
}

export default ProjectsPage
