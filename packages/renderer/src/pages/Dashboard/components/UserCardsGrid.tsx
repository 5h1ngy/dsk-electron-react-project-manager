import { Button, Card, Pagination, Space, Tag, Typography, theme } from 'antd'
import { useSemanticBadges, buildBadgeStyle } from '@renderer/theme/hooks/useSemanticBadges'
import {
  DeleteOutlined,
  EditOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ClockCircleOutlined
} from '@ant-design/icons'
import { useMemo, type JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { EmptyState, LoadingSkeleton } from '@renderer/components/DataStates'
import { useDelayedLoading } from '@renderer/hooks/useDelayedLoading'
import type { UserDTO } from '@main/services/auth'

const GRID_STYLE = {
  display: 'grid',
  width: '100%',
  gap: 16,
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))'
} as const

const CARD_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%'
} as const

const CARD_BODY_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: 12,
  flexGrow: 1
} as const

export interface UserCardsGridProps {
  users: UserDTO[]
  loading: boolean
  hasLoaded: boolean
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onEdit: (user: UserDTO) => void
  onDelete: (user: UserDTO) => void
  isDeleting: (userId: string) => boolean
  deleteDisabled?: boolean
}

export const UserCardsGrid = ({
  users,
  loading,
  hasLoaded,
  page,
  pageSize,
  onPageChange,
  onEdit,
  onDelete,
  isDeleting,
  deleteDisabled = false
}: UserCardsGridProps): JSX.Element => {
  const { t } = useTranslation('dashboard')
  const showSkeleton = useDelayedLoading(loading && !hasLoaded)
  const badgeTokens = useSemanticBadges()
  const { token } = theme.useToken()

  const items = useMemo(() => {
    const start = (page - 1) * pageSize
    return users.slice(start, start + pageSize)
  }, [page, pageSize, users])

  if (showSkeleton) {
    return <LoadingSkeleton variant="cards" />
  }

  if (users.length === 0) {
    return <EmptyState title={t('table.empty')} />
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={GRID_STYLE}>
        {items.map((user) => (
          <Card
            key={user.id}
            hoverable
            style={CARD_STYLE}
            styles={{ body: CARD_BODY_STYLE }}
            extra={
              <Space size={4}>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={(event) => {
                    event.stopPropagation()
                    onEdit(user)
                  }}
                >
                  {t('actions.edit')}
                </Button>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(event) => {
                    event.stopPropagation()
                    onDelete(user)
                  }}
                  loading={isDeleting(user.id)}
                  disabled={deleteDisabled && !isDeleting(user.id)}
                >
                  {t('actions.delete')}
                </Button>
              </Space>
            }
          >
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Typography.Title level={5} style={{ margin: 0 }}>
                {user.displayName || user.username}
              </Typography.Title>
              <Typography.Text type="secondary" ellipsis>
                @{user.username}
              </Typography.Text>
              <Space size={6} wrap>
                {user.roles.map((role) => {
                  const badge = badgeTokens.userRole[role] ?? badgeTokens.userRole.Viewer
                  return (
                    <Tag key={role} bordered={false} style={buildBadgeStyle(badge)}>
                      {t(`roles.${role}`, { defaultValue: role })}
                    </Tag>
                  )
                })}
              </Space>
            </Space>
            <Space direction="vertical" size={6} style={{ width: '100%' }}>
              <Space size={6} align="center">
                {user.isActive ? (
                  <CheckCircleFilled
                    style={{ color: badgeTokens.userStatus.active.color }}
                    aria-hidden
                  />
                ) : (
                  <CloseCircleFilled
                    style={{ color: badgeTokens.userStatus.inactive.color }}
                    aria-hidden
                  />
                )}
                <Typography.Text type="secondary">
                  {user.isActive ? t('status.active') : t('status.inactive')}
                </Typography.Text>
              </Space>
              {user.lastLoginAt ? (
                <Space size={6} align="center">
                  <ClockCircleOutlined style={{ color: token.colorTextSecondary }} aria-hidden />
                  <Typography.Text type="secondary">
                    {t('filters.users.lastLogin', {
                      defaultValue: 'Last login: {{date}}',
                      date: new Intl.DateTimeFormat(undefined, {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      }).format(new Date(user.lastLoginAt))
                    })}
                  </Typography.Text>
                </Space>
              ) : null}
            </Space>
          </Card>
        ))}
      </div>
      {users.length > pageSize ? (
        <Pagination
          current={page}
          total={users.length}
          pageSize={pageSize}
          onChange={onPageChange}
          showSizeChanger={false}
          style={{ alignSelf: 'center' }}
        />
      ) : null}
    </Space>
  )
}

UserCardsGrid.displayName = 'UserCardsGrid'

export default UserCardsGrid
