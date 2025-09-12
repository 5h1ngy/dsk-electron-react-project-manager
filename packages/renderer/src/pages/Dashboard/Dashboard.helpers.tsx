import type { TFunction } from 'i18next'
import { List, Space, Tag, Typography } from 'antd'
import type { JSX } from 'react'

import type { ProjectSummary } from '@renderer/store/slices/projects/types'
import type { RoleTagDescriptor } from '@renderer/pages/Dashboard/Dashboard.types'

export const mapRoleTags = (roles: string[] = [], t: TFunction): RoleTagDescriptor[] =>
  roles.map((role) => ({
    key: role,
    label: t(`dashboard:roles.${role}`, { defaultValue: role })
  }))

export const selectRecentProjects = (projects: ProjectSummary[], limit = 8): ProjectSummary[] =>
  projects.slice(0, limit)

export const renderProjectsList = (
  projects: ProjectSummary[],
  t: TFunction,
  isLoading: boolean
): JSX.Element => (
  <List
    loading={isLoading}
    dataSource={projects}
    rowKey="id"
    locale={{ emptyText: t('personal.noProjects') }}
    renderItem={(project) => (
      <List.Item>
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Typography.Text strong>{project.name}</Typography.Text>
          <Space size={6} wrap>
            <Tag color="blue">{project.key}</Tag>
            <Tag>{t(`dashboard:roles.${project.role}`, { defaultValue: project.role })}</Tag>
          </Space>
          <Typography.Text type="secondary">
            {project.description ?? t('personal.noDescription')}
          </Typography.Text>
        </Space>
      </List.Item>
    )}
  />
)
