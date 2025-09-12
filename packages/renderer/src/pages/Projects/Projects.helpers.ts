import type { CSSProperties } from 'react'
import type { TFunction } from 'i18next'
import type { ProjectsBreadcrumbItems } from '@renderer/pages/Projects/Projects.types'

export const PROJECTS_CONTAINER_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 24
}

export const createProjectsBreadcrumb = (t: TFunction): ProjectsBreadcrumbItems => [
  {
    title: t('breadcrumbs.projects')
  }
]
