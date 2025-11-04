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

const PANEL_WIDTH = 320

export const TaskBoardStatusPanel = ({
  open,
  onClose,
  tasks,
  statuses
}: TaskBoardStatusPanelProps) => {
  const { token } = theme.useToken()
  const { t, i18n } = useTranslation('projects')
  const marginLg = token.marginLG ?? 16
  const stickyOffset = marginLg * 2 + 64
  const maxPanelHeight = `calc(100vh - ${stickyOffset + marginLg}px)`

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

  return (
    <div
      style={{
        width: open ? PANEL_WIDTH : 0,
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        flexShrink: 0,
        pointerEvents: open ? 'auto' : 'none',
        position: 'sticky',
        top: stickyOffset,
        alignSelf: 'flex-start',
        maxHeight: maxPanelHeight,
        height: 'fit-content',
        zIndex: 1
      }}
    >
      <Card
        size="small"
        style={{
          height: '100%',
          maxHeight: maxPanelHeight,
          display: 'flex',
          flexDirection: 'column',
          gap: token.marginLG,
          borderRadius: token.borderRadiusLG,
          overflow: 'hidden'
        }}
        styles={{
          body: {
            display: 'flex',
            flexDirection: 'column',
            gap: token.marginLG,
            height: '100%',
            overflowY: 'auto'
          }
        }}
      >
        <Flex justify="space-between" align="center">
          <Typography.Text type="secondary">
            {t('board.statusPanel.title', { defaultValue: 'Stato kanban' })}
          </Typography.Text>
          <Button
            size="small"
            icon={<CloseOutlined />}
            onClick={onClose}
            type="text"
            aria-label={t('board.statusPanel.close', { defaultValue: 'Chiudi pannello' })}
          />
        </Flex>
        <Space direction="vertical" size={8}>
          <Typography.Text type="secondary">
            {t('board.statusPanel.total')}
          </Typography.Text>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {t('board.taskCount', { count: totalTasks })}
          </Typography.Title>
        </Space>
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          {distribution.map((entry) => {
            const percent =
              totalTasks === 0 ? 0 : Math.round((entry.count / totalTasks) * 100 * 10) / 10
            return (
              <Space key={entry.key} direction="vertical" size={4} style={{ width: '100%' }}>
                <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                  <Typography.Text style={{ fontWeight: 500 }}>
                    {entry.label}
                  </Typography.Text>
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
              </Space>
            )
          })}
        </Space>
      </Card>
    </div>
  )
}

TaskBoardStatusPanel.displayName = 'TaskBoardStatusPanel'

export default TaskBoardStatusPanel
