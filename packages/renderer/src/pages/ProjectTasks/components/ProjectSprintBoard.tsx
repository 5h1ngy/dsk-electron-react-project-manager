import { useEffect, useMemo, useState, type JSX } from 'react'
import { Bar } from '@ant-design/plots'
import {
  Button,
  Card,
  DatePicker,
  Empty,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
  theme,
  message
} from 'antd'
import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import { BorderedPanel } from '@renderer/components/Surface/BorderedPanel'
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

interface ProjectSprintBoardProps {
  projectId: string | null
  canManage: boolean
}

type SprintTimelineDatum = {
  id: string
  name: string
  status: SprintDTO['status']
  start: number
  end: number
  range: [number, number]
  metrics: SprintDTO['metrics']
  goal: string | null
  key: string
}

type TaskTimelineDatum = {
  id: string
  key: string
  title: string
  status: TaskDetailsDTO['status']
  range: [number, number]
  assignee: string
}

export const ProjectSprintBoard = ({
  projectId,
  canManage
}: ProjectSprintBoardProps): JSX.Element => {
  const { t } = useTranslation('projects')
  const dispatch = useAppDispatch()
  const [messageApi, messageContext] = message.useMessage()
  const { token } = theme.useToken()

  const sprintState = useAppSelector((state) =>
    projectId ? selectSprintsForProject(projectId)(state) : undefined
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

  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null)
  const selectedSprint = useMemo(
    () => sprints.find((sprint) => sprint.id === selectedSprintId) ?? null,
    [selectedSprintId, sprints]
  )

  const selectedDetailsState = useAppSelector((state) =>
    selectedSprintId ? selectSprintDetails(selectedSprintId)(state) : undefined
  )
  const selectedDetails = selectedDetailsState?.data ?? null
  const isLoadingDetails = selectedDetailsState?.status === 'loading'

  const [formVisible, setFormVisible] = useState(false)
  const [form] = Form.useForm()
  const [editingSprint, setEditingSprint] = useState<SprintDTO | null>(null)

  useEffect(() => {
    if (projectId && sprintStatus === 'idle') {
      dispatch(fetchSprints(projectId))
    }
  }, [dispatch, projectId, sprintStatus])

  useEffect(() => {
    setSelectedSprintId(null)
  }, [projectId])

  useEffect(() => {
    if (selectedSprintId) {
      void dispatch(fetchSprintDetails(selectedSprintId))
    }
  }, [dispatch, selectedSprintId])

  useEffect(() => {
    if (selectedSprintId && !sprints.some((sprint) => sprint.id === selectedSprintId)) {
      setSelectedSprintId(null)
    }
  }, [selectedSprintId, sprints])

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

  const handleOpenCreate = () => {
    setEditingSprint(null)
    form.resetFields()
    form.setFieldsValue({
      name: '',
      goal: '',
      status: 'planned',
      capacityMinutes: null,
      dateRange: [dayjs().startOf('day'), dayjs().add(14, 'day').startOf('day')]
    })
    setFormVisible(true)
  }

  const handleOpenEdit = (sprint: SprintDTO) => {
    setEditingSprint(sprint)
    form.resetFields()
    form.setFieldsValue({
      name: sprint.name,
      goal: sprint.goal ?? '',
      status: sprint.status,
      capacityMinutes: sprint.capacityMinutes ?? null,
      dateRange: [dayjs(sprint.startDate), dayjs(sprint.endDate)]
    })
    setFormVisible(true)
  }

  const handleDelete = (sprint: SprintDTO) => {
    Modal.confirm({
      title: t('sprints.deleteConfirmTitle', { defaultValue: 'Elimina sprint' }),
      content: t('sprints.deleteConfirmBody', {
        defaultValue:
          'Confermi di voler eliminare questo sprint? I task rimarranno ma non saranno più associati.'
      }),
      okType: 'danger',
      okText: t('common.delete', { defaultValue: 'Elimina' }),
      cancelText: t('common.cancel', { defaultValue: 'Annulla' }),
      onOk: async () => {
        try {
          await dispatch(deleteSprint({ projectId, sprintId: sprint.id })).unwrap()
          messageApi.success(t('sprints.deleteSuccess', { defaultValue: 'Sprint eliminato' }))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          messageApi.error(errorMessage)
        }
      }
    })
  }

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields()
      const [start, end] = values.dateRange ?? []
      const payload = {
        name: values.name?.trim() ?? '',
        goal: values.goal?.trim() ? values.goal.trim() : null,
        startDate: start ? dayjs(start).format('YYYY-MM-DD') : undefined,
        endDate: end ? dayjs(end).format('YYYY-MM-DD') : undefined,
        status: values.status,
        capacityMinutes:
          values.capacityMinutes === null || values.capacityMinutes === undefined
            ? null
            : Number(values.capacityMinutes)
      }

      if (!payload.name || !payload.startDate || !payload.endDate) {
        messageApi.error(
          t('sprints.form.invalid', { defaultValue: 'Compila tutti i campi obbligatori' })
        )
        return
      }

      if (editingSprint) {
        await dispatch(
          updateSprint({
            sprintId: editingSprint.id,
            input: payload
          })
        ).unwrap()
        messageApi.success(t('sprints.updateSuccess', { defaultValue: 'Sprint aggiornato' }))
      } else {
        await dispatch(
          createSprint({
            projectId,
            name: payload.name,
            goal: payload.goal,
            startDate: payload.startDate,
            endDate: payload.endDate,
            status: payload.status,
            capacityMinutes: payload.capacityMinutes ?? null
          })
        ).unwrap()
        messageApi.success(t('sprints.createSuccess', { defaultValue: 'Sprint creato' }))
      }

      setFormVisible(false)
      setEditingSprint(null)
    } catch (error) {
      if (error instanceof Error) {
        messageApi.error(error.message)
      }
    }
  }

  const sprintStatusColors: Record<SprintDTO['status'], string> = {
    planned: token.colorWarning,
    active: token.colorPrimary,
    completed: token.colorSuccess,
    archived: token.colorTextTertiary
  }

  const taskStatusColors: Record<TaskDetailsDTO['status'], string> = {
    todo: token.colorTextTertiary,
    in_progress: token.colorPrimary,
    blocked: token.colorError,
    done: token.colorSuccess
  }

  const sprintTimelineData: SprintTimelineDatum[] = useMemo(
    () =>
      sprints.map((sprint) => {
        const start = dayjs(sprint.startDate).valueOf()
        const end = dayjs(sprint.endDate).valueOf()
        const key = `SPR-${String(sprint.sequence ?? 0).padStart(2, '0')}`
        return {
          id: sprint.id,
          name: sprint.name,
          status: sprint.status,
          start,
          end,
          range: [start, end],
          metrics: sprint.metrics,
          goal: sprint.goal ?? null,
          key
        }
      }),
    [sprints]
  )

  const sprintTimelineConfig = useMemo(
    () => ({
      data: sprintTimelineData,
      xField: 'range',
      yField: 'key',
      isRange: true,
      seriesField: 'status',
      legend: false,
      interactions: [
        { type: 'element-highlight' },
        { type: 'element-active' }
      ],
      tooltip: {
        customContent: (_value: string, items: Array<{ data: SprintTimelineDatum }> | undefined) => {
          if (!items || items.length === 0) {
            return ''
          }
          const datum = items[0].data
          const startLabel = dayjs(datum.start).format('DD MMM YYYY')
          const endLabel = dayjs(datum.end).format('DD MMM YYYY')
          return `<div class="g2-tooltip">
              <div style="margin-bottom:4px;font-weight:600;">${datum.key}</div>
              <div style="margin-bottom:4px;font-weight:600;">${datum.name}</div>
              <div>${t('sprints.status.label', {
                defaultValue: 'Stato'
              })}: ${t(`sprints.status.${datum.status}`, { defaultValue: datum.status })}</div>
              <div>${startLabel} - ${endLabel}</div>
              <div>${t('sprints.totalTasks', { defaultValue: 'Task totali' })}: ${
                datum.metrics.totalTasks
              }</div>
            </div>`
        }
      },
      xAxis: {
        type: 'time',
        tickCount: 6,
        label: {
          autoRotate: true,
          formatter: (value: string) => dayjs(Number(value)).format('DD MMM YYYY')
        }
      },
      state: {
        active: {
          style: {
            lineWidth: 2,
            stroke: token.colorPrimary,
            shadowColor: token.colorPrimary,
            shadowBlur: 12,
            fillOpacity: 1
          }
        },
        inactive: {
          style: {
            fillOpacity: 0.2
          }
        }
      },
      barStyle: (datum: SprintTimelineDatum) => ({
        fill: sprintStatusColors[datum.status],
        fillOpacity: datum.id === selectedSprint?.id ? 0.85 : 0.45,
        stroke: datum.id === selectedSprint?.id ? token.colorPrimary : token.colorBorderSecondary,
        lineWidth: datum.id === selectedSprint?.id ? 2 : 1
      })
    }),
    [sprintTimelineData, sprintStatusColors, selectedSprint?.id, token, t]
  )

  const tasksTimelineData: TaskTimelineDatum[] = useMemo(() => {
    if (!selectedDetails?.tasks) {
      return []
    }
    return selectedDetails.tasks.map((task) => {
      const start = dayjs(task.createdAt).valueOf()
      const due = task.dueDate ? dayjs(task.dueDate).valueOf() : undefined
      const fallbackEnd = task.status === 'done' ? dayjs(task.updatedAt).valueOf() : start
      let end = due ?? fallbackEnd
      if (end < start) {
        end = start
      }
      return {
        id: task.id,
        key: task.key,
        title: task.title,
        status: task.status,
        range: [start, end],
        assignee: task.assignee?.displayName ?? task.assignee?.username ?? t('common.unassigned')
      }
    })
  }, [selectedDetails?.tasks, t])

  const tasksTimelineConfig = useMemo(
    () => ({
      data: tasksTimelineData,
      xField: 'range',
      yField: 'key',
      isRange: true,
      legend: false,
      interactions: [
        { type: 'element-highlight' },
        { type: 'element-active' }
      ],
      tooltip: {
        customContent: (_value: string, items: Array<{ data: TaskTimelineDatum }> | undefined) => {
          if (!items || items.length === 0) {
            return ''
          }
          const datum = items[0].data
          const startLabel = dayjs(datum.range[0]).format('DD MMM YYYY')
          const endLabel = dayjs(datum.range[1]).format('DD MMM YYYY')
          return `<div class="g2-tooltip">
              <div style="margin-bottom:4px;font-weight:600;">${datum.key}</div>
              <div>${datum.title}</div>
              <div>${t('tasks.details.assignee', { defaultValue: 'Assegnatario' })}: ${
                datum.assignee
              }</div>
              <div>${t('tasks.details.status', { defaultValue: 'Stato' })}: ${
                datum.status
              }</div>
              <div>${startLabel} - ${endLabel}</div>
            </div>`
        }
      },
      xAxis: {
        type: 'time',
        tickCount: 6,
        label: {
          formatter: (value: string) => dayjs(Number(value)).format('DD MMM YYYY')
        }
      },
      state: {
        active: {
          style: {
            lineWidth: 1.5,
            stroke: token.colorPrimary,
            shadowColor: token.colorPrimary,
            shadowBlur: 10,
            fillOpacity: 1
          }
        },
        inactive: {
          style: {
            fillOpacity: 0.3
          }
        }
      },
      barStyle: (datum: TaskTimelineDatum) => ({
        fill: taskStatusColors[datum.status],
        fillOpacity: 0.75,
        stroke: token.colorBorderSecondary,
        lineWidth: 0.8,
        radius: token.borderRadiusSM
      })
    }),
    [taskStatusColors, tasksTimelineData, token, t]
  )

  const selectedTasksCount = selectedDetails?.tasks?.length ?? 0
  const selectedSprintMetrics = selectedSprint?.metrics

  const handleSprintChartReady = (plot: any) => {
    plot.on('element:click', (event: { data?: { data?: SprintTimelineDatum } }) => {
      const datum = event?.data?.data
      if (datum?.id) {
        setSelectedSprintId((current) => (current === datum.id ? null : datum.id))
      }
    })
  }

  const selectedSprintTimeRange = selectedSprint
    ? `${dayjs(selectedSprint.startDate).format('DD MMM YYYY')} - ${dayjs(
        selectedSprint.endDate
      ).format('DD MMM YYYY')}`
    : ''

  return (
    <Flex vertical gap={24} style={{ width: '100%' }}>
      {messageContext}
      <BorderedPanel padding="md" style={{ width: '100%' }}>
        <Flex align="center" gap={12} wrap>
          {canManage ? (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
              {t('sprints.actions.create', { defaultValue: 'Nuovo sprint' })}
            </Button>
          ) : null}
        </Flex>
      </BorderedPanel>

      <Card styles={{ body: { padding: 24 } }}>
        {isLoadingSprints ? (
          <Flex justify="center" align="center" style={{ width: '100%', minHeight: 280 }}>
            <Spin size="large" />
          </Flex>
        ) : sprintTimelineData.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t('sprints.empty', {
              defaultValue: 'Non ci sono sprint per questo progetto.'
            })}
          />
        ) : (
          <Bar {...sprintTimelineConfig} onReady={handleSprintChartReady} />
        )}
      </Card>

      {!selectedSprint && !isLoadingSprints && sprintTimelineData.length > 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('sprints.selectPrompt', {
            defaultValue: 'Seleziona uno sprint per visualizzare i dettagli.'
          })}
        />
      ) : null}

      {selectedSprint ? (
        <Flex gap={16} wrap style={{ width: '100%' }}>
          <Card
            title={selectedSprint.name}
            style={{ flex: '1 1 320px', minWidth: 280 }}
            actions={
              canManage
                ? [
                    <Button
                      key="edit"
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => handleOpenEdit(selectedSprint)}
                    >
                      {t('common.edit', { defaultValue: 'Modifica' })}
                    </Button>,
                    <Button
                      key="delete"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(selectedSprint)}
                    >
                      {t('common.delete', { defaultValue: 'Elimina' })}
                    </Button>
                  ]
                : undefined
            }
          >
            <Space size={12} wrap>
              <Tag color={sprintStatusColors[selectedSprint.status]}>
                {t(`sprints.status.${selectedSprint.status}`, {
                  defaultValue: selectedSprint.status
                })}
              </Tag>
              <Space size={6} align="center">
                <CalendarOutlined />
                <Typography.Text>{selectedSprintTimeRange}</Typography.Text>
              </Space>
              {selectedSprint.capacityMinutes !== null ? (
                <Space size={6} align="center">
                  <ClockCircleOutlined />
                  <Typography.Text>
                    {t('sprints.capacityMinutes', { defaultValue: 'Capacità' })}:{' '}
                    {selectedSprint.capacityMinutes}
                  </Typography.Text>
                </Space>
              ) : null}
            </Space>
            {selectedSprint.goal ? (
              <Typography.Paragraph style={{ marginTop: 16 }} type="secondary">
                {selectedSprint.goal}
              </Typography.Paragraph>
            ) : null}

            {selectedSprintMetrics ? (
              <Flex wrap gap={16} style={{ marginTop: 16 }}>
                <Statistic
                  title={t('sprints.totalTasks', { defaultValue: 'Task totali' })}
                  value={selectedSprintMetrics.totalTasks}
                />
                <Statistic
                  title={t('sprints.estimatedMinutes', { defaultValue: 'Stimati' })}
                  value={selectedSprintMetrics.estimatedMinutes ?? 0}
                />
                <Statistic
                  title={t('sprints.spentMinutes', { defaultValue: 'Registrati' })}
                  value={selectedSprintMetrics.timeSpentMinutes}
                />
                <Statistic
                  title={t('sprints.utilization', { defaultValue: 'Utilizzo' })}
                  value={
                    Number.isFinite(selectedSprintMetrics.utilizationPercent)
                      ? Math.round(selectedSprintMetrics.utilizationPercent ?? 0)
                      : 0
                  }
                  suffix="%"
                />
              </Flex>
            ) : null}
          </Card>

        <Card
            title={t('sprints.tasksTimeline', { defaultValue: 'Timeline dei task' })}
            style={{ flex: '2 1 480px', minWidth: 320 }}
          >
            {isLoadingDetails ? (
              <Flex justify="center" align="center" style={{ width: '100%', minHeight: 240 }}>
                <Spin />
              </Flex>
            ) : selectedTasksCount === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t('sprints.details.emptyTasks', {
                  defaultValue: 'Nessun task nello sprint'
                })}
              />
            ) : (
              <Bar {...tasksTimelineConfig} />
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
            <Select
              options={[
                { value: 'planned', label: t('sprints.status.planned', { defaultValue: 'Pianificato' }) },
                { value: 'active', label: t('sprints.status.active', { defaultValue: 'In corso' }) },
                { value: 'completed', label: t('sprints.status.completed', { defaultValue: 'Completato' }) },
                { value: 'archived', label: t('sprints.status.archived', { defaultValue: 'Archiviato' }) }
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

ProjectSprintBoard.displayName = 'ProjectSprintBoard'

export default ProjectSprintBoard
