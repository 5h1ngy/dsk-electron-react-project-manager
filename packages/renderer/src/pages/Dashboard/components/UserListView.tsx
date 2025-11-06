import { Button, Flex, List, Space, Tag, Typography, theme } from 'antd'
import { ClockCircleOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { useMemo, useState, type JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { EmptyState, LoadingSkeleton } from '@renderer/components/DataStates'
import { useDelayedLoading } from '@renderer/hooks/useDelayedLoading'
import type { UserDTO } from '@main/services/auth'
import { useSemanticBadges, buildBadgeStyle } from '@renderer/theme/hooks/useSemanticBadges'

export interface UserListViewProps {
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

export const UserListView = ({
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
}: UserListViewProps): JSX.Element => {
  const { t, i18n } = useTranslation('dashboard')
  const { token } = theme.useToken()
  const badgeTokens = useSemanticBadges()
  const showSkeleton = useDelayedLoading(loading && !hasLoaded)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const pagedUsers = useMemo(() => {
    const start = (page - 1) * pageSize
    return users.slice(start, start + pageSize)
  }, [page, pageSize, users])

  if (showSkeleton) {
    return <LoadingSkeleton layout="stack" />
  }

  if (users.length === 0) {
    return <EmptyState title={t('table.empty')} />
  }

  const formatLastLogin = (value: string | Date | null) => {
    if (!value) {
      return t('dashboard:status.inactive')
    }
    const date = value instanceof Date ? value : new Date(value)
    return t('filters.users.lastLogin', {
      date: new Intl.DateTimeFormat(i18n.language, {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).format(date)
    })
  }

  return (
    <List
      dataSource={pagedUsers}
      style={{ width: '100%' }}
      split={false}
      itemLayout="vertical"
      renderItem={(user) => {
        const statusBadge = user.isActive
          ? badgeTokens.userStatus.active
          : badgeTokens.userStatus.inactive
        const isHovered = hoveredId === user.id

        return (
          <List.Item
            key={user.id}
            style={{
              padding: token.paddingLG,
              borderRadius: token.borderRadiusLG,
              transition:
                'background-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
              backgroundColor: isHovered ? token.colorFillTertiary : token.colorBgContainer,
              boxShadow: isHovered ? token.boxShadowSecondary : 'none',
              border: `${token.lineWidth}px solid ${
                isHovered ? token.colorPrimaryBorder : token.colorBorderSecondary
              }`,
              transform: isHovered ? 'translateY(-2px)' : 'none'
            }}
            onMouseEnter={() => setHoveredId(user.id)}
            onMouseLeave={() => setHoveredId((current) => (current === user.id ? null : current))}
            actions={[
              <Button
                key="edit"
                type="default"
                icon={<EditOutlined />}
                onClick={() => onEdit(user)}
                size="middle"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {t('actions.edit')}
              </Button>,
              <Button
                key="delete"
                type="default"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onDelete(user)}
                loading={isDeleting(user.id)}
                disabled={deleteDisabled && !isDeleting(user.id)}
                size="middle"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {t('actions.delete')}
              </Button>
            ]}
          >
            <List.Item.Meta
              title={
                <Flex
                  align="center"
                  justify="space-between"
                  gap={token.marginSM}
                  wrap
                  style={{ width: '100%' }}
                >
                  <Space align="center" size={token.marginSM} wrap>
                    <Typography.Text strong>
                      {user.displayName && user.displayName.trim().length > 0
                        ? user.displayName
                        : user.username}
                    </Typography.Text>
                    <Typography.Text type="secondary">@{user.username}</Typography.Text>
                  </Space>
                  <Tag bordered={false} style={buildBadgeStyle(statusBadge)}>
                    {user.isActive ? t('status.active') : t('status.inactive')}
                  </Tag>
                </Flex>
              }
              description={
                <Flex vertical gap={token.marginXS} style={{ width: '100%' }}>
                  <Space size={token.marginXS} wrap>
                    {user.roles.map((role) => {
                      const badge = badgeTokens.userRole[role] ?? badgeTokens.userRole.Viewer
                      return (
                        <Tag key={role} bordered={false} style={buildBadgeStyle(badge)}>
                          {t(`roles.${role}`, { defaultValue: role })}
                        </Tag>
                      )
                    })}
                  </Space>
                  <Typography.Text
                    type="secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: token.marginXS }}
                  >
                    <ClockCircleOutlined />
                    {formatLastLogin(user.lastLoginAt ?? null)}
                  </Typography.Text>
                </Flex>
              }
            />
          </List.Item>
        )
      }}
      pagination={{
        current: page,
        total: users.length,
        pageSize,
        onChange: onPageChange,
        showSizeChanger: false,
        style: { marginTop: token.marginLG, textAlign: 'right' }
      }}
    />
  )
}

UserListView.displayName = 'UserListView'

export default UserListView
