import type { FC } from 'react'
import {
  Button,
  Card,
  Col,
  Checkbox,
  Grid,
  List,
  Modal,
  Progress,
  Row,
  Skeleton,
  Space,
  Statistic,
  Typography,
  Flex,
  theme,
  message
} from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SettingOutlined, EditOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

import { EmptyState } from '@renderer/components/DataStates'
import { BorderedPanel } from '@renderer/components/Surface/BorderedPanel'
import { useDelayedLoading } from '@renderer/hooks/useDelayedLoading'
import { ProjectDetailsCard } from '@renderer/pages/Projects/components/ProjectDetailsCard'
import { useProjectRouteContext } from '@renderer/pages/ProjectLayout'
import { calculateProjectInsights } from '@renderer/pages/ProjectOverview/ProjectOverview.helpers'
import type {
  DistributionItem,
  ProjectOverviewPageProps
} from '@renderer/pages/ProjectOverview/ProjectOverview.types'
import { useAppDispatch } from '@renderer/store/hooks'
import { updateProject } from '@renderer/store/slices/projects'
import { useProjectForms } from '@renderer/pages/Projects/hooks/useProjectForms'
import { EditProjectModal } from '@renderer/pages/Projects/components/EditProjectModal'
import { extractErrorMessage } from '@renderer/store/slices/auth/helpers'

type OverviewCardKey =
  | 'metrics'
  | 'status'
  | 'priority'
  | 'assignee'
  | 'trend'
  | 'upcoming'
  | 'overdue'

const DEFAULT_VISIBLE_OVERVIEW_CARDS: OverviewCardKey[] = [
  'metrics',
  'status',
  'priority',
  'assignee',
  'trend',
  'upcoming',
  'overdue'
]

const OVERVIEW_CARDS_STORAGE_KEY = 'projects:overviewCards'

const normalizeOverviewSelection = (keys: OverviewCardKey[]): OverviewCardKey[] =>
  DEFAULT_VISIBLE_OVERVIEW_CARDS.filter((key) => keys.includes(key))

