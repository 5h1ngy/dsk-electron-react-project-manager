import { Avatar, Badge, Button, Flex, List, Space, Tag, Typography, theme } from 'antd'
import { ClockCircleOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { useMemo, useState, type JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { EmptyState, LoadingSkeleton } from '@renderer/components/DataStates'
import { useDelayedLoading } from '@renderer/hooks/useDelayedLoading'
import type { UserDTO } from '@services/services/auth'
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

  const getUserInitials = (user: UserDTO) => {
    const source = user.displayName && user.displayName.trim().length > 0 ? user.displayName : user.username
    const [first = '', second = ''] = source.trim().split(' ')
    const initials = `${first.charAt(0)}${second.charAt(0)}`.toUpperCase()
    if (initials.trim().length === 0 && user.username) {
      return user.username.slice(0, 2).toUpperCase()
    }
    return initials
  }

  const renderActions = (user: UserDTO) => (
    <Space size={token.marginSM} wrap>
      <Button
        type="text"
        icon={<EditOutlined />}
        onClick={() => onEdit(user)}
        disabled={deleteDisabled && isDeleting(user.id)}
      >
        {t('actions.edit')}
      </Button>
      <Button
        type="text"
        danger
        icon={<DeleteOutlined />}
        onClick={() => onDelete(user)}
        loading={isDeleting(user.id)}
        disabled={deleteDisabled && !isDeleting(user.id)}
      >
        {t('actions.delete')}
      </Button>
    </Space>
  )

  return (
    <List
      dataSource={pagedUsers}
      style={{ width: '100%' }}
      split={false}
      itemLayout="vertical"
      renderItem={(user) => {
        const statusSpec = user.isActive ? badgeTokens.userStatus.active : badgeTokens.userStatus.inactive
        const isHovered = hoveredId === user.id

        return (
          <List.Item
            key={user.id}
            style={{
              padding: token.paddingLG,
              borderRadius: token.borderRadius,
              transition:
                'background-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
              backgroundColor: isHovered ? token.colorFillTertiary : 'transparent',
              border: `${token.lineWidth}px solid ${
                isHovered ? token.colorPrimaryBorder : token.colorBorderSecondary
              }`,
              transform: isHovered ? 'translateY(-1px)' : 'none'
            }}
            onMouseEnter={() => setHoveredId(user.id)}
            onMouseLeave={() => setHoveredId((current) => (current === user.id ? null : current))}
          >
            <Flex
              align="stretch"
              justify="space-between"
              gap={token.marginLG}
              wrap
              style={{ width: '100%' }}
            >
              <Flex align="center" gap={token.marginMD} wrap>
                <Avatar
                  size={48}
                  style={{
                    backgroundColor: token.colorPrimaryBg,
                    color: token.colorPrimaryText,
                    fontWeight: 600
                  }}
                >
                  {getUserInitials(user)}
                </Avatar>
                <Flex vertical gap={token.marginXXS} style={{ minWidth: 180 }}>
                  <Typography.Text strong ellipsis={{ tooltip: user.displayName || user.username }}>
                    {user.displayName && user.displayName.trim().length > 0
                      ? user.displayName
                      : user.username}
                  </Typography.Text>
                  <Typography.Text type="secondary">@{user.username}</Typography.Text>
                  <Space size={token.marginXXS} wrap>
                    {user.roles.map((role) => {
                      const badge = badgeTokens.userRole[role] ?? badgeTokens.userRole.Viewer
                      return (
                        <Tag key={role} bordered={false} style={buildBadgeStyle(badge)}>
                          {t(`roles.${role}`, { defaultValue: role })}
                        </Tag>
                      )
                    })}
                  </Space>
                </Flex>
              </Flex>
              <Flex
                vertical
                align="flex-end"
                justify="space-between"
                gap={token.marginSM}
                style={{ flex: '1 1 240px' }}
              >
                <Flex align="center" gap={token.marginSM} wrap justify="flex-end">
                  <Badge
                    color={statusSpec.background}
                    text={
                      <Typography.Text style={{ color: statusSpec.color, fontWeight: 500 }}>
                        {user.isActive ? t('status.active') : t('status.inactive')}
                      </Typography.Text>
                    }
                  />
                  <Typography.Text type="secondary" style={{ display: 'flex', gap: token.marginXS }}>
                    <ClockCircleOutlined />
                    {formatLastLogin(user.lastLoginAt ?? null)}
                  </Typography.Text>
                </Flex>
                {renderActions(user)}
              </Flex>
            </Flex>
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
