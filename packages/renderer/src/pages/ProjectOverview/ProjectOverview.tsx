import type { JSX } from 'react'
import { Card, Col, List, Progress, Row, Skeleton, Space, Statistic, Typography, Flex, theme } from 'antd'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'

import { EmptyState } from '@renderer/components/DataStates'
import { useDelayedLoading } from '@renderer/hooks/useDelayedLoading'
import { ProjectDetailsCard } from '@renderer/pages/Projects/components/ProjectDetailsCard'
import { useProjectRouteContext } from '@renderer/pages/ProjectLayout'
import { calculateProjectInsights } from '@renderer/pages/ProjectOverview/ProjectOverview.helpers'
import type { DistributionItem, ProjectOverviewPageProps } from '@renderer/pages/ProjectOverview/ProjectOverview.types'

const ProjectOverviewPage = ({}: ProjectOverviewPageProps): JSX.Element => {
  const { project, projectLoading, tasks, taskStatuses } = useProjectRouteContext()
  const { t } = useTranslation('projects')
  const { token } = theme.useToken()
  const showSkeleton = useDelayedLoading(projectLoading)

  const insights = useMemo(() => calculateProjectInsights(tasks), [tasks])
  const statusOrder = useMemo(
    () => taskStatuses.map((status) => status.key),
    [taskStatuses]
  )

  const statusLabelMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const status of taskStatuses) {
      map.set(status.key, status.label)
    }
    return map
  }, [taskStatuses])

  const orderedStatusDistribution = useMemo(() => {
    if (statusOrder.length === 0) {
      return insights.statusDistribution
    }
    return [...insights.statusDistribution].sort((a, b) => {
      const indexA = statusOrder.indexOf(a.key)
      const indexB = statusOrder.indexOf(b.key)
      if (indexA === -1 && indexB === -1) {
        return b.count - a.count
      }
      if (indexA === -1) {
        return 1
      }
      if (indexB === -1) {
        return -1
      }
      return indexA - indexB
    })
  }, [insights.statusDistribution, statusOrder])

  const priorityOrder: Array<'critical' | 'high' | 'medium' | 'low'> = ['critical', 'high', 'medium', 'low']
  const orderedPriorityDistribution = useMemo(() => {
    const orderMap = new Map(priorityOrder.map((priority, index) => [priority, index]))
    return [...insights.priorityDistribution].sort((a, b) => {
      const indexA = orderMap.get(a.key as typeof priorityOrder[number]) ?? Number.MAX_SAFE_INTEGER
      const indexB = orderMap.get(b.key as typeof priorityOrder[number]) ?? Number.MAX_SAFE_INTEGER
      if (indexA === indexB) {
        return b.count - a.count
      }
      return indexA - indexB
    })
  }, [insights.priorityDistribution, priorityOrder])

  const metricCards = useMemo(
    () => [
      {
        key: 'total',
        title: t('details.overview.metrics.total'),
        value: insights.totals.total,
        color: token.colorText
      },
      {
        key: 'active',
        title: t('details.overview.metrics.active'),
        value: insights.totals.active,
        color: token.colorPrimary
      },
      {
        key: 'done',
        title: t('details.overview.metrics.done'),
        value: insights.totals.done,
        color: token.colorSuccess
      },
      {
        key: 'overdue',
        title: t('details.overview.metrics.overdue'),
        value: insights.totals.overdue,
        color: token.colorError
      },
      {
        key: 'dueSoon',
        title: t('details.overview.metrics.dueSoon'),
        value: insights.totals.dueSoon,
        color: token.colorWarning
      },
      {
        key: 'unassigned',
        title: t('details.overview.metrics.unassigned'),
        value: insights.totals.unassigned,
        color: token.colorTextSecondary
      }
    ],
    [insights.totals, t, token.colorError, token.colorPrimary, token.colorSuccess, token.colorText, token.colorTextSecondary, token.colorWarning]
  )

  const renderDistribution = (items: DistributionItem[], total: number, labelForKey: (key: string) => string) => {
    if (items.length === 0) {
      return <Typography.Text type="secondary">{t('details.overview.empty')}</Typography.Text>
    }
    return (
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        {items.map((item) => {
          const percent = total === 0 ? 0 : Number(((item.count / total) * 100).toFixed(1))
          return (
            <Flex key={item.key} align="center" gap={12}>
              <Typography.Text style={{ width: 140 }}>{labelForKey(item.key)}</Typography.Text>
              <Progress
                percent={percent}
                showInfo
                format={() => String(item.count)}
                style={{ flex: 1, marginInlineEnd: 0 }}
              />
            </Flex>
          )
        })}
      </Space>
    )
  }

  const renderTrend = () => {
    const { completionTrend } = insights
    const max = completionTrend.reduce((acc, point) => Math.max(acc, point.count), 0)
    if (completionTrend.length === 0 || max === 0) {
      return (
        <Typography.Text type="secondary">
          {t('details.overview.trend.empty')}
        </Typography.Text>
      )
    }
    return (
      <Flex align="end" gap={8} style={{ width: '100%', minHeight: 140 }}>
        {completionTrend.map((point) => {
          const heightPercent = max === 0 ? 0 : (point.count / max) * 100
          return (
            <Flex
              key={point.date}
              vertical
              align="center"
              style={{ flex: 1, gap: 8, minWidth: 10 }}
            >
              <div
                style={{
                  height: 120,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-end'
                }}
              >
                <div
                  aria-label={`${point.label}: ${point.count}`}
                  style={{
                    width: '100%',
                    minHeight: point.count > 0 ? 8 : 2,
                    height: `${heightPercent}%`,
                    background: token.colorPrimary,
                    borderRadius: token.borderRadiusSM
                  }}
                />
              </div>
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                {point.label}
              </Typography.Text>
              <Typography.Text style={{ fontSize: 12 }}>{point.count}</Typography.Text>
            </Flex>
          )
        })}
      </Flex>
    )
  }

  const dateLabel = (value: string | null) =>
    value ? dayjs(value).format('DD MMM YYYY') : t('details.noDueDate')

  if (!project && !projectLoading) {
    return (
      <div style={{ marginTop: 64 }}>
        <EmptyState title={t('details.notFound')} />
      </div>
    )
  }

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <ProjectDetailsCard project={project ?? null} loading={projectLoading} />
      <Card title={t('details.overview.metrics.title')}>
        {showSkeleton ? (
          <Skeleton active paragraph={{ rows: 3 }} title={false} />
        ) : (
          <Row gutter={[16, 16]}>
            {metricCards.map((metric) => (
              <Col xs={12} md={8} xl={4} key={metric.key}>
                <Card bordered={false}>
                  <Statistic
                    title={metric.title}
                    value={metric.value}
                    valueStyle={{ fontSize: 28, color: metric.color }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <Card title={t('details.overview.statusCard.title')}>
            {showSkeleton ? (
              <Skeleton active paragraph={{ rows: 4 }} title={false} />
            ) : (
              renderDistribution(
                orderedStatusDistribution,
                insights.totals.total,
                (status) =>
                  statusLabelMap.get(status) ??
                  t(`details.status.${status}`, { defaultValue: status })
              )
            )}
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card title={t('details.overview.priorityCard.title')}>
            {showSkeleton ? (
              <Skeleton active paragraph={{ rows: 4 }} title={false} />
            ) : (
              renderDistribution(
                orderedPriorityDistribution,
                insights.totals.total,
                (priority) =>
                  t(`details.priority.${priority}`, { defaultValue: priority })
              )
            )}
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={8}>
          <Card title={t('details.overview.assigneeCard.title')}>
            {showSkeleton ? (
              <Skeleton active paragraph={{ rows: 4 }} title={false} />
            ) : insights.assigneeWorkload.length === 0 ? (
              <Typography.Text type="secondary">
                {t('details.overview.empty')}
              </Typography.Text>
            ) : (
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                {insights.assigneeWorkload.map((entry) => {
                  const percent =
                    insights.totals.total === 0
                      ? 0
                      : Number(((entry.count / insights.totals.total) * 100).toFixed(1))
                  const label = entry.isUnassigned
                    ? t('details.overview.assigneeCard.unassigned')
                    : entry.name
                  return (
                    <Flex key={entry.id} align="center" gap={12}>
                      <Typography.Text style={{ width: 160 }}>{label}</Typography.Text>
                      <Progress
                        percent={percent}
                        showInfo
                        format={() => String(entry.count)}
                        style={{ flex: 1 }}
                      />
                    </Flex>
                  )
                })}
              </Space>
            )}
          </Card>
        </Col>
        <Col xs={24} xl={16}>
          <Card title={t('details.overview.trendCard.title')}>
            {showSkeleton ? (
              <Skeleton active paragraph={{ rows: 4 }} title={false} />
            ) : (
              renderTrend()
            )}
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <Card title={t('details.overview.upcoming.title')}>
            {showSkeleton ? (
              <Skeleton active paragraph={{ rows: 4 }} title={false} />
            ) : insights.upcomingTasks.length === 0 ? (
              <Typography.Text type="secondary">
                {t('details.overview.upcoming.empty')}
              </Typography.Text>
            ) : (
              <List
                split={false}
                dataSource={insights.upcomingTasks}
                renderItem={(task) => (
                  <List.Item key={task.id} style={{ paddingInline: 0 }}>
                    <Flex justify="space-between" align="center" wrap gap={8} style={{ width: '100%' }}>
                      <div style={{ flex: '1 1 60%' }}>
                        <Typography.Text strong>{task.title}</Typography.Text>
                        <Typography.Paragraph
                          type="secondary"
                          style={{ marginBottom: 0 }}
                        >
                          {task.key}
                        </Typography.Paragraph>
                      </div>
                      <Flex vertical align="flex-end" gap={4}>
                        <Typography.Text style={{ color: token.colorWarning }}>
                          {t('details.overview.taskItem.due', { date: dateLabel(task.dueDate) })}
                        </Typography.Text>
                        <Typography.Text type="secondary">
                          {t('details.overview.taskItem.priority', {
                            priority: t(`details.priority.${task.priority}`, {
                              defaultValue: task.priority
                            })
                          })}
                        </Typography.Text>
                      </Flex>
                    </Flex>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card title={t('details.overview.overdue.title')}>
            {showSkeleton ? (
              <Skeleton active paragraph={{ rows: 4 }} title={false} />
            ) : insights.overdueTasks.length === 0 ? (
              <Typography.Text type="secondary">
                {t('details.overview.overdue.empty')}
              </Typography.Text>
            ) : (
              <List
                split={false}
                dataSource={insights.overdueTasks}
                renderItem={(task) => (
                  <List.Item key={task.id} style={{ paddingInline: 0 }}>
                    <Flex justify="space-between" align="center" wrap gap={8} style={{ width: '100%' }}>
                      <div style={{ flex: '1 1 60%' }}>
                        <Typography.Text strong>{task.title}</Typography.Text>
                        <Typography.Paragraph
                          type="secondary"
                          style={{ marginBottom: 0 }}
                        >
                          {task.key}
                        </Typography.Paragraph>
                      </div>
                      <Flex vertical align="flex-end" gap={4}>
                        <Typography.Text style={{ color: token.colorError }}>
                          {t('details.overview.taskItem.due', { date: dateLabel(task.dueDate) })}
                        </Typography.Text>
                        <Typography.Text type="secondary">
                          {t('details.overview.taskItem.priority', {
                            priority: t(`details.priority.${task.priority}`, {
                              defaultValue: task.priority
                            })
                          })}
                        </Typography.Text>
                      </Flex>
                    </Flex>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </Space>
  )
}

ProjectOverviewPage.displayName = 'ProjectOverviewPage'

export { ProjectOverviewPage }
export default ProjectOverviewPage
