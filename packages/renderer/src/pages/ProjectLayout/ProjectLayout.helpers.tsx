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

type BreadcrumbItem = NonNullable<BreadcrumbProps['items']>[number]

export const resolveActiveTab = (pathname: string, basePath: string): ProjectTabKey => {
  if (pathname.startsWith(`${basePath}/sprints`)) {
    return 'sprints'
  }
  if (pathname.startsWith(`${basePath}/wiki`)) {
    return 'wiki'
  }
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
  { key: 'sprints', label: t('details.tabs.sprints', { defaultValue: 'Sprint' }) },
  { key: 'tasks', label: t('details.tabs.tasks') },
  { key: 'notes', label: t('details.tabs.notes') },
  { key: 'wiki', label: t('details.tabs.wiki') }
]

export const buildTabLabelMap = (t: TFunction<'projects'>): Record<ProjectTabKey, string> => ({
  overview: t('breadcrumbs.overview'),
  sprints: t('breadcrumbs.sprints', { defaultValue: 'Sprint' }),
  tasks: t('breadcrumbs.tasks'),
  notes: t('breadcrumbs.notes'),
  wiki: t('breadcrumbs.wiki')
})

export const buildBreadcrumbItems = ({
  t,
  project,
  tabLabelMap,
  activeKey,
  navigate
}: BreadcrumbParams): BreadcrumbProps['items'] => {
  const items: BreadcrumbItem[] = [
    {
      title: t('breadcrumbs.projects'),
      onClick: () => navigate('/projects')
    }
  ]

  if (project) {
    items.push({
      title: project.name,
      onClick: () => navigate(`/projects/${project.id}`)
    })
  }

  const tabItem: BreadcrumbItem = {
    title: tabLabelMap[activeKey]
  }

  if (project) {
    if (activeKey === 'sprints') {
      tabItem.onClick = () => navigate(`/projects/${project.id}/sprints`)
    } else if (activeKey === 'tasks') {
      tabItem.onClick = () => navigate(`/projects/${project.id}/tasks`)
    } else if (activeKey === 'notes') {
      tabItem.onClick = () => navigate(`/projects/${project.id}/notes`)
    } else if (activeKey === 'wiki') {
      tabItem.onClick = () => navigate(`/projects/${project.id}/wiki`)
    } else if (activeKey === 'overview') {
      tabItem.onClick = () => navigate(`/projects/${project.id}`)
    }
  }

  items.push(tabItem)

  return items
}
