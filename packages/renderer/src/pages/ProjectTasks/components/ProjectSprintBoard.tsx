import { useCallback, useEffect, useMemo, useState, type JSX } from 'react'
import {
  Avatar,
  Card,
  DatePicker,
  Empty,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Segmented,
  Space,
  Spin,
  Tag,
  Typography,
  message,
  theme
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { UserOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import type { ManipulateType } from 'dayjs'
import { useTranslation } from 'react-i18next'

import { BorderedPanel } from '@renderer/components/Surface/BorderedPanel'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import { shallowEqual } from 'react-redux'
import {
  createSprint,
  deleteSprint,
  fetchSprintDetails,
  fetchSprints,
  selectSprintDetails,
  selectSprintList,
  selectSprintsForProject,
  updateSprint
} from '@renderer/store/slices/sprints'
import { selectProjectTasks } from '@renderer/store/slices/tasks/selectors'
import type { TaskDetails } from '@renderer/store/slices/tasks'
import type { SprintDTO } from '@main/services/sprint/types'

import SprintBoardToolbar from './ProjectSprintBoard/SprintBoardToolbar'
import SprintGroup from './ProjectSprintBoard/SprintGroup'
import UnassignedTasksCard from './ProjectSprintBoard/UnassignedTasksCard'
import type {
  FormatSlotLabelFn,
  GroupedSprints,
  SprintDetailsSelectorResult,
  SprintStatusFilter,
  TaskTableColumns,
  TimelinePosition,
  UnassignedTaskRecord,
  ViewScale
} from './ProjectSprintBoard/types'

const { RangePicker } = DatePicker

const MIN_RANGE_WIDTH_PERCENT = 4
const STATUS_ORDER: Array<SprintDTO['status']> = ['active', 'planned', 'completed', 'archived']

const zoomLevels: ViewScale[] = ['week', 'month', 'year']

const zoomSettings: Record<
  ViewScale,
  {
    unit: ManipulateType
    align: ManipulateType
    step: number
    slotWidth: number
  }
> = {
  week: { unit: 'day', align: 'day', step: 1, slotWidth: 160 },
  month: { unit: 'week', align: 'week', step: 1, slotWidth: 200 },
  year: { unit: 'month', align: 'month', step: 1, slotWidth: 220 }
}

const formatDateRange = (start: string, end: string) =>
  `${dayjs(start).format('DD MMM YYYY')} - ${dayjs(end).format('DD MMM YYYY')}`

export interface ProjectSprintBoardProps {
  projectId: string | null
  canManage: boolean
}

export const ProjectSprintBoard = ({
  projectId,
  canManage
}: ProjectSprintBoardProps): JSX.Element => {
  const { t } = useTranslation('projects')
  const dispatch = useAppDispatch()
  const [messageApi, messageContext] = message.useMessage()
  const { token } = theme.useToken()

  const [statusFilter, setStatusFilter] = useState<SprintStatusFilter>('all')
  const [viewScale, setViewScale] = useState<ViewScale>('year')
  const [expandedSprintIds, setExpandedSprintIds] = useState<string[]>([])
  const [formVisible, setFormVisible] = useState(false)
  const [editingSprint, setEditingSprint] = useState<SprintDTO | null>(null)
  const [form] = Form.useForm()

  const segmentedStyle = useMemo(
    () => ({
      background: token.colorFillTertiary,
      border: `${token.lineWidth}px solid ${token.colorFillQuaternary}`,
      boxShadow: 'none',
      padding: token.paddingXXS,
      borderRadius: token.borderRadiusLG
    }),
    [
      token.borderRadiusLG,
      token.colorFillQuaternary,
      token.colorFillTertiary,
      token.lineWidth,
      token.paddingXXS
    ]
  )

  const sprintSelector = useMemo(
    () => (projectId ? selectSprintsForProject(projectId) : null),
    [projectId]
  )
  const sprintListSelector = useMemo(
    () => (projectId ? selectSprintList(projectId) : null),
    [projectId]
  )

  const taskSelector = useMemo(
    () => (projectId ? selectProjectTasks(projectId) : null),
    [projectId]
  )

  const sprintState = useAppSelector((state) =>
    sprintSelector ? sprintSelector(state) : undefined
  )
  const sprints = useAppSelector(
    (state) => (sprintListSelector ? sprintListSelector(state) : []),
    shallowEqual
  )
  const sprintStatus = sprintState?.status ?? 'idle'

  const projectTasks = useAppSelector(
    (state) => (taskSelector ? taskSelector(state) : []),
    shallowEqual
  ) as TaskDetails[]

  const expandedSprintDetails = useAppSelector(
    (state) =>
      expandedSprintIds.map((id) => ({
        id,
        state: selectSprintDetails(id)(state)
      })),
    shallowEqual
  )

  const sprintDetailsMap = useMemo(() => {
    const map: Record<string, SprintDetailsSelectorResult | undefined> = {}
    for (const { id, state } of expandedSprintDetails) {
      map[id] = state
    }
    return map
  }, [expandedSprintDetails])

  useEffect(() => {
    expandedSprintDetails.forEach(({ id, state }) => {
      if (!state || state.status === 'idle') {
        void dispatch(fetchSprintDetails(id))
      }
    })
  }, [dispatch, expandedSprintDetails])

  useEffect(() => {
    if (projectId && sprintStatus === 'idle') {
      void dispatch(fetchSprints(projectId))
    }
  }, [dispatch, projectId, sprintStatus])

  useEffect(() => {
    setExpandedSprintIds([])
    setStatusFilter('all')
  }, [projectId])

  const filteredSprints = useMemo(() => {
    const sorted = [...sprints].sort(
      (a, b) => dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf()
    )
    if (statusFilter === 'all') {
      return sorted
    }
    return sorted.filter((sprint) => sprint.status === statusFilter)
  }, [sprints, statusFilter])

  useEffect(() => {
    setExpandedSprintIds((current) => {
      if (current.length === 0) {
        return current
      }
      const filtered = current.filter((id) => filteredSprints.some((sprint) => sprint.id === id))
      if (filtered.length === current.length) {
        return current
      }
      return filtered
    })
  }, [filteredSprints])

  const groupedSprints = useMemo<GroupedSprints[]>(() => {
    return STATUS_ORDER.map((status) => {
      const statusSprints = filteredSprints.filter((sprint) => sprint.status === status)
      if (statusSprints.length === 0) {
        return null
      }

      const totals = statusSprints.reduce(
        (acc, sprint) => {
          acc.tasks += sprint.metrics.totalTasks
          acc.estimated += sprint.metrics.estimatedMinutes ?? 0
          return acc
        },
        {
          tasks: 0,
          estimated: 0
        }
      )

      return {
        status,
        label: t(`sprints.status.${status}`, { defaultValue: status }),
        sprints: statusSprints,
        totals: {
          tasks: totals.tasks,
          estimated: totals.estimated
        }
      }
    }).filter(Boolean) as GroupedSprints[]
  }, [filteredSprints, t])

  const currentZoomSetting = zoomSettings[viewScale]
  const slotWidth = currentZoomSetting.slotWidth
  const zoomIndex = zoomLevels.indexOf(viewScale)
  const canZoomIn = zoomIndex > 0
  const canZoomOut = zoomIndex < zoomLevels.length - 1

  const timelineBounds = useMemo(() => {
    if (filteredSprints.length === 0) {
      return null
    }

    let minDate = dayjs(filteredSprints[0].startDate)
    let maxDate = dayjs(filteredSprints[0].endDate)

    filteredSprints.forEach((sprint) => {
      const start = dayjs(sprint.startDate)
      const end = dayjs(sprint.endDate)
      if (start.isBefore(minDate)) {
        minDate = start
      }
      if (end.isAfter(maxDate)) {
        maxDate = end
      }
    })

    const alignedStart = minDate.startOf(currentZoomSetting.align)
    const alignedEnd = maxDate.endOf(currentZoomSetting.align)

    return { start: alignedStart, end: alignedEnd }
  }, [filteredSprints, currentZoomSetting.align])

  const totalTimelineHours = useMemo(() => {
    if (!timelineBounds) {
      return 24
    }
    const hours = timelineBounds.end.diff(timelineBounds.start, 'hour', true)
    return Math.max(24, hours)
  }, [timelineBounds])

  const timelineSlots = useMemo(() => {
    if (!timelineBounds) {
      return []
    }

    const slots: dayjs.Dayjs[] = []
    let cursor = timelineBounds.start
    while (cursor.isBefore(timelineBounds.end)) {
      slots.push(cursor)
      cursor = cursor.add(currentZoomSetting.step, currentZoomSetting.unit)
    }
    return slots
  }, [timelineBounds, currentZoomSetting.step, currentZoomSetting.unit])

  const computeRangePosition = useCallback(
    (startInput: dayjs.Dayjs, endInput: dayjs.Dayjs): TimelinePosition => {
      if (!timelineBounds) {
        return { left: '0%', width: '0%' }
      }

      const clampedStart = startInput.isBefore(timelineBounds.start)
        ? timelineBounds.start
        : startInput
      const clampedEnd = endInput.isAfter(timelineBounds.end) ? timelineBounds.end : endInput

      const safeEnd = clampedEnd.isBefore(clampedStart)
        ? clampedStart.add(6, 'hour')
        : clampedEnd

      const leftPercent =
        (clampedStart.diff(timelineBounds.start, 'hour', true) / totalTimelineHours) * 100
      const widthPercent =
        (safeEnd.diff(clampedStart, 'hour', true) / totalTimelineHours) * 100

      return {
        left: `${Math.max(0, Math.min(leftPercent, 100))}%`,
        width: `${Math.max(widthPercent, MIN_RANGE_WIDTH_PERCENT)}%`
      }
    },
    [timelineBounds, totalTimelineHours]
  )

  const formatSlotLabel = useCallback<FormatSlotLabelFn>(
    (date) => {
      switch (viewScale) {
        case 'week':
          return {
            label: date.format('DD MMM'),
            subLabel: date.format('ddd')
          }
        case 'month':
          return {
            label: date.format('DD MMM'),
            subLabel: date.format('MMM YYYY')
          }
        case 'year':
        default:
          return {
            label: date.format('MMM'),
            subLabel: date.format('YYYY')
          }
      }
    },
    [viewScale]
  )

  const sprintKeyPrefix = t('sprints.keyPrefix', { defaultValue: 'SPR' })

  const sprintStatusColors: Record<SprintDTO['status'], string> = useMemo(
    () => ({
      planned: token.colorWarning,
      active: token.colorPrimary,
      completed: token.colorSuccess,
      archived: token.colorTextQuaternary
    }),
    [
      token.colorPrimary,
      token.colorSuccess,
      token.colorTextQuaternary,
      token.colorWarning
    ]
  )

  const taskStatusColors = useMemo<Record<string, string>>(
    () => ({
      todo: token.colorWarning,
      backlog: token.colorWarning,
      in_progress: token.colorPrimary,
      review: token.colorInfo,
      done: token.colorSuccess,
      completed: token.colorSuccess,
      blocked: token.colorError,
      cancelled: token.colorTextDisabled
    }),
    [
      token.colorError,
      token.colorInfo,
      token.colorPrimary,
      token.colorSuccess,
      token.colorTextDisabled,
      token.colorWarning
    ]
  )

  const taskTableColumns = useMemo<TaskTableColumns>(
    () => [
      {
        title: t('tasks.fields.task', { defaultValue: 'Task' }),
        dataIndex: 'title',
        key: 'title',
        render: (value: string) => (
          <Typography.Text ellipsis={{ tooltip: value }}>{value}</Typography.Text>
        )
      },
      {
        title: t('tasks.fields.status', { defaultValue: 'Stato' }),
        dataIndex: 'status',
        key: 'status',
        width: 160,
        render: (value: string) => (
          <Tag color={taskStatusColors[value] ?? token.colorBorder}>
            {t(`tasks.status.${value}`, { defaultValue: value })}
          </Tag>
        )
      },
      {
        title: t('tasks.fields.assignee', { defaultValue: 'Assegnatario' }),
        dataIndex: 'assignee',
        key: 'assignee',
        width: 220,
        render: (value: string) => (
          <Space size={8}>
            <Avatar size="small" icon={<UserOutlined />} />
            <Typography.Text>{value}</Typography.Text>
          </Space>
        )
      },
      {
        title: t('tasks.fields.dueDate', { defaultValue: 'Scadenza' }),
        dataIndex: 'dueDate',
        key: 'dueDate',
        width: 180,
        render: (value: string | null) =>
          value ? dayjs(value).format('DD MMM YYYY') : t('tasks.details.noDueDate')
      }
    ],
    [t, taskStatusColors, token.colorBorder, token.controlHeightSM]
  )

  const unscheduledTasks = useMemo(
    () => projectTasks.filter((task) => !task.sprintId),
    [projectTasks]
  )

  const unassignedTaskData = useMemo<UnassignedTaskRecord[]>(
    () =>
      unscheduledTasks.map((task) => ({
        key: task.id,
        title: `${task.key} - ${task.title}`,
        status: task.status,
        priority: task.priority,
        assignee:
          task.assignee?.displayName ??
          t('tasks.details.unassigned', { defaultValue: 'Non assegnato' }),
        dueDate: task.dueDate,
        estimatedMinutes: task.estimatedMinutes ?? null
      })),
    [unscheduledTasks, t]
  )

  const unassignedTaskColumns = useMemo<ColumnsType<UnassignedTaskRecord>>(
    () => [
      {
        title: t('tasks.fields.task', { defaultValue: 'Task' }),
        dataIndex: 'title',
        key: 'title',
        render: (value: string) => (
          <Typography.Text ellipsis={{ tooltip: value }}>{value}</Typography.Text>
        )
      },
      {
        title: t('tasks.fields.status', { defaultValue: 'Stato' }),
        dataIndex: 'status',
        key: 'status',
        width: 160,
        render: (value: string) => (
          <Tag color={taskStatusColors[value] ?? token.colorBorder}>
            {t(`tasks.status.${value}`, { defaultValue: value })}
          </Tag>
        )
      },
      {
        title: t('tasks.fields.priority', { defaultValue: 'Priorita' }),
        dataIndex: 'priority',
        key: 'priority',
        width: 160,
        render: (value: string) => (
          <Tag bordered={false} style={{ textTransform: 'uppercase' }}>
            {t(`details.priority.${value}`, { defaultValue: value })}
          </Tag>
        )
      },
      {
        title: t('tasks.fields.assignee', { defaultValue: 'Assegnatario' }),
        dataIndex: 'assignee',
        key: 'assignee',
        width: 220,
        render: (value: string) => (
          <Space size={8}>
            <Avatar size="small" icon={<UserOutlined />} />
            <Typography.Text>{value}</Typography.Text>
          </Space>
        )
      },
      {
        title: t('tasks.fields.dueDate', { defaultValue: 'Scadenza' }),
        dataIndex: 'dueDate',
        key: 'dueDate',
        width: 180,
        render: (value: string | null) =>
          value ? dayjs(value).format('DD MMM YYYY') : t('tasks.details.noDueDate')
      },
      {
        title: t('tasks.fields.estimatedMinutes', { defaultValue: 'Minuti stimati' }),
        dataIndex: 'estimatedMinutes',
        key: 'estimatedMinutes',
        width: 160,
        render: (value: number | null) => (value ?? 'N/A')
      }
    ],
    [t, taskStatusColors, token.colorBorder, token.controlHeightSM]
  )

  const unscheduledDescription = useMemo(() => {
    if (unassignedTaskData.length === 0) {
      return t('sprints.unassignedTasks.empty', {
        defaultValue: 'Tutti i task sono assegnati a uno sprint.'
      })
    }
    return t('sprints.unassignedTasks.description', {
      defaultValue: 'Task pianificati ma senza sprint associato.'
    })
  }, [t, unassignedTaskData.length])

  const statusOptions = useMemo(
    () => [
      { label: t('sprints.filters.all', { defaultValue: 'Tutti' }), value: 'all' as const },
      { label: t('sprints.status.active', { defaultValue: 'In corso' }), value: 'active' as const },
      {
        label: t('sprints.status.planned', { defaultValue: 'Pianificato' }),
        value: 'planned' as const
      },
      {
        label: t('sprints.status.completed', { defaultValue: 'Completato' }),
        value: 'completed' as const
      },
      {
        label: t('sprints.status.archived', { defaultValue: 'Archiviato' }),
        value: 'archived' as const
      }
    ],
    [t]
  )

  const handleZoomIn = useCallback(() => {
    setViewScale((current) => {
      const index = zoomLevels.indexOf(current)
      if (index <= 0) {
        return current
      }
      return zoomLevels[index - 1]
    })
  }, [])

  const handleZoomOut = useCallback(() => {
    setViewScale((current) => {
      const index = zoomLevels.indexOf(current)
      if (index === -1 || index >= zoomLevels.length - 1) {
        return current
      }
      return zoomLevels[index + 1]
    })
  }, [])

  const handleToggleSprint = useCallback((sprintId: string) => {
    setExpandedSprintIds((current) =>
      current.includes(sprintId)
        ? current.filter((id) => id !== sprintId)
        : [...current, sprintId]
    )
  }, [])

  const handleOpenCreate = useCallback(() => {
    form.resetFields()
    setEditingSprint(null)
    setFormVisible(true)
  }, [form])

  const handleOpenEdit = useCallback(
    (sprint: SprintDTO) => {
      form.setFieldsValue({
        name: sprint.name,
        goal: sprint.goal ?? undefined,
        status: sprint.status,
        capacityMinutes: sprint.capacityMinutes ?? undefined,
        dateRange: [dayjs(sprint.startDate), dayjs(sprint.endDate)]
      })
      setEditingSprint(sprint)
      setFormVisible(true)
    },
    [form]
  )

  const handleDelete = useCallback(
    async (sprint: SprintDTO) => {
      if (!projectId) {
        messageApi.error(
          t('sprints.form.invalidProject', { defaultValue: 'Progetto non valido' })
        )
        return
      }
      try {
        await dispatch(deleteSprint({ projectId, sprintId: sprint.id })).unwrap()
        messageApi.success(
          t('sprints.deleteSuccess', { defaultValue: 'Sprint eliminato correttamente' })
        )
        setExpandedSprintIds((ids) => ids.filter((id) => id !== sprint.id))
      } catch (error) {
        if (error instanceof Error) {
          messageApi.error(error.message)
        } else {
          messageApi.error(t('common.genericError', { defaultValue: 'Errore imprevisto' }))
        }
      }
    },
    [dispatch, messageApi, projectId, t]
  )

  const handleFormSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields()
      const [start, end] = values.dateRange as [dayjs.Dayjs, dayjs.Dayjs]
      const payload = {
        name: values.name as string,
        goal: (values.goal as string | undefined) ?? null,
        status: values.status as SprintDTO['status'],
        capacityMinutes:
          values.capacityMinutes !== undefined ? Number(values.capacityMinutes) : null,
        startDate: start.format('YYYY-MM-DD'),
        endDate: end.format('YYYY-MM-DD')
      }

      if (!projectId) {
        throw new Error(
          t('sprints.form.invalidProject', { defaultValue: 'Progetto non valido' })
        )
      }

      if (editingSprint) {
        await dispatch(
          updateSprint({
            sprintId: editingSprint.id,
            input: payload
          })
        ).unwrap()
        messageApi.success(
          t('sprints.updateSuccess', { defaultValue: 'Sprint aggiornato correttamente' })
        )
      } else {
        const created = await dispatch(
          createSprint({
            projectId,
            ...payload
          })
        ).unwrap()
        messageApi.success(t('sprints.createSuccess', { defaultValue: 'Sprint creato' }))
        setExpandedSprintIds((ids) => [...ids, created.id])
      }

      setFormVisible(false)
      setEditingSprint(null)
      form.resetFields()
    } catch (error) {
      if (error instanceof Error && 'errorFields' in error) {
        return
      }
      if (error instanceof Error) {
        messageApi.error(error.message)
      } else {
        messageApi.error(
          t('sprints.form.invalid', { defaultValue: 'Compila tutti i campi obbligatori' })
        )
      }
    }
  }, [dispatch, editingSprint, form, messageApi, projectId, t])

  if (!projectId) {
    return (
      <Flex vertical align="center" justify="center" style={{ width: '100%', padding: 32 }}>
        <Empty
          description={t('sprints.noProjectSelected', {
            defaultValue: 'Nessun progetto selezionato'
          })}
        />
      </Flex>
    )
  }

  const isLoadingSprints = sprintStatus === 'loading'

  return (
    <Flex vertical gap={token.marginLG} style={{ width: '100%' }}>
      {messageContext}

      <BorderedPanel>
        <SprintBoardToolbar
          canManage={canManage}
          onCreate={handleOpenCreate}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          statusOptions={statusOptions}
          segmentedStyle={segmentedStyle}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          canZoomIn={canZoomIn}
          canZoomOut={canZoomOut}
          zoomInLabel={t('sprints.board.zoomIn', { defaultValue: 'Aumenta dettaglio' })}
          zoomOutLabel={t('sprints.board.zoomOut', { defaultValue: 'Riduci dettaglio' })}
          createLabel={t('sprints.actions.create', { defaultValue: 'Nuovo sprint' })}
        />
      </BorderedPanel>

      <Card
        bordered={false}
        bodyStyle={{ padding: token.paddingLG }}
        style={{
          borderRadius: token.borderRadiusLG,
          background: token.colorBgContainer,
          boxShadow: token.boxShadowTertiary
        }}
      >
        {isLoadingSprints ? (
          <Flex align="center" justify="center" style={{ width: '100%', minHeight: 280 }}>
            <Spin />
          </Flex>
        ) : filteredSprints.length === 0 ? (
          <Flex align="center" justify="center" style={{ width: '100%', minHeight: 280 }}>
            <Empty
              description={t('sprints.empty', {
                defaultValue: 'Nessuno sprint trovato per il filtro selezionato'
              })}
            />
          </Flex>
        ) : (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: token.marginMD,
                minWidth: timelineSlots.length > 0 ? timelineSlots.length * slotWidth : '100%'
              }}
            >
              {groupedSprints.map((group) => (
                <SprintGroup
                  key={group.status}
                  group={group}
                  timelineSlots={timelineSlots}
                  slotWidth={slotWidth}
                  formatSlotLabel={formatSlotLabel}
                  formatDateRange={formatDateRange}
                  computeRangePosition={computeRangePosition}
                  sprintStatusColors={sprintStatusColors}
                  expandedSprintIds={expandedSprintIds}
                  onToggleSprint={handleToggleSprint}
                  sprintDetailsMap={sprintDetailsMap}
                  canManage={canManage}
                  onEditSprint={handleOpenEdit}
                  onDeleteSprint={handleDelete}
                  sprintKeyPrefix={sprintKeyPrefix}
                  token={token}
                  t={t}
                  taskTableColumns={taskTableColumns}
                />
              ))}
            </div>
          </div>
        )}
      </Card>

      <UnassignedTasksCard
        title={t('sprints.unassignedTasks.title', { defaultValue: 'Task senza sprint' })}
        count={unassignedTaskData.length}
        description={unassignedTaskData.length === 0 ? unscheduledDescription : undefined}
        data={unassignedTaskData}
        columns={unassignedTaskColumns}
        token={token}
        t={t}
      />

      <Modal
        title={
          editingSprint
            ? t('sprints.editTitle', { defaultValue: 'Modifica sprint' })
            : t('sprints.createTitle', { defaultValue: 'Nuovo sprint' })
        }
        open={formVisible}
        onCancel={() => {
          setFormVisible(false)
          setEditingSprint(null)
          form.resetFields()
        }}
        onOk={handleFormSubmit}
        okText={t('common.save', { defaultValue: 'Salva' })}
        cancelText={t('common.cancel', { defaultValue: 'Annulla' })}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={t('sprints.fields.name', { defaultValue: 'Nome' })}
            name="name"
            rules={[
              {
                required: true,
                message: t('sprints.form.nameRequired', { defaultValue: 'Nome obbligatorio' })
              }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item label={t('sprints.fields.goal', { defaultValue: 'Obiettivo' })} name="goal">
            <Input.TextArea rows={3} maxLength={500} showCount />
          </Form.Item>

          <Form.Item
            label={t('sprints.fields.dateRange', { defaultValue: 'Periodo' })}
            name="dateRange"
            rules={[
              {
                required: true,
                message: t('sprints.form.dateRequired', {
                  defaultValue: 'Seleziona inizio e fine'
                })
              }
            ]}
          >
            <RangePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            label={t('sprints.fields.status', { defaultValue: 'Stato' })}
            name="status"
            rules={[{ required: true }]}
          >
            <Segmented
              block
              options={statusOptions.filter((option) => option.value !== 'all')}
              style={{ ...segmentedStyle, width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label={t('sprints.fields.capacityMinutes', {
              defaultValue: 'Capacita (minuti)'
            })}
            name="capacityMinutes"
          >
            <InputNumber min={0} max={1_000_000} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  )
}

export default ProjectSprintBoard