const ProjectOverviewPage: FC<ProjectOverviewPageProps> = () => {
  const { project, projectLoading, tasks, taskStatuses, refresh } = useProjectRouteContext()
  const { t } = useTranslation('projects')
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()
  const isCompact = !screens.md
  const showSkeleton = useDelayedLoading(projectLoading)
  const dispatch = useAppDispatch()
  const { updateForm } = useProjectForms()
  const [visibleOverviewCards, setVisibleOverviewCards] = useState<OverviewCardKey[]>(
    DEFAULT_VISIBLE_OVERVIEW_CARDS
  )
  const [customizeSelection, setCustomizeSelection] = useState<OverviewCardKey[]>(
    DEFAULT_VISIBLE_OVERVIEW_CARDS
  )
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [customizeError, setCustomizeError] = useState<string | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const hasWindow = typeof window !== 'undefined'

  const insights = useMemo(() => calculateProjectInsights(tasks), [tasks])
  const statusOrder = useMemo(() => taskStatuses.map((status) => status.key), [taskStatuses])

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

  const orderedPriorityDistribution = useMemo(() => {
    const priorityOrder: Array<'critical' | 'high' | 'medium' | 'low'> = [
      'critical',
      'high',
      'medium',
      'low'
    ]
    const orderMap = new Map(priorityOrder.map((priority, index) => [priority, index]))
    return [...insights.priorityDistribution].sort((a, b) => {
      const indexA =
        orderMap.get(a.key as (typeof priorityOrder)[number]) ?? Number.MAX_SAFE_INTEGER
      const indexB =
        orderMap.get(b.key as (typeof priorityOrder)[number]) ?? Number.MAX_SAFE_INTEGER
      if (indexA === indexB) {
        return b.count - a.count
      }
      return indexA - indexB
    })
  }, [insights.priorityDistribution])

  useEffect(() => {
    if (!hasWindow) {
      return
    }
    try {
      const stored = window.localStorage.getItem(OVERVIEW_CARDS_STORAGE_KEY)
      if (!stored) {
        return
      }
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        const valid = parsed.filter((item): item is OverviewCardKey =>
          DEFAULT_VISIBLE_OVERVIEW_CARDS.includes(item as OverviewCardKey)
        )
        if (valid.length > 0) {
          const normalized = normalizeOverviewSelection(valid)
          setVisibleOverviewCards(normalized)
          setCustomizeSelection(normalized)
        }
      }
    } catch {
      // ignore stored value errors
    }
  }, [hasWindow])

  useEffect(() => {
    if (!hasWindow) {
      return
    }
    try {
      window.localStorage.setItem(
        OVERVIEW_CARDS_STORAGE_KEY,
        JSON.stringify(visibleOverviewCards)
      )
    } catch {
      // ignore persistence errors
    }
  }, [hasWindow, visibleOverviewCards])

  const overviewCardOptions = useMemo(
    () => [
      { value: 'metrics', label: t('details.overview.metrics.title') },
      { value: 'status', label: t('details.overview.statusCard.title') },
      { value: 'priority', label: t('details.overview.priorityCard.title') },
      { value: 'assignee', label: t('details.overview.assigneeCard.title') },
      { value: 'trend', label: t('details.overview.trendCard.title') },
      { value: 'upcoming', label: t('details.overview.upcoming.title') },
      { value: 'overdue', label: t('details.overview.overdue.title') }
    ],
    [t]
  )

  const visibleCardsSet = useMemo(() => new Set(visibleOverviewCards), [visibleOverviewCards])
  const canEditProject = project?.role === 'admin'

  const handleCustomizeOpen = useCallback(() => {
    setCustomizeSelection(visibleOverviewCards)
    setCustomizeError(null)
    setCustomizeOpen(true)
  }, [visibleOverviewCards])

  const handleCustomizeCancel = useCallback(() => {
    setCustomizeSelection(visibleOverviewCards)
    setCustomizeError(null)
    setCustomizeOpen(false)
  }, [visibleOverviewCards])

  const handleCustomizeReset = useCallback(() => {
    setCustomizeSelection(DEFAULT_VISIBLE_OVERVIEW_CARDS)
    setCustomizeError(null)
  }, [])

  const customizeHasChanges = useMemo(() => {
    if (customizeSelection.length !== visibleOverviewCards.length) {
      return true
    }
    return customizeSelection.some((key, index) => key !== visibleOverviewCards[index])
  }, [customizeSelection, visibleOverviewCards])

  const isCustomizeDefault = useMemo(() => {
    if (customizeSelection.length !== DEFAULT_VISIBLE_OVERVIEW_CARDS.length) {
      return false
    }
    return customizeSelection.every(
      (key, index) => key === DEFAULT_VISIBLE_OVERVIEW_CARDS[index]
    )
  }, [customizeSelection])

  const handleCustomizeApply = useCallback(() => {
    if (customizeSelection.length === 0) {
      const warningMessage = t('details.overview.customizeMinimum', {
        defaultValue: 'Select at least one card.'
      })
      setCustomizeError(warningMessage)
      message.warning(warningMessage)
      return
    }
    const normalized = normalizeOverviewSelection(customizeSelection)
    setVisibleOverviewCards(normalized)
    setCustomizeError(null)
    setCustomizeOpen(false)
  }, [customizeSelection, t])

  const handleOpenEdit = () => {
    if (!project) {
      return
    }
    if (!canEditProject) {
      message.warning(
        t('permissions.updateDenied', {
          defaultValue: 'Only administrators or maintainers can update projects.'
        })
      )
      return
    }
    updateForm.reset({
      name: project.name,
      description: project.description ?? null,
      tags: project.tags ?? []
    })
    setEditModalOpen(true)
  }

  const handleCloseEdit = () => {
    setEditModalOpen(false)
    updateForm.reset()
  }

  const handleEditSubmit = updateForm.handleSubmit(async (values) => {
    if (!project) {
      return
    }
    try {
      setEditLoading(true)
      await dispatch(updateProject({ projectId: project.id, input: values })).unwrap()
      message.success(t('update.success', { defaultValue: 'Project updated' }))
      setEditModalOpen(false)
      updateForm.reset(values)
      refresh()
    } catch (error) {
      message.error(extractErrorMessage(error))
    } finally {
      setEditLoading(false)
    }
  })

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
    [
      insights.totals,
      t,
      token.colorError,
      token.colorPrimary,
      token.colorSuccess,
      token.colorText,
      token.colorTextSecondary,
      token.colorWarning
    ]
  )

  const metricsGridStyle = useMemo(() => {
    const gap = token.marginMD ?? token.marginSM ?? 16
    return {
      display: 'grid',
      gap,
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      width: '100%'
    }
  }, [token.marginMD, token.marginSM])

  const renderDistribution = (
    items: DistributionItem[],
    total: number,
    labelForKey: (key: string) => string
  ) => {
    if (items.length === 0) {
      return <Typography.Text type="secondary">{t('details.overview.empty')}</Typography.Text>
    }
    return (
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        {items.map((item) => {
          const percent = total === 0 ? 0 : Number(((item.count / total) * 100).toFixed(1))
          return (
            <Flex key={item.key} align="center" gap={12} wrap style={{ width: '100%' }}>
              <Typography.Text style={{ flex: '1 1 160px', minWidth: 140 }}>
                {labelForKey(item.key)}
              </Typography.Text>
              <Progress
                percent={percent}
                showInfo
                format={() => String(item.count)}
                style={{ flex: '1 1 180px', minWidth: 160, marginInlineEnd: 0 }}
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
      return <Typography.Text type="secondary">{t('details.overview.trend.empty')}</Typography.Text>
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
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <BorderedPanel padding="lg" style={{ width: '100%' }}>
        <Flex align="center" wrap gap={12} style={{ width: '100%' }}>
          {canEditProject ? (
            <div style={isCompact ? { width: '100%' } : undefined}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleOpenEdit}
                disabled={!project}
                style={isCompact ? { width: '100%' } : undefined}
              >
                {t('details.summary.editProject', { defaultValue: 'Edit project' })}
              </Button>
            </div>
          ) : null}
          <div
            style={
              isCompact
                ? {
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'flex-end'
                  }
                : { marginLeft: 'auto' }
            }
          >
            <Button
              icon={<SettingOutlined />}
              onClick={handleCustomizeOpen}
              style={isCompact ? { width: '100%' } : undefined}
            >
              {t('details.overview.customizeButton', { defaultValue: 'Customize overview' })}
            </Button>
          </div>
        </Flex>
      </BorderedPanel>
        <Row gutter={[16, 32]} style={{ width: '100%' }}>
        <Col xs={24} lg={12} xl={6}>
          <ProjectDetailsCard
            project={project ?? null}
            loading={projectLoading}
            style={{ height: '100%' }}
          />
        </Col>
        {visibleCardsSet.has('metrics') ? (
          <Col xs={24} lg={12} xl={18}>
            <Card title={t('details.overview.metrics.title')} style={{ height: '100%' }}>
              {showSkeleton ? (
                <Skeleton active paragraph={{ rows: 3 }} title={false} />
              ) : (
                <div style={metricsGridStyle}>
                  {metricCards.map((metric) => (
                    <Card variant="borderless" key={metric.key} style={{ height: '100%' }}>
                      <Statistic
                        title={metric.title}
                        value={metric.value}
                        valueStyle={{ fontSize: 28, color: metric.color }}
                      />
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </Col>
        ) : null}
        {visibleCardsSet.has('status') ? (
          <Col xs={24} md={12} xl={8}>
            <Card title={t('details.overview.statusCard.title')} style={{ height: '100%' }}>
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
        ) : null}
        {visibleCardsSet.has('priority') ? (
          <Col xs={24} md={12} xl={8}>
            <Card title={t('details.overview.priorityCard.title')} style={{ height: '100%' }}>
              {showSkeleton ? (
                <Skeleton active paragraph={{ rows: 4 }} title={false} />
              ) : (
                renderDistribution(orderedPriorityDistribution, insights.totals.total, (priority) =>
                  t(`details.priority.${priority}`, { defaultValue: priority })
                )
              )}
            </Card>
          </Col>
        ) : null}
        {visibleCardsSet.has('assignee') ? (
          <Col xs={24} md={12} xl={8}>
            <Card title={t('details.overview.assigneeCard.title')} style={{ height: '100%' }}>
              {showSkeleton ? (
                <Skeleton active paragraph={{ rows: 4 }} title={false} />
              ) : insights.assigneeWorkload.length === 0 ? (
                <Typography.Text type="secondary">{t('details.overview.empty')}</Typography.Text>
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
                      <Flex key={entry.id} align="center" gap={12} wrap style={{ width: '100%' }}>
                        <Typography.Text style={{ flex: '1 1 180px', minWidth: 140 }}>
                          {label}
                        </Typography.Text>
                        <Progress
                          percent={percent}
                          showInfo
                          format={() => String(entry.count)}
                          style={{ flex: '1 1 200px', minWidth: 160 }}
                        />
                      </Flex>
                    )
                  })}
                </Space>
              )}
            </Card>
          </Col>
        ) : null}
        {visibleCardsSet.has('trend') ? (
          <Col xs={24} lg={16} xl={16}>
            <Card title={t('details.overview.trendCard.title')} style={{ height: '100%' }}>
              {showSkeleton ? <Skeleton active paragraph={{ rows: 4 }} title={false} /> : renderTrend()}
            </Card>
          </Col>
        ) : null}
        {visibleCardsSet.has('upcoming') ? (
          <Col xs={24} lg={8} xl={8}>
            <Card title={t('details.overview.upcoming.title')} style={{ height: '100%' }}>
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
                      <Flex
                        justify="space-between"
                        align="center"
                        wrap
                        gap={8}
                        style={{ width: '100%' }}
                      >
                        <div style={{ flex: '1 1 60%' }}>
                          <Typography.Text strong>{task.title}</Typography.Text>
                          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
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
        ) : null}
        {visibleCardsSet.has('overdue') ? (
          <Col xs={24} lg={12} xl={12}>
            <Card title={t('details.overview.overdue.title')} style={{ height: '100%' }}>
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
                      <Flex
                        justify="space-between"
                        align="center"
                        wrap
                        gap={8}
                        style={{ width: '100%' }}
                      >
                        <div style={{ flex: '1 1 60%' }}>
                          <Typography.Text strong>{task.title}</Typography.Text>
                          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
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
        ) : null}
      </Row>
      <Modal
        open={customizeOpen}
        title={t('details.overview.customizeTitle', { defaultValue: 'Customize overview' })}
        onCancel={handleCustomizeCancel}
        destroyOnClose={false}
        footer={
          <Flex align="center" justify="space-between" wrap gap={12}>
            <Button onClick={handleCustomizeReset} disabled={isCustomizeDefault}>
              {t('details.overview.customizeReset', { defaultValue: 'Restore defaults' })}
            </Button>
            <Space size="small" wrap>
              <Button onClick={handleCustomizeCancel}>
                {t('details.overview.customizeCancel', { defaultValue: 'Cancel' })}
              </Button>
              <Button
                type="primary"
                onClick={handleCustomizeApply}
                disabled={!customizeHasChanges}
              >
                {t('details.overview.customizeApply', { defaultValue: 'Apply changes' })}
              </Button>
            </Space>
          </Flex>
        }
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            {t('details.overview.customizeDescription', {
              defaultValue: 'Choose which cards to display on the overview.'
            })}
          </Typography.Paragraph>
          <Checkbox.Group
            value={customizeSelection}
            onChange={(values) => {
              setCustomizeError(null)
              setCustomizeSelection(
                normalizeOverviewSelection(values as OverviewCardKey[])
              )
            }}
          >
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              {overviewCardOptions.map((option) => (
                <Checkbox key={option.value} value={option.value}>
                  {option.label}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
          {customizeError ? (
            <Typography.Text type="danger">{customizeError}</Typography.Text>
          ) : null}
        </Space>
      </Modal>
      <EditProjectModal
        open={editModalOpen}
        onCancel={handleCloseEdit}
        onSubmit={() => void handleEditSubmit()}
        form={updateForm}
        submitting={editLoading}
        projectName={project?.name}
        projectKey={project?.key}
      />
    </Space>
  )
}

ProjectOverviewPage.displayName = 'ProjectOverviewPage'

export { ProjectOverviewPage }
export default ProjectOverviewPage
