import type { JSX } from 'react'
import { Button, Modal, Popconfirm, Skeleton, Space, Tag, Typography } from 'antd'
import { CalendarOutlined, EditOutlined, UserOutlined, DeleteOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

import type { TaskDetails } from '@renderer/store/slices/tasks'
import { buildTags, formatDate } from '@renderer/pages/TaskDetails/TaskDetails.helpers'

export interface TaskDetailsModalProps {
  open: boolean
  task: TaskDetails | null
  loading?: boolean
  allowManage?: boolean
  onClose: () => void
  onEdit: (task: TaskDetails) => void
  onDelete: (task: TaskDetails) => Promise<void> | void
  deleting?: boolean
}

export const TaskDetailsModal = ({
  open,
  task,
  loading = false,
  allowManage = false,
  onClose,
  onEdit,
  onDelete,
  deleting = false
}: TaskDetailsModalProps): JSX.Element => {
  const { t, i18n } = useTranslation('projects')

  const tags = buildTags(task, (key) => t(key))

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={640} destroyOnClose>
      {loading ? (
        <Skeleton active title paragraph={{ rows: 5 }} />
      ) : task ? (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space
            align="start"
            style={{ justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: 12 }}
          >
            <Space direction="vertical" size={4}>
              <Typography.Text type="secondary">{task.key}</Typography.Text>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {task.title}
              </Typography.Title>
            </Space>
            {allowManage ? (
              <Space>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => onEdit(task)}
                  type="default"
                >
                  {t('tasks.actions.edit')}
                </Button>
                <Popconfirm
                  title={t('tasks.actions.deleteTitle')}
                  description={t('tasks.actions.deleteDescription', { title: task.title })}
                  okText={t('tasks.actions.deleteConfirm')}
                  cancelText={t('tasks.actions.cancel')}
                  onConfirm={() => onDelete(task)}
                  okButtonProps={{ loading: deleting }}
                >
                  <Button icon={<DeleteOutlined />} danger loading={deleting}>
                    {t('tasks.actions.delete')}
                  </Button>
                </Popconfirm>
              </Space>
            ) : null}
          </Space>

          <Space size={8} wrap>
            {tags.map((tag) => (
              <Tag key={tag.label} color={tag.color}>
                {tag.label}
              </Tag>
            ))}
          </Space>

          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Typography.Text type="secondary">{t('tasks.details.description')}</Typography.Text>
            <Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>
              {task.description ?? t('tasks.details.noDescription')}
            </Typography.Paragraph>
          </Space>

          <Space size={24} wrap>
            <Space size={6} align="center">
              <UserOutlined style={{ color: '#6366f1' }} aria-hidden />
              <Typography.Text type="secondary">
                {t('tasks.details.owner', {
                  owner: task.owner?.displayName ?? 'N/A'
                })}
              </Typography.Text>
            </Space>
            <Space size={6} align="center">
              <UserOutlined style={{ color: '#10b981' }} aria-hidden />
              <Typography.Text type="secondary">
                {task.assignee?.displayName ?? t('details.noAssignee')}
              </Typography.Text>
            </Space>
          </Space>

          <Space size={24} wrap>
            <Space size={6} align="center">
              <CalendarOutlined style={{ color: '#0ea5e9' }} aria-hidden />
              <Typography.Text type="secondary">
                {t('tasks.details.createdAt', {
                  date: formatDate(task.createdAt, i18n.language)
                })}
              </Typography.Text>
            </Space>
            <Space size={6} align="center">
              <CalendarOutlined style={{ color: '#f97316' }} aria-hidden />
              <Typography.Text type="secondary">
                {task.dueDate
                  ? formatDate(task.dueDate, i18n.language, t('details.noDueDate'))
                  : t('details.noDueDate')}
              </Typography.Text>
            </Space>
          </Space>
        </Space>
      ) : (
        <EmptyState />
      )}
    </Modal>
  )
}

const EmptyState = (): JSX.Element => {
  const { t } = useTranslation('projects')
  return (
    <Space direction="vertical" size="small" style={{ width: '100%', alignItems: 'center' }}>
      <Typography.Text type="secondary">{t('tasks.details.empty')}</Typography.Text>
    </Space>
  )
}

TaskDetailsModal.displayName = 'TaskDetailsModal'

export default TaskDetailsModal
