import { Typography } from 'antd'
import type { BreadcrumbProps, TabsProps } from 'antd'
import type { TFunction } from 'i18next'
import type { NavigateFunction } from 'react-router-dom'

import type { ProjectDetails } from '@renderer/store/slices/projects/types'
import type { ProjectTabKey } from '@renderer/pages/ProjectLayout/ProjectLayout.types'

interface BreadcrumbParams {
  t: TFunction<'projects'>
  project: ProjectDetails | null
  tabLabelMap: Record<ProjectTabKey, string>
  activeKey: ProjectTabKey
  navigate: NavigateFunction
}

export const resolveActiveTab = (pathname: string, basePath: string): ProjectTabKey => {
  if (pathname.startsWith(`${basePath}/notes`)) {
    return 'notes'
  }
  if (pathname.startsWith(`${basePath}/tasks`)) {
    return 'tasks'
  }
  return 'overview'
}

export const buildTabItems = (t: TFunction<'projects'>): TabsProps['items'] => [
  { key: 'overview', label: t('details.tabs.overview') },
  { key: 'tasks', label: t('details.tabs.tasks') },
  { key: 'notes', label: t('details.tabs.notes') }
]

export const buildTabLabelMap = (t: TFunction<'projects'>): Record<ProjectTabKey, string> => ({
  overview: t('breadcrumbs.overview'),
  tasks: t('breadcrumbs.tasks'),
  notes: t('breadcrumbs.notes')
})

const renderBreadcrumbLink = (label: string, handler?: () => void) =>
  handler ? <Typography.Link onClick={handler}>{label}</Typography.Link> : <Typography.Text>{label}</Typography.Text>

export const buildBreadcrumbItems = ({
  t,
  project,
  tabLabelMap,
  activeKey,
  navigate
}: BreadcrumbParams): BreadcrumbProps['items'] => {
  const items: BreadcrumbProps['items'] = [
    {
      title: renderBreadcrumbLink(t('breadcrumbs.projects'), () => navigate('/projects'))
    }
  ]

  if (project) {
    items.push({
      title: renderBreadcrumbLink(project.name, () => navigate(`/projects/${project.id}`))
    })
  }

  items.push({
    title: renderBreadcrumbLink(tabLabelMap[activeKey])
  })

  return items
}
