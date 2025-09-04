import { Drawer, Space, Tag, Typography } from 'antd'
import { useTranslation } from 'react-i18next'

import type { TaskDetails } from '@renderer/store/slices/tasks'

export interface TaskDetailDrawerProps {
  task: TaskDetails | null
  open: boolean
  onClose: () => void
}

const priorityColors: Record<TaskDetails['priority'], string> = {
  low: 'green',
  medium: 'blue',
  high: 'orange',
  critical: 'red'
}

const statusColors: Record<TaskDetails['status'], string> = {
  todo: 'default',
  in_progress: 'blue',
  blocked: 'volcano',
  done: 'green'
}

export const TaskDetailDrawer = ({ task, open, onClose }: TaskDetailDrawerProps): JSX.Element => {
  const { t, i18n } = useTranslation('projects')

  return (
    <Drawer title={task?.title ?? t('details.drawer.title')} open={open} onClose={onClose} width={420}>
      {task ? (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space size={8}>
            <Tag color={priorityColors[task.priority]}>{t(`details.priority.${task.priority}`)}</Tag>
            <Tag color={statusColors[task.status]}>{t(`details.status.${task.status}`)}</Tag>
          </Space>
          <div>
            <Typography.Text type="secondary">{t('details.drawer.description')}</Typography.Text>
            <Typography.Paragraph>
              {task.description ?? t('details.summary.noDescription')}
            </Typography.Paragraph>
          </div>
          <div>
            <Typography.Text type="secondary">{t('details.drawer.assignment')}</Typography.Text>
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              {t('details.drawer.owner', {
                owner: task.owner?.displayName ?? task.ownerUserId
              })}
            </Typography.Paragraph>
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              {t('details.drawer.assignee', {
                assignee: task.assignee?.displayName ?? t('details.noAssignee')
              })}
            </Typography.Paragraph>
          </div>
          <div>
            <Typography.Text type="secondary">{t('details.drawer.timing')}</Typography.Text>
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              {t('details.drawer.createdAt', {
                date: new Intl.DateTimeFormat(i18n.language).format(new Date(task.createdAt))
              })}
            </Typography.Paragraph>
            {task.dueDate ? (
              <Typography.Paragraph style={{ marginBottom: 0 }}>
                {t('details.drawer.dueDate', {
                  date: new Intl.DateTimeFormat(i18n.language).format(new Date(task.dueDate))
                })}
              </Typography.Paragraph>
            ) : null}
          </div>
        </Space>
      ) : (
        <Typography.Paragraph type="secondary">
          {t('details.drawer.empty')}
        </Typography.Paragraph>
      )}
    </Drawer>
  )
}
