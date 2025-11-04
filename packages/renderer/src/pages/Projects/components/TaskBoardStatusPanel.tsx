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
  const marginMd = token.marginMD ?? 12
  const marginLg = token.marginLG ?? 16

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
        bottom: marginLg,
        zIndex: 2,
        marginTop: marginLg
      }}
    >
      <Card
        size="small"
        style={{
          width: '100%',
          borderRadius: token.borderRadiusLG,
          background: token.colorBgContainer,
          boxShadow: token.boxShadowTertiary
        }}
        styles={{
          body: {
            display: 'flex',
            flexDirection: 'column',
            gap: marginMd,
            padding: marginMd
          }
        }}
      >
        <Flex
          align="center"
          justify="space-between"
          wrap
          gap={marginMd}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" size={0}>
            <Typography.Text type="secondary">
              {t('board.statusPanel.title', { defaultValue: 'Stato kanban' })}
            </Typography.Text>
            <Typography.Text strong style={{ fontSize: 16 }}>
              {t('board.taskCount', { count: totalTasks })}
            </Typography.Text>
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
          gap={marginMd}
          style={{ width: '100%' }}
        >
          {distribution.map((entry) => {
            const percent =
              totalTasks === 0 ? 0 : Math.round((entry.count / totalTasks) * 100 * 10) / 10
            return (
              <div
                key={entry.key}
                style={{
                  flex: '1 1 160px',
                  minWidth: 140,
                  background: token.colorFillSecondary,
                  borderRadius: token.borderRadiusLG,
                  padding: token.paddingXS,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: token.paddingXXS
                }}
              >
                <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                  <Typography.Text style={{ fontWeight: 600, fontSize: 12 }}>
                    {entry.label}
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {new Intl.NumberFormat(i18n.language).format(entry.count)}
                  </Typography.Text>
                </Flex>
                <Progress
                  percent={percent}
                  showInfo={false}
                  strokeColor={token.colorPrimary}
                  trailColor={token.colorFillQuaternary}
                  strokeWidth={6}
                />
              </div>
            )
          })}
        </Flex>
      </Card>
    </div>
  )
}

TaskBoardStatusPanel.displayName = 'TaskBoardStatusPanel'

export default TaskBoardStatusPanel

