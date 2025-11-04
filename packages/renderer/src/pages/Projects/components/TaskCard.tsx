import { Button, Card, Flex, Space, Tag, Typography, theme } from 'antd'
import { useMemo, type DragEvent, type JSX } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  IdcardOutlined,
  MessageOutlined,
  UserOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

import type { TaskDetails } from '@renderer/store/slices/tasks'
import { useSemanticBadges, buildBadgeStyle } from '@renderer/theme/hooks/useSemanticBadges'

export interface TaskCardProps {
  task: TaskDetails
  onSelect: () => void
  onDragStart: (taskId: string, event: DragEvent<HTMLDivElement>) => void
  onEdit: () => void
  onDeleteRequest: () => void
  deleting?: boolean
  draggable?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

export const TaskCard = ({
  task,
  onSelect,
  onDragStart,
  onEdit,
  onDeleteRequest,
  deleting = false,
  draggable = true,
  canEdit = true,
  canDelete = true
}: TaskCardProps): JSX.Element => {
  const { t, i18n } = useTranslation('projects')
  const badgeTokens = useSemanticBadges()
  const { token } = theme.useToken()

  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    if (!draggable) {
      event.preventDefault()
      return
    }
    onDragStart(task.id, event)
  }

  const ownerName = task.owner?.displayName ?? task.owner?.username ?? null
  const assigneeName = task.assignee?.displayName ?? task.assignee?.username ?? null
  const summaryText = useMemo(() => {
    if (!task.description) {
      return null
    }
    const normalized = task.description
      .replace(/`{3}[\s\S]*?`{3}/g, ' ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[[^\]]*\]\([^)]*\)/g, '$1')
      .replace(/^\s{0,3}[-*+]\s+/gm, '')
      .replace(/^\s{0,3}\d+\.\s+/gm, '')
      .replace(/^>{1,6}\s+/gm, '')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/[*_~>#]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    return normalized.length > 0 ? normalized : null
  }, [task.description])
  const dueDate = task.dueDate ? dayjs(task.dueDate) : null
  const isOverdue = dueDate ? dueDate.isBefore(dayjs(), 'day') : false
  const dueDateLabel = dueDate
    ? new Intl.DateTimeFormat(i18n.language, {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).format(dueDate.toDate())
    : null

  return (
    <Card
      size="small"
      variant="borderless"
      style={{
        cursor: draggable ? 'grab' : 'default',
        opacity: draggable ? 1 : 0.8,
        borderRadius: token.borderRadius,
        background: token.colorBgElevated,
        border: `${token.lineWidth}px solid ${deleting ? token.colorErrorBorder : token.colorBorderSecondary}`,
        boxShadow: deleting ? token.boxShadowSecondary : token.boxShadowTertiary,
        transition: 'border 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease'
      }}
      hoverable
      draggable={draggable}
      onDragStart={handleDragStart}
      onClick={onSelect}
      styles={{ body: { padding: 12, display: 'flex', flexDirection: 'column', gap: 8 } }}
      extra={
        canEdit || canDelete ? (
          <Space size={4}>
            {canEdit ? (
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={(event) => {
                  event.stopPropagation()
                  onEdit()
                }}
              >
                {t('tasks.actions.edit')}
              </Button>
            ) : null}
            {canDelete ? (
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                loading={deleting}
                onClick={(event) => {
                  event.stopPropagation()
                  onDeleteRequest()
                }}
              >
                {t('tasks.actions.delete')}
              </Button>
            ) : null}
          </Space>
        ) : undefined
      }
    >
      <Space direction="vertical" size={6} style={{ width: '100%' }}>
        <Flex
          align="center"
          justify="space-between"
          wrap
          gap={8}
          style={{ width: '100%' }}
        >
          <Flex align="center" gap={6} wrap style={{ flex: '1 1 auto', minWidth: 0 }}>
            <Tag color={token.colorPrimary} style={{ margin: 0, flexShrink: 0 }}>
              {task.key}
            </Tag>
            <Typography.Text
              strong
              ellipsis={{ tooltip: task.title }}
              style={{ flex: '1 1 auto', minWidth: 0 }}
            >
              {task.title}
            </Typography.Text>
          </Flex>
          <Flex align="center" gap={4} wrap style={{ flexShrink: 0 }}>
            <Tag bordered={false} style={buildBadgeStyle(badgeTokens.priority[task.priority])}>
              {t(`details.priority.${task.priority}`)}
            </Tag>
            <Tag
              bordered={false}
              icon={<MessageOutlined />}
              style={buildBadgeStyle(badgeTokens.comment)}
            >
              {task.commentCount ?? 0}
            </Tag>
          </Flex>
        </Flex>
        <Flex gap={8} wrap style={{ lineHeight: 1.4 }}>
          {ownerName ? (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              <IdcardOutlined style={{ marginRight: 4 }} />
              {ownerName}
            </Typography.Text>
          ) : null}
          {assigneeName ? (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              <UserOutlined style={{ marginRight: 4 }} />
              {assigneeName}
            </Typography.Text>
          ) : null}
          {dueDateLabel ? (
            <Typography.Text
              style={{
                fontSize: 12,
                color: isOverdue ? token.colorError : token.colorTextSecondary,
                fontWeight: isOverdue ? 600 : 400
              }}
            >
              <CalendarOutlined style={{ marginRight: 4 }} />
              {dueDateLabel}
            </Typography.Text>
          ) : null}
        </Flex>
        {summaryText ? (
          <Typography.Paragraph
            type="secondary"
            ellipsis={{ rows: 2 }}
            style={{ marginBottom: 0 }}
          >
            {summaryText}
          </Typography.Paragraph>
        ) : null}
      </Space>
    </Card>
  )
}
