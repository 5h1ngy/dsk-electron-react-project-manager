import type { TFunction } from 'i18next'
import type { NavigateFunction } from 'react-router-dom'

import type { TaskDetails } from '@renderer/store/slices/tasks/types'

export interface TaskDetailsPageProps {}

export interface LoadState {
  loading: boolean
  error?: string
}

export interface TagDescriptor {
  label: string
  color: string
}

export interface BreadcrumbParams {
  t: TFunction<'projects'>
  task: TaskDetails | null
  navigate: NavigateFunction
}
