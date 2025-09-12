import { Card, Col, Pagination, Row, Space, Tag, Typography } from 'antd'
import { useMemo, type JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { EmptyState, LoadingSkeleton } from '@renderer/components/DataStates'
import { useDelayedLoading } from '@renderer/hooks/useDelayedLoading'
import type { UserDTO } from '@main/services/auth'
import type { RoleName } from '@main/services/auth/constants'

const CARD_BODY_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: 12,
  height: '100%'
} as const

export interface UserCardsGridProps {
  users: UserDTO[]
  loading: boolean
  page: number
  pageSize: number
  onPageChange: (page: number) => void
}

export const UserCardsGrid = ({
  users,
  loading,
  page,
  pageSize,
  onPageChange
}: UserCardsGridProps): JSX.Element => {
  const { t } = useTranslation('dashboard')
  const showSkeleton = useDelayedLoading(loading)

  const { items, totalPages } = useMemo(() => {
    const total = users.length
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return {
      items: users.slice(start, end),
      totalPages: Math.max(1, Math.ceil(total / pageSize))
    }
  }, [page, pageSize, users])

  if (showSkeleton) {
    return <LoadingSkeleton variant="cards" />
  }

  if (users.length === 0) {
    return <EmptyState title={t('table.empty')} />
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        {items.map((user) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={user.id}>
            <Card hoverable style={{ height: '100%' }} bodyStyle={CARD_BODY_STYLE}>
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <Typography.Title level={5} style={{ margin: 0 }}>
                  {user.displayName || user.username}
                </Typography.Title>
                <Typography.Text type="secondary" ellipsis>
                  @{user.username}
                </Typography.Text>
                <Space size={6} wrap>
                  {user.roles.map((role: RoleName) => (
                    <Tag key={role} color="blue">
                      {t(`roles.${role}`, { defaultValue: role })}
                    </Tag>
                  ))}
                </Space>
              </Space>
              <Space direction="vertical" size={4}>
                <Typography.Text type="secondary">
                  {user.isActive ? t('status.active') : t('status.inactive')}
                </Typography.Text>
                {user.lastLoginAt ? (
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
                ) : null}
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
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

