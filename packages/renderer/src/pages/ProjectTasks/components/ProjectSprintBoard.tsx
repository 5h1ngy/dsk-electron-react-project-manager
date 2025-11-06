import { useCallback, useEffect, useMemo, useState, type JSX } from 'react'
import {
  Avatar,
  Button,
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
  Table,
  Tag,
  Typography,
  message,
  theme
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UserOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import type { ManipulateType } from 'dayjs'
import { useTranslation } from 'react-i18next'

import { BorderedPanel } from '@renderer/components/Surface/BorderedPanel'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import {
  createSprint,
  deleteSprint,
  fetchSprintDetails,
  fetchSprints,
  selectSprintDetails,
  selectSprintsForProject,
  updateSprint
} from '@renderer/store/slices/sprints'
import type { SprintDTO } from '@main/services/sprint/types'
import type { TaskDetailsDTO } from '@main/services/task/types'

const { RangePicker } = DatePicker

const MIN_RANGE_WIDTH_PERCENT = 4
const STATUS_ORDER: Array<SprintDTO['status']> = ['active', 'planned', 'completed', 'archived']

type ViewScale = 'week' | 'month' | 'year'

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

type SprintStatusFilter = 'all' | SprintDTO['status']

type TimelinePosition = {
  left: string
  width: string
}

type GroupedSprints = {
  status: SprintDTO['status']
  label: string
  sprints: SprintDTO[]
  totals: {
    tasks: number
    estimated: number
    spent: number
    utilization: number | null
  }
}

type TaskTableRecord = {
  key: string
  title: string
  status: TaskDetailsDTO['status']
  assignee: string
  dueDate: string | null
}

export interface ProjectSprintBoardProps {
  projectId: string | null
  canManage: boolean
}

const formatDateRange = (start: string, end: string) =>
  `${dayjs(start).format('DD MMM YYYY')} → ${dayjs(end).format('DD MMM YYYY')}`

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
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null)
  const [formVisible, setFormVisible] = useState(false)
  const [editingSprint, setEditingSprint] = useState<SprintDTO | null>(null)
  const [form] = Form.useForm()

  const handleZoomIn = useCallback(() => {
    setViewScale((current) => {
      const currentIndex = zoomLevels.indexOf(current)
      if (currentIndex <= 0) {
        return current
      }
      return zoomLevels[currentIndex - 1]
    })
  }, [])

  const handleZoomOut = useCallback(() => {
    setViewScale((current) => {
      const currentIndex = zoomLevels.indexOf(current)
      if (currentIndex >= zoomLevels.length - 1) {
        return current
      }
      return zoomLevels[currentIndex + 1]
    })
  }, [])

  const sprintSelector = useMemo(
    () => (projectId ? selectSprintsForProject(projectId) : null),
    [projectId]
  )

  const sprintState = useAppSelector((state) =>
    sprintSelector ? sprintSelector(state) : undefined
  )

  const sprints = useMemo(() => {
    if (!sprintState) {
      return []
    }
    return sprintState.ids
      .map((id) => sprintState.entities[id])
      .filter(Boolean) as SprintDTO[]
  }, [sprintState])

  const sprintStatus = sprintState?.status ?? 'idle'
  const isLoadingSprints = sprintStatus === 'loading'

  const zoomIndex = zoomLevels.indexOf(viewScale)
  const canZoomIn = zoomIndex > 0
  const canZoomOut = zoomIndex < zoomLevels.length - 1
  const currentZoomSetting = zoomSettings[viewScale]
  const slotWidth = currentZoomSetting.slotWidth

  useEffect(() => {
    if (projectId && sprintStatus === 'idle') {
      dispatch(fetchSprints(projectId))
    }
  }, [dispatch, projectId, sprintStatus])

  useEffect(() => {
    setSelectedSprintId(null)
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
    if (selectedSprintId && !filteredSprints.some((sprint) => sprint.id === selectedSprintId)) {
      setSelectedSprintId(null)
    }
  }, [filteredSprints, selectedSprintId])

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
          acc.spent += sprint.metrics.timeSpentMinutes
          if (typeof sprint.metrics.utilizationPercent === 'number') {
            acc.utilizationValues.push(sprint.metrics.utilizationPercent)
          }
          return acc
        },
        {
          tasks: 0,
          estimated: 0,
          spent: 0,
          utilizationValues: [] as number[]
        }
      )

      const utilization =
        totals.utilizationValues.length > 0
          ? totals.utilizationValues.reduce((sum, value) => sum + value, 0) /
            totals.utilizationValues.length
          : null

      return {
        status,
        label: t(`sprints.status.${status}`, { defaultValue: status }),
        sprints: statusSprints,
        totals: {
          tasks: totals.tasks,
          estimated: totals.estimated,
          spent: totals.spent,
          utilization
        }
      }
    }).filter(Boolean) as GroupedSprints[]
  }, [filteredSprints, t])

  const selectedDetailsState = useAppSelector((state) =>
    selectedSprintId ? selectSprintDetails(selectedSprintId)(state) : undefined
  )
  const selectedDetails = selectedDetailsState?.data ?? null
  const isLoadingDetails = selectedDetailsState?.status === 'loading'

  useEffect(() => {
    if (selectedSprintId) {
      void dispatch(fetchSprintDetails(selectedSprintId))
    }
  }, [dispatch, selectedSprintId])

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

  const timelineBounds = useMemo(() => {
    if (filteredSprints.length === 0) {
      return null
    }

    let minDate = dayjs(filteredSprints[0].startDate)
    let maxDate = dayjs(filteredSprints[0].endDate)

    for (const sprint of filteredSprints) {
      const start = dayjs(sprint.startDate)
      const end = dayjs(sprint.endDate)
      if (start.isBefore(minDate)) {
        minDate = start
      }
      if (end.isAfter(maxDate)) {
        maxDate = end
      }
    }

    if (selectedDetails?.tasks?.length) {
      for (const task of selectedDetails.tasks) {
        const created = dayjs(task.createdAt)
        const due = task.dueDate ? dayjs(task.dueDate) : created
        if (created.isBefore(minDate)) {
          minDate = created
        }
        if (due.isAfter(maxDate)) {
          maxDate = due
        }
      }
    }

    const start = minDate.startOf(currentZoomSetting.align)
    let end = maxDate.endOf(currentZoomSetting.align)

    if (!end.isAfter(start)) {
      end = start.add(currentZoomSetting.step, currentZoomSetting.unit)
    } else {
      end = end.add(currentZoomSetting.step, currentZoomSetting.unit)
    }

    return { start, end }
  }, [filteredSprints, selectedDetails, currentZoomSetting])

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
  }, [timelineBounds, currentZoomSetting])

  const gridTemplateColumns = useMemo(
    () => `240px repeat(${timelineSlots.length}, minmax(${slotWidth}px, 1fr))`,
    [timelineSlots.length, slotWidth]
  )

  const boardMinWidth = useMemo(
    () => 240 + timelineSlots.length * slotWidth,
    [slotWidth, timelineSlots.length]
  )

  const computeRangePosition = useCallback(
    (startInput: dayjs.Dayjs, endInput: dayjs.Dayjs): TimelinePosition => {
      if (!timelineBounds) {
        return { left: '0%', width: '0%' }
      }

      const clampedStart = startInput.isBefore(timelineBounds.start)
        ? timelineBounds.start
        : startInput
      const clampedEnd = endInput.isAfter(timelineBounds.end)
        ? timelineBounds.end
        : endInput

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

  const handleSprintClick = useCallback((sprintId: string) => {
    setSelectedSprintId((current) => (current === sprintId ? null : sprintId))
  }, [])

  const formatSlotLabel = useCallback(
    (date: dayjs.Dayjs) => {
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

  const handleOpenCreate = useCallback(() => {
    form.resetFields()
    setEditingSprint(null)
    setFormVisible(true)
  }, [form])

  const handleOpenEdit = useCallback(
    (sprint: SprintDTO) => {
      setEditingSprint(sprint)
      setFormVisible(true)
      form.setFieldsValue({
        name: sprint.name,
        goal: sprint.goal ?? '',
        status: sprint.status,
        capacityMinutes: sprint.capacityMinutes ?? null,
        dateRange: [dayjs(sprint.startDate), dayjs(sprint.endDate)]
      })
    },
    [form]
  )

  const handleDelete = useCallback(
    (sprint: SprintDTO) => {
      Modal.confirm({
        title: t('sprints.deleteConfirmTitle', { defaultValue: 'Elimina sprint' }),
        content: t('sprints.deleteConfirmBody', {
          defaultValue:
            'Confermi di voler eliminare questo sprint? I task rimarranno ma non saranno più associati.'
        }),
        okText: t('common.delete', { defaultValue: 'Elimina' }),
        okButtonProps: { danger: true },
        cancelText: t('common.cancel', { defaultValue: 'Annulla' }),
        onOk: async () => {
          try {
            if (!projectId) {
              return
            }
            await dispatch(deleteSprint({ projectId, sprintId: sprint.id })).unwrap()
            if (selectedSprintId === sprint.id) {
              setSelectedSprintId(null)
            }
            messageApi.success(t('sprints.deleteSuccess', { defaultValue: 'Sprint eliminato' }))
          } catch (error) {
            messageApi.error(
              t('sprints.deleteError', { defaultValue: 'Errore durante l’eliminazione' })
            )
          }
        }
      })
    },
    [dispatch, messageApi, projectId, selectedSprintId, t]
  )

  const handleFormSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields()
      if (!projectId) {
        return
      }

      const [start, end] = values.dateRange as [dayjs.Dayjs, dayjs.Dayjs]
      const goal = typeof values.goal === 'string' ? values.goal : undefined
      const capacityMinutes =
        typeof values.capacityMinutes === 'number' ? values.capacityMinutes : undefined
      const startDate = start.format('YYYY-MM-DD')
      const endDate = end.format('YYYY-MM-DD')

      if (editingSprint) {
        await dispatch(
          updateSprint({
            sprintId: editingSprint.id,
            input: {
              name: values.name as string,
              goal,
              status: values.status as SprintDTO['status'],
              capacityMinutes,
              startDate,
              endDate
            }
          })
        ).unwrap()
        messageApi.success(t('sprints.updateSuccess', { defaultValue: 'Sprint aggiornato' }))
      } else {
        const created = await dispatch(
          createSprint({
            projectId,
            name: values.name as string,
            goal,
            status: values.status as SprintDTO['status'],
            capacityMinutes,
            startDate,
            endDate
          })
        ).unwrap()
        setSelectedSprintId(created.id)
        messageApi.success(t('sprints.createSuccess', { defaultValue: 'Sprint creato' }))
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

  const taskTableData = useMemo<TaskTableRecord[]>(() => {
    if (!selectedDetails) {
      return []
    }
    return selectedDetails.tasks.map((task) => ({
      key: task.id,
      title: `${task.key} — ${task.title}`,
      status: task.status,
      assignee:
        task.assignee?.displayName ??
        t('tasks.details.unassigned', { defaultValue: 'Non assegnato' }),
      dueDate: task.dueDate
    }))
  }, [selectedDetails, t])

  const taskTableColumns: ColumnsType<TaskTableRecord> = useMemo(
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
    [t, taskStatusColors, token.colorBorder]
  )

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

  const renderGroupHeader = (group: GroupedSprints) => (
    <div
      key={`${group.status}-header`}
      style={{
        display: 'grid',
        gridTemplateColumns,
        alignItems: 'stretch',
        padding: `${token.paddingSM}px 0`,
        background: token.colorBgLayout,
        borderRadius: token.borderRadiusSM
      }}
    >
      <div style={{ paddingInline: token.paddingMD }}>
        <Space size={8} wrap align="center">
          <Typography.Text strong>{group.label}</Typography.Text>
          <Tag color={sprintStatusColors[group.status]} bordered={false}>
            {group.sprints.length}
          </Tag>
          <Typography.Text type="secondary">
            {t('sprints.group.totalTasks', { defaultValue: 'Task' })}: {group.totals.tasks}
          </Typography.Text>
          <Typography.Text type="secondary">
            {t('sprints.estimatedMinutes', { defaultValue: 'Stimati' })}:{' '}
            {group.totals.estimated}
          </Typography.Text>
          <Typography.Text type="secondary">
            {t('sprints.spentMinutes', { defaultValue: 'Registrati' })}:{' '}
            {group.totals.spent}
          </Typography.Text>
          {group.totals.utilization !== null ? (
            <Typography.Text type="secondary">
              {t('sprints.utilization', { defaultValue: 'Utilizzo' })}:{' '}
              {Math.round(group.totals.utilization)}%
            </Typography.Text>
          ) : null}
        </Space>
      </div>
      {timelineSlots.map((slot, index) => {
        const { label, subLabel } = formatSlotLabel(slot)
        return (
          <div
            key={`${group.status}-slot-${slot.valueOf()}`}
            style={{
              borderLeft: index === 0 ? 'none' : `1px solid ${token.colorSplit}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Typography.Text strong>{label}</Typography.Text>
            <Typography.Text type="secondary">{subLabel}</Typography.Text>
          </div>
        )
      })}
    </div>
  )

  const renderSprintRow = (sprint: SprintDTO) => {
    const isSelected = selectedSprintId === sprint.id
    const prefix = `${sprintKeyPrefix}-${String(sprint.sequence ?? 0).padStart(2, '0')}`
    const sprintStart = dayjs(sprint.startDate).startOf('day')
    const sprintEnd = dayjs(sprint.endDate).endOf('day')
    const { left, width } = computeRangePosition(sprintStart, sprintEnd)

    const tasksForSprint =
      isSelected && selectedDetails ? selectedDetails.tasks : ([] as TaskDetailsDTO[])

    return (
      <div
        key={sprint.id}
        onClick={() => handleSprintClick(sprint.id)}
        style={{
          display: 'grid',
          gridTemplateColumns,
          alignItems: 'stretch',
          borderRadius: token.borderRadiusLG,
          border: isSelected
            ? `2px solid ${token.colorPrimary}`
            : `1px solid ${token.colorBorderSecondary}`,
          background: isSelected ? token.colorPrimaryBg : token.colorBgContainer,
          boxShadow: 'none',
          cursor: 'pointer',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease'
        }}
      >
        <div
          style={{
            padding: `${token.paddingMD}px ${token.paddingLG}px`,
            borderRight: `1px solid ${token.colorSplit}`,
            display: 'flex',
            flexDirection: 'column',
            gap: token.marginXS
          }}
        >
          <Space size={token.marginXS} wrap align="center">
            <Typography.Text type="secondary">{prefix}</Typography.Text>
            <Typography.Text strong>{sprint.name}</Typography.Text>
          </Space>
          <Space size={token.marginXS} wrap>
            <Tag color={sprintStatusColors[sprint.status]} bordered={false}>
              {t(`sprints.status.${sprint.status}`, { defaultValue: sprint.status })}
            </Tag>
            <Tag bordered={false}>
              {t('sprints.totalTasks', { defaultValue: 'Task totali' })}:{' '}
              {sprint.metrics.totalTasks}
            </Tag>
            {sprint.capacityMinutes !== null ? (
              <Tag bordered={false}>
                {t('sprints.capacityMinutes', { defaultValue: 'Capacità (minuti)' })}:{' '}
                {sprint.capacityMinutes}
              </Tag>
            ) : null}
          </Space>
          <Typography.Text type="secondary">
            {formatDateRange(sprint.startDate, sprint.endDate)}
          </Typography.Text>
            {sprint.goal ? (
              <Typography.Paragraph
                type="secondary"
                ellipsis={{ rows: 2, expandable: false }}
                style={{ marginBottom: 0 }}
              >
                {sprint.goal}
              </Typography.Paragraph>
            ) : null}
          {canManage ? (
            <Space size={token.marginXS} wrap>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={(event) => {
                  event.stopPropagation()
                  handleOpenEdit(sprint)
                }}
              >
                {t('common.edit', { defaultValue: 'Modifica' })}
              </Button>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={(event) => {
                  event.stopPropagation()
                  handleDelete(sprint)
                }}
              >
                {t('common.delete', { defaultValue: 'Elimina' })}
              </Button>
            </Space>
          ) : null}
        </div>
        <div
          style={{
            position: 'relative',
            gridColumn: `2 / span ${timelineSlots.length}`,
            minHeight: 120,
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              gridTemplateColumns: `repeat(${timelineSlots.length}, minmax(${slotWidth}px, 1fr))`,
              pointerEvents: 'none'
            }}
          >
            {timelineSlots.map((slot, index) => (
              <div
                key={`${sprint.id}-grid-${slot.valueOf()}`}
                style={{
                  borderLeft: index === 0 ? 'none' : `1px solid ${token.colorSplit}`
                }}
              />
            ))}
          </div>

          <div
            style={{
              position: 'absolute',
              top: token.paddingMD,
              height: 56,
              borderRadius: token.borderRadiusLG,
              background: sprintStatusColors[sprint.status],
              color: token.colorWhite,
              padding: `${token.paddingXS}px ${token.paddingSM}px`,
              display: 'flex',
              alignItems: 'center',
              gap: token.marginSM,
              boxShadow: token.boxShadowTertiary,
              ...{ left, width }
            }}
          >
            <Typography.Text strong style={{ color: token.colorWhite }}>
              {sprint.name}
            </Typography.Text>
            <Typography.Text style={{ color: token.colorWhite }}>
              {t('sprints.totalTasks', { defaultValue: 'Task totali' })}:{' '}
              {sprint.metrics.totalTasks}
            </Typography.Text>
            {typeof sprint.metrics.utilizationPercent === 'number' ? (
              <Typography.Text style={{ color: token.colorWhite }}>
                {t('sprints.utilization', { defaultValue: 'Utilizzo' })}:{' '}
                {Math.round(sprint.metrics.utilizationPercent)}%
              </Typography.Text>
            ) : null}
          </div>

          {tasksForSprint.map((task) => {
            const taskStart = dayjs(task.createdAt)
            const taskEnd = task.dueDate ? dayjs(task.dueDate).endOf('day') : taskStart.add(12, 'hour')
            const position = computeRangePosition(taskStart, taskEnd)
            return (
              <div
                key={task.id}
                style={{
                  position: 'absolute',
                  top: 72,
                  height: 40,
                  borderRadius: token.borderRadiusSM,
                  background: token.colorInfoBg,
                  border: `1px solid ${token.colorInfoBorder}`,
                  color: token.colorInfoText,
                  padding: `${token.paddingXXS}px ${token.paddingXS}px`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: token.marginXS,
                  boxShadow: token.boxShadowTertiary,
                  ...position
                }}
              >
                <Typography.Text strong ellipsis style={{ maxWidth: '60%' }}>
                  {task.key}
                </Typography.Text>
                <Typography.Text ellipsis style={{ maxWidth: '40%' }}>
                  {task.title}
                </Typography.Text>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <Flex vertical gap={token.marginLG} style={{ width: '100%' }}>
      {messageContext}
      <BorderedPanel>
        <Flex
          align="center"
          justify="space-between"
          wrap
          gap={token.marginMD}
          style={{ width: '100%' }}
        >
          <Space size={token.marginXS}>
            <Typography.Title
              level={5}
              style={{ margin: 0, color: token.colorTextSecondary, fontWeight: 500 }}
            >
              {t('sprints.board.title', { defaultValue: 'Pianificazione sprint' })}
            </Typography.Title>
            {canManage ? (
              <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
                {t('sprints.actions.create', { defaultValue: 'Nuovo sprint' })}
              </Button>
            ) : null}
          </Space>
          <Space size={token.marginXS} align="center">
            <Button
              type="text"
              icon={<ZoomOutOutlined />}
              onClick={handleZoomOut}
              disabled={!canZoomOut}
              title={t('sprints.board.zoomOut', { defaultValue: 'Riduci dettaglio' })}
            />
            <Button
              type="text"
              icon={<ZoomInOutlined />}
              onClick={handleZoomIn}
              disabled={!canZoomIn}
              title={t('sprints.board.zoomIn', { defaultValue: 'Aumenta dettaglio' })}
            />
            <Segmented
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as SprintStatusFilter)}
              options={[
                { label: t('sprints.filters.all', { defaultValue: 'Tutti' }), value: 'all' },
                {
                  label: t('sprints.status.active', { defaultValue: 'In corso' }),
                  value: 'active'
                },
                {
                  label: t('sprints.status.planned', { defaultValue: 'Pianificato' }),
                  value: 'planned'
                },
                {
                  label: t('sprints.status.completed', { defaultValue: 'Completato' }),
                  value: 'completed'
                },
                {
                  label: t('sprints.status.archived', { defaultValue: 'Archiviato' }),
                  value: 'archived'
                }
              ]}
            />
          </Space>
        </Flex>
      </BorderedPanel>

      <Card
        bordered={false}
        style={{
          borderRadius: token.borderRadiusLG,
          background: token.colorBgContainer,
          boxShadow: token.boxShadowTertiary,
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: token.paddingLG }}
      >
        {isLoadingSprints ? (
          <Flex
            align="center"
            justify="center"
            style={{ width: '100%', minHeight: 320 }}
          >
            <Spin />
          </Flex>
        ) : filteredSprints.length === 0 ? (
          <Flex
            align="center"
            justify="center"
            style={{ width: '100%', minHeight: 320 }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t('sprints.empty', {
                defaultValue: 'Non ci sono sprint per questo progetto.'
              })}
            />
          </Flex>
        ) : (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <div style={{ minWidth: boardMinWidth }}>
              <div>
                <div
                  style={{
                    padding: `${token.paddingSM}px ${token.paddingMD}px`,
                    borderRight: `1px solid ${token.colorSplit}`,
                    background: token.colorBgElevated,
                    borderRadius: `${token.borderRadiusSM}px ${token.borderRadiusSM}px 0 0`
                  }}
                >
                  <Typography.Text type="secondary">
                    {t('sprints.board.laneHeader', { defaultValue: 'Sprint' })}
                  </Typography.Text>
                </div>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: gridTemplateColumns,
                  background: token.colorBgElevated,
                  borderRadius: `0 0 ${token.borderRadiusSM}px ${token.borderRadiusSM}px`,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderTop: 'none'
                }}
              >
                <div />
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${timelineSlots.length}, minmax(${slotWidth}px, 1fr))`
                  }}
                >
                  {timelineSlots.map((slot, index) => (
                    <div
                      key={`header-slot-${slot.valueOf()}`}
                      style={{
                        padding: `${token.paddingSM}px ${token.paddingXS}px`,
                        borderLeft: index === 0 ? 'none' : `1px solid ${token.colorSplit}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <Typography.Text strong>
                        {slot.format('DD MMM')}
                      </Typography.Text>
                      <Typography.Text type="secondary">{slot.format('ddd')}</Typography.Text>
                    </div>
                  ))}
                </div>
              </div>

              <Space
                direction="vertical"
                size={token.marginMD}
                style={{ width: '100%', marginTop: token.marginMD }}
              >
                {groupedSprints.map((group) => (
                  <Space
                    direction="vertical"
                    size={token.marginSM}
                    key={group.status}
                    style={{ width: '100%' }}
                  >
                    {renderGroupHeader(group)}
                    <Space
                      direction="vertical"
                      size={token.marginSM}
                      style={{ width: '100%' }}
                    >
                      {group.sprints.map(renderSprintRow)}
                    </Space>
                  </Space>
                ))}
              </Space>
            </div>
          </div>
        )}
      </Card>

      {selectedSprintId && selectedDetails ? (
        <Flex gap={token.marginMD} wrap style={{ width: '100%' }}>
          <Card
            title={selectedDetails.name}
            style={{ flex: '1 1 320px', minWidth: 320 }}
            extra={
              <Tag color={sprintStatusColors[selectedDetails.status]} bordered={false}>
                {t(`sprints.status.${selectedDetails.status}`, {
                  defaultValue: selectedDetails.status
                })}
              </Tag>
            }
          >
            <Space
              direction="vertical"
              size={token.marginSM}
              style={{ width: '100%' }}
            >
              <Typography.Text type="secondary">
                {formatDateRange(selectedDetails.startDate, selectedDetails.endDate)}
              </Typography.Text>
              {selectedDetails.goal ? (
                <Typography.Paragraph style={{ marginBottom: 0 }}>
                  {selectedDetails.goal}
                </Typography.Paragraph>
              ) : null}
              <Flex gap={token.marginLG} wrap>
                <Space direction="vertical" size={4}>
                  <Typography.Text type="secondary">
                    {t('sprints.totalTasks', { defaultValue: 'Task totali' })}
                  </Typography.Text>
                  <Typography.Text strong>{selectedDetails.metrics.totalTasks}</Typography.Text>
                </Space>
                <Space direction="vertical" size={4}>
                  <Typography.Text type="secondary">
                    {t('sprints.estimatedMinutes', { defaultValue: 'Stimati' })}
                  </Typography.Text>
                  <Typography.Text strong>
                    {selectedDetails.metrics.estimatedMinutes ?? 0}
                  </Typography.Text>
                </Space>
                <Space direction="vertical" size={4}>
                  <Typography.Text type="secondary">
                    {t('sprints.spentMinutes', { defaultValue: 'Registrati' })}
                  </Typography.Text>
                  <Typography.Text strong>
                    {selectedDetails.metrics.timeSpentMinutes}
                  </Typography.Text>
                </Space>
                <Space direction="vertical" size={4}>
                  <Typography.Text type="secondary">
                    {t('sprints.utilization', { defaultValue: 'Utilizzo' })}
                  </Typography.Text>
                  <Typography.Text strong>
                    {selectedDetails.metrics.utilizationPercent
                      ? Math.round(selectedDetails.metrics.utilizationPercent)
                      : 0}
                    %
                  </Typography.Text>
                </Space>
              </Flex>
            </Space>
          </Card>

          <Card
            title={t('sprints.tasksOverview', { defaultValue: 'Task dello sprint' })}
            style={{ flex: '2 1 480px', minWidth: 360 }}
            bodyStyle={{ padding: 0 }}
          >
            {isLoadingDetails ? (
              <Flex
                align="center"
                justify="center"
                style={{ width: '100%', minHeight: 240 }}
              >
                <Spin />
              </Flex>
            ) : (
              <Table<TaskTableRecord>
                size="small"
                rowKey="key"
                columns={taskTableColumns}
                dataSource={taskTableData}
                pagination={{
                  pageSize: 8,
                  showSizeChanger: false
                }}
                locale={{
                  emptyText: t('sprints.details.emptyTasks', {
                    defaultValue: 'Nessun task nello sprint'
                  })
                }}
              />
            )}
          </Card>
        </Flex>
      ) : null}

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
                message: t('sprints.form.dateRequired', { defaultValue: 'Seleziona inizio e fine' })
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
              options={[
                {
                  label: t('sprints.status.planned', { defaultValue: 'Pianificato' }),
                  value: 'planned'
                },
                {
                  label: t('sprints.status.active', { defaultValue: 'In corso' }),
                  value: 'active'
                },
                {
                  label: t('sprints.status.completed', { defaultValue: 'Completato' }),
                  value: 'completed'
                },
                {
                  label: t('sprints.status.archived', { defaultValue: 'Archiviato' }),
                  value: 'archived'
                }
              ]}
            />
          </Form.Item>

          <Form.Item
            label={t('sprints.fields.capacityMinutes', { defaultValue: 'Capacità (minuti)' })}
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
