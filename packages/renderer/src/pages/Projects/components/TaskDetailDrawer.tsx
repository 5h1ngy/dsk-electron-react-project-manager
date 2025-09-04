import { Drawer, Space, Tag, Typography } from 'antd'

import type { TaskDetails } from '@renderer/store/slices/tasks'

export interface TaskDetailDrawerProps {
  task: TaskDetails | null
  open: boolean
  onClose: () => void
}

const priorityColors: Record<string, string> = {
  low: 'green',
  medium: 'blue',
  high: 'orange',
  critical: 'red'
}

const statusLabels: Record<TaskDetails['status'], string> = {
  todo: 'Da fare',
  in_progress: 'In corso',
  blocked: 'Bloccato',
  done: 'Completato'
}

export const TaskDetailDrawer = ({ task, open, onClose }: TaskDetailDrawerProps): JSX.Element => {
  return (
    <Drawer title={task?.title ?? 'Dettagli task'} open={open} onClose={onClose} width={420}>
      {task ? (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space size={8}>
            <Tag color={priorityColors[task.priority] ?? 'blue'}>{task.priority}</Tag>
            <Tag>{statusLabels[task.status]}</Tag>
          </Space>
          <div>
            <Typography.Text type="secondary">Descrizione</Typography.Text>
            <Typography.Paragraph>
              {task.description ?? 'Nessuna descrizione disponibile'}
            </Typography.Paragraph>
          </div>
          <div>
            <Typography.Text type="secondary">Assegnazione</Typography.Text>
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              Proprietario: {task.owner?.displayName ?? task.ownerUserId}
            </Typography.Paragraph>
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              Assegnato a: {task.assignee?.displayName ?? 'Non assegnato'}
            </Typography.Paragraph>
          </div>
          <div>
            <Typography.Text type="secondary">Tempistiche</Typography.Text>
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              Creato il {new Intl.DateTimeFormat('it-IT').format(new Date(task.createdAt))}
            </Typography.Paragraph>
            {task.dueDate ? (
              <Typography.Paragraph style={{ marginBottom: 0 }}>
                Scadenza: {new Intl.DateTimeFormat('it-IT').format(new Date(task.dueDate))}
              </Typography.Paragraph>
            ) : null}
          </div>
        </Space>
      ) : (
        <Typography.Paragraph type="secondary">
          Seleziona un task dalla board per visualizzare i dettagli
        </Typography.Paragraph>
      )}
    </Drawer>
  )
}
