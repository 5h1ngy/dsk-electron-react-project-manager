import type { TFunction } from 'i18next'
import { List, Space, Tag, Typography } from 'antd'
import type { JSX } from 'react'

import { EmptyState } from '@renderer/components/DataStates'
import type { ProjectSummary } from '@renderer/store/slices/projects/types'
import type { RoleTagDescriptor } from '@renderer/pages/Dashboard/Dashboard.types'
import type { SemanticBadgeTokens } from '@renderer/theme/hooks/useSemanticBadges'
import { buildBadgeStyle } from '@renderer/theme/hooks/useSemanticBadges'

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
  badges: SemanticBadgeTokens
): JSX.Element => (
  <List
    dataSource={projects}
    rowKey="id"
    locale={{ emptyText: <EmptyState title={t('personal.noProjects')} /> }}
    renderItem={(project) => (
      <List.Item>
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Typography.Text strong>{project.name}</Typography.Text>
          <Space size={6} wrap>
            <Tag bordered={false} style={buildBadgeStyle(badges.projectKey)}>
              {project.key}
            </Tag>
            <Tag bordered={false} style={buildBadgeStyle(badges.projectRole[project.role])}>
              {t(`dashboard:roles.${project.role}`, { defaultValue: project.role })}
            </Tag>
          </Space>
          <Typography.Text type="secondary">
            {project.description ?? t('personal.noDescription')}
          </Typography.Text>
        </Space>
      </List.Item>
    )}
  />
)
