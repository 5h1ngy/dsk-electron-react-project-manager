import { Button, Card, Flex, Progress, Space, Typography, theme } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import type { TaskStatusItem } from '@renderer/store/slices/taskStatuses'
import type { TaskDetails } from '@renderer/store/slices/tasks'
import { useMemo } from 'react'

export interface TaskBoardStatusPanelProps {
  open: boolean
  onClose: () => void
  tasks: TaskDetails[]
  statuses: TaskStatusItem[]
}

export const TaskBoardStatusPanel = ({
  open,
  onClose,
  tasks,
  statuses
}: TaskBoardStatusPanelProps) => {
  const { token } = theme.useToken()
  const { t, i18n } = useTranslation('projects')
  const marginLg = token.marginLG ?? 16
  const stickyOffset = marginLg + 48

  const distribution = useMemo(() => {
    const map = new Map<string, { label: string; count: number }>()
    statuses.forEach((status) =>
      map.set(status.key, {
        label: status.label,
        count: 0
      })
    )
    tasks.forEach((task) => {
      const target = map.get(task.status)
      if (target) {
        target.count += 1
      } else {
        map.set(task.status, {
          label: task.status,
          count: 1
        })
      }
    })
    return Array.from(map.entries()).map(([key, value]) => ({
      key,
      ...value
    }))
  }, [statuses, tasks])

  const totalTasks = tasks.length

  if (!open) {
    return null
  }

  return (
    <div
      style={{
        width: '100%',
        position: 'sticky',
        top: stickyOffset,
        zIndex: 2,
        marginBottom: marginLg
      }}
    >
      <Card
        size="small"
        style={{
          width: '100%',
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowSecondary
        }}
        styles={{
          body: {
            display: 'flex',
            flexDirection: 'column',
            gap: marginLg,
            padding: marginLg
          }
        }}
      >
        <Flex
          align="center"
          justify="space-between"
          wrap
          gap={12}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" size={4}>
            <Typography.Text type="secondary">
              {t('board.statusPanel.title', { defaultValue: 'Stato kanban' })}
            </Typography.Text>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {t('board.taskCount', { count: totalTasks })}
            </Typography.Title>
          </Space>
          <Button
            size="small"
            icon={<CloseOutlined />}
            onClick={onClose}
            type="text"
            aria-label={t('board.statusPanel.close', { defaultValue: 'Chiudi pannello' })}
          />
        </Flex>
        <Flex
          align="stretch"
          wrap
          gap={marginLg}
          style={{ width: '100%' }}
        >
          {distribution.map((entry) => {
            const percent =
              totalTasks === 0 ? 0 : Math.round((entry.count / totalTasks) * 100 * 10) / 10
            return (
              <Card
                key={entry.key}
                size="small"
                style={{
                  flex: '1 1 220px',
                  minWidth: 180,
                  borderRadius: token.borderRadius,
                  background: token.colorFillSecondary
                }}
                bodyStyle={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: token.paddingXS
                }}
              >
                <Flex justify="space-between" align="center">
                  <Typography.Text strong>{entry.label}</Typography.Text>
                  <Typography.Text type="secondary">
                    {new Intl.NumberFormat(i18n.language).format(entry.count)}
                  </Typography.Text>
                </Flex>
                <Progress
                  percent={percent}
                  showInfo={false}
                  strokeColor={token.colorPrimary}
                  trailColor={token.colorFillQuaternary}
                />
              </Card>
            )
          })}
        </Flex>
      </Card>
    </div>
  )
}

TaskBoardStatusPanel.displayName = 'TaskBoardStatusPanel'

export default TaskBoardStatusPanel

