import { ReloadOutlined } from '@ant-design/icons'
import { Breadcrumb, Button, Empty, Space, Tabs, Typography } from 'antd'
import type { TabsProps } from 'antd'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom'

import type { ProjectDetails } from '@renderer/store/slices/projects'
import type { TaskDetails } from '@renderer/store/slices/tasks'

import { useProjectDetails } from '@renderer/pages/Projects/hooks/useProjectDetails'

type ProjectTabKey = 'overview' | 'tasks' | 'board'

export interface ProjectRouteContext {
  projectId: string
  project: ProjectDetails | null
  tasks: TaskDetails[]
  tasksStatus: string
  projectLoading: boolean
  refresh: () => void
  canManageTasks: boolean
}

export const useProjectRouteContext = (): ProjectRouteContext =>
  useOutletContext<ProjectRouteContext>()

const resolveActiveTab = (pathname: string, basePath: string): ProjectTabKey => {
  if (pathname.startsWith(`${basePath}/board`)) {
    return 'board'
  }
  if (pathname.startsWith(`${basePath}/tasks`)) {
    return 'tasks'
  }
  return 'overview'
}

const buildTabItems = (t: (key: string) => string): TabsProps['items'] => [
  { key: 'overview', label: t('details.tabs.overview') },
  { key: 'tasks', label: t('details.tabs.tasks') },
  { key: 'board', label: t('details.tabs.board') }
]

const ProjectLayout = (): JSX.Element => {
  const { projectId } = useParams<{ projectId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation('projects')

  const {
    project,
    tasks,
    tasksStatus,
    projectLoading,
    refresh,
    canManageTasks,
    messageContext
  } = useProjectDetails(projectId)

  const basePath = `/projects/${projectId ?? ''}`
  const activeKey = projectId ? resolveActiveTab(location.pathname, basePath) : 'overview'

  const tabItems = useMemo(() => buildTabItems(t), [t])

  const tabLabelMap: Record<ProjectTabKey, string> = {
    overview: t('breadcrumbs.overview'),
    tasks: t('breadcrumbs.tasks'),
    board: t('breadcrumbs.board')
  }

  const renderBreadcrumbLink = (label: string, path?: string) =>
    path ? (
      <Typography.Link onClick={() => navigate(path)}>{label}</Typography.Link>
    ) : (
      <Typography.Text>{label}</Typography.Text>
    )

  const breadcrumbItems = useMemo(() => {
    const items = [
      {
        title: renderBreadcrumbLink(t('breadcrumbs.projects'), '/projects')
      }
    ]
    if (project) {
      items.push({
        title: renderBreadcrumbLink(project.name, `/projects/${project.id}`)
      })
    }
    items.push({
      title: renderBreadcrumbLink(tabLabelMap[activeKey])
    })
    return items
  }, [t, project, tabLabelMap, activeKey, navigate])

  if (!projectId) {
    return (
      <Empty
        description={t('details.missingId')}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={{ marginTop: 64 }}
      />
    )
  }

  if (!project && !projectLoading) {
    return (
      <Empty
        description={t('details.notFound')}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={{ marginTop: 64 }}
      >
        <Button type="primary" onClick={() => navigate('/projects')}>
          {t('details.backToList')}
        </Button>
      </Empty>
    )
  }

  const contextValue: ProjectRouteContext = {
    projectId,
    project: project ?? null,
    tasks,
    tasksStatus,
    projectLoading,
    refresh,
    canManageTasks
  }

  const handleTabChange = (key: string): void => {
    const tabKey = key as ProjectTabKey
    switch (tabKey) {
      case 'tasks':
        navigate(`${basePath}/tasks`)
        break
      case 'board':
        navigate(`${basePath}/board`)
        break
      default:
        navigate(`${basePath}`)
        break
    }
  }

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      {messageContext}
      <Breadcrumb items={breadcrumbItems} />
      <Space
        align="center"
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap'
        }}
      >
        <div>
          <Typography.Title level={3} style={{ marginBottom: 0 }}>
            {project?.name ?? t('details.loading')}
          </Typography.Title>
          <Typography.Text type="secondary">{project?.key}</Typography.Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={refresh}>
          {t('details.refresh')}
        </Button>
      </Space>
      <Tabs
        activeKey={activeKey}
        items={tabItems}
        onChange={handleTabChange}
        destroyInactiveTabPane
      />
      <Outlet context={contextValue} />
    </Space>
  )
}

export default ProjectLayout
