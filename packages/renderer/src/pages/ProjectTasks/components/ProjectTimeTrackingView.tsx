import { useCallback, useEffect, useMemo, useState, type JSX } from 'react'
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
  Table,
  Tag,
  Typography,
  message
} from 'antd'
import { FieldTimeOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import type { TaskDetails } from '@renderer/store/slices/tasks'
import {
  deleteTimeEntry,
  fetchProjectTimeSummary,
  logTimeEntry,
  resetTimeTrackingMutation,
  selectTimeMutationError,
  selectTimeMutationStatus,
  selectTimeSummaryEntries,
  selectTimeSummaryForProject,
  selectTimeSummaryStatus,
  updateTimeEntry
} from '@renderer/store/slices/timeTracking'
import type { TimeEntryDTO } from '@main/services/timeTracking/types'

const { RangePicker } = DatePicker

interface ProjectTimeTrackingViewProps {
  projectId: string | null
  tasks: TaskDetails[]
  canManage: boolean
}

interface TimeEntryFormValues {
  taskId: string
  durationMinutes: number
  entryDate: dayjs.Dayjs
  description?: string
}

export const ProjectTimeTrackingView = ({
  projectId,
  tasks,
  canManage
}: ProjectTimeTrackingViewProps): JSX.Element => {
  const { t } = useTranslation('projects')
  const dispatch = useAppDispatch()
  const [messageApi, messageContext] = message.useMessage()
  const summaryState = useAppSelector((state) =>
    projectId ? selectTimeSummaryForProject(projectId)(state) : undefined
  )
  const entries = useAppSelector((state) =>
    projectId ? selectTimeSummaryEntries(projectId)(state) : []
  )
  const summaryStatus = useAppSelector((state) =>
    projectId ? selectTimeSummaryStatus(projectId)(state) : 'idle'
  )
  const mutationStatus = useAppSelector(selectTimeMutationStatus)
  const mutationError = useAppSelector(selectTimeMutationError)
  const [rangeFilter, setRangeFilter] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(
    null
  )
  const [isModalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [activeEntry, setActiveEntry] = useState<TimeEntryDTO | null>(null)
  const [form] = Form.useForm<TimeEntryFormValues>()

  useEffect(() => {
    if (projectId && summaryStatus === 'idle') {
      dispatch(fetchProjectTimeSummary({ projectId }))
    }
  }, [dispatch, projectId, summaryStatus])

  useEffect(() => {
    if (mutationStatus === 'failed' && mutationError) {
      messageApi.error(mutationError)
      dispatch(resetTimeTrackingMutation())
    }
    if (mutationStatus === 'succeeded') {
      dispatch(resetTimeTrackingMutation())
    }
  }, [dispatch, messageApi, mutationError, mutationStatus])

  useEffect(() => {
    if (projectId && rangeFilter) {
      const [start, end] = rangeFilter
      dispatch(
        fetchProjectTimeSummary({
          projectId,
          filters: {
            from: start ? start.format('YYYY-MM-DD') : null,
            to: end ? end.format('YYYY-MM-DD') : null
          }
        })
      )
    }
  }, [dispatch, projectId, rangeFilter])

  const totalMinutes = summaryState?.summary?.totalMinutes ?? 0
  const byUser = summaryState?.summary?.byUser ?? []
  const byTask = summaryState?.summary?.byTask ?? []

  const taskOptions = useMemo(
    () =>
      tasks.map((task) => ({
        value: task.id,
        label: `${task.key} - ${task.title}`
      })),
    [tasks]
  )

  const openCreateModal = useCallback(() => {
    setModalMode('create')
    setActiveEntry(null)
    form.resetFields()
    form.setFieldsValue({
      taskId: taskOptions[0]?.value,
      durationMinutes: 30,
      entryDate: dayjs()
    })
    setModalOpen(true)
  }, [form, taskOptions])

  const openEditModal = useCallback(
    (entry: TimeEntryDTO) => {
      setModalMode('edit')
      setActiveEntry(entry)
      form.resetFields()
      form.setFieldsValue({
        taskId: entry.taskId,
        durationMinutes: entry.durationMinutes,
        entryDate: dayjs(entry.entryDate),
        description: entry.description ?? ''
      })
      setModalOpen(true)
    },
    [form]
  )

  const closeModal = () => {
    setModalOpen(false)
    setActiveEntry(null)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (!projectId) {
        return
      }
      if (modalMode === 'create') {
        await dispatch(
          logTimeEntry({
            taskId: values.taskId,
            durationMinutes: values.durationMinutes,
            entryDate: values.entryDate.format('YYYY-MM-DD'),
            description: values.description?.trim() ?? null
          })
        ).unwrap()
        messageApi.success(t('time.tracking.createSuccess', { defaultValue: 'Tempo registrato' }))
      } else if (activeEntry) {
        await dispatch(
          updateTimeEntry({
            entryId: activeEntry.id,
            input: {
              durationMinutes: values.durationMinutes,
              entryDate: values.entryDate.format('YYYY-MM-DD'),
              description: values.description?.trim() ?? null
            }
          })
        ).unwrap()
        messageApi.success(
          t('time.tracking.updateSuccess', { defaultValue: 'Registrazione aggiornata' })
        )
      }
      setModalOpen(false)
      setActiveEntry(null)
      if (projectId) {
        dispatch(
          fetchProjectTimeSummary({
            projectId,
            filters: {
              from: rangeFilter?.[0]?.format('YYYY-MM-DD') ?? null,
              to: rangeFilter?.[1]?.format('YYYY-MM-DD') ?? null
            }
          })
        )
      }
    } catch (error) {
      if (error instanceof Error) {
        messageApi.error(error.message)
      }
    }
  }

  const handleDelete = useCallback(
    (entry: TimeEntryDTO) => {
      if (!projectId) {
        return
      }
      Modal.confirm({
        title: t('time.tracking.deleteTitle', { defaultValue: 'Elimina registrazione' }),
        content: t('time.tracking.deleteBody', {
          defaultValue: 'Confermi di voler eliminare questa registrazione di tempo?'
        }),
        okType: 'danger',
        okText: t('common.delete', { defaultValue: 'Elimina' }),
        cancelText: t('common.cancel', { defaultValue: 'Annulla' }),
        onOk: async () => {
          try {
            await dispatch(deleteTimeEntry({ projectId, entryId: entry.id })).unwrap()
            messageApi.success(
              t('time.tracking.deleteSuccess', { defaultValue: 'Registrazione eliminata' })
            )
            dispatch(
              fetchProjectTimeSummary({
                projectId,
                filters: {
                  from: rangeFilter?.[0]?.format('YYYY-MM-DD') ?? null,
                  to: rangeFilter?.[1]?.format('YYYY-MM-DD') ?? null
                }
              })
            )
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            messageApi.error(errorMessage)
          }
        }
      })
    },
    [dispatch, messageApi, projectId, rangeFilter, t]
  )

  const columns: ColumnsType<TimeEntryDTO> = useMemo(
    () => [
      {
        title: t('time.tracking.columns.date', { defaultValue: 'Data' }),
        dataIndex: 'entryDate',
        key: 'entryDate',
        render: (value: string) => dayjs(value).format('DD MMM YYYY')
      },
      {
        title: t('time.tracking.columns.task', { defaultValue: 'Task' }),
        dataIndex: 'taskKey',
        key: 'task',
        render: (_value, record) => (
          <Space direction="vertical" size={0}>
            <Typography.Text strong>{record.taskKey}</Typography.Text>
            <Typography.Text type="secondary">{record.taskTitle}</Typography.Text>
          </Space>
        )
      },
      {
        title: t('time.tracking.columns.user', { defaultValue: 'Utente' }),
        dataIndex: ['user', 'displayName'],
        key: 'user',
        render: (_value, record) => record.user.displayName
      },
      {
        title: t('time.tracking.columns.minutes', { defaultValue: 'Minuti' }),
        dataIndex: 'durationMinutes',
        key: 'durationMinutes'
      },
      {
        title: t('time.tracking.columns.description', { defaultValue: 'Descrizione' }),
        dataIndex: 'description',
        key: 'description',
        render: (value: string | null) => value ?? '—'
      },
      {
        title: '',
        key: 'actions',
        width: 150,
        render: (_value, record) => (
          <Space>
            {canManage ? (
              <Button type="link" onClick={() => openEditModal(record)}>
                {t('common.edit', { defaultValue: 'Modifica' })}
              </Button>
            ) : null}
            {canManage ? (
              <Button type="link" danger onClick={() => handleDelete(record)}>
                {t('common.delete', { defaultValue: 'Elimina' })}
              </Button>
            ) : null}
          </Space>
        )
      }
    ],
    [canManage, handleDelete, openEditModal, t]
  )

  return (
    <Flex vertical gap={24} style={{ width: '100%' }}>
      {messageContext}
      <Flex justify="space-between" align="center" wrap>
        <Space size={12} align="center">
          <FieldTimeOutlined style={{ fontSize: 20 }} />
          <Typography.Title level={4} style={{ margin: 0 }}>
            {t('time.tracking.title', { defaultValue: 'Time tracking' })}
          </Typography.Title>
        </Space>
        <Space size={12} wrap>
          <RangePicker
            value={rangeFilter}
            onChange={(value) => setRangeFilter(value as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
            allowEmpty={[true, true]}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              if (projectId) {
                dispatch(
                  fetchProjectTimeSummary({
                    projectId,
                    filters: {
                      from: rangeFilter?.[0]?.format('YYYY-MM-DD') ?? null,
                      to: rangeFilter?.[1]?.format('YYYY-MM-DD') ?? null
                    }
                  })
                )
              }
            }}
          >
            {t('common.refresh', { defaultValue: 'Aggiorna' })}
          </Button>
          {canManage ? (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
              disabled={!canManage || taskOptions.length === 0}
            >
              {t('time.tracking.actions.logTime', { defaultValue: 'Registra tempo' })}
            </Button>
          ) : null}
        </Space>
      </Flex>

      <Flex wrap gap={24}>
        <Card style={{ minWidth: 240 }}>
          <Space direction="vertical">
            <Typography.Text type="secondary">
              {t('time.tracking.totalMinutes', { defaultValue: 'Minuti registrati' })}
            </Typography.Text>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {totalMinutes}
            </Typography.Title>
          </Space>
        </Card>
        <Card
          style={{ flex: 1, minWidth: 260 }}
          title={t('time.tracking.byUser', { defaultValue: 'Per utente' })}
        >
          {byUser.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t('time.tracking.noData', { defaultValue: 'Nessun dato' })}
            />
          ) : (
            <Flex vertical gap={8}>
              {byUser.map((entry) => (
                <Flex key={entry.user.id} justify="space-between" align="center">
                  <Typography.Text>{entry.user.displayName}</Typography.Text>
                  <Tag color="blue">{entry.minutes}</Tag>
                </Flex>
              ))}
            </Flex>
          )}
        </Card>
        <Card
          style={{ flex: 1, minWidth: 260 }}
          title={t('time.tracking.byTask', { defaultValue: 'Per task' })}
        >
          {byTask.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t('time.tracking.noData', { defaultValue: 'Nessun dato' })}
            />
          ) : (
            <Flex vertical gap={8}>
              {byTask.map((entry) => (
                <Flex key={entry.taskId} justify="space-between" align="center">
                  <Typography.Text>{entry.taskKey}</Typography.Text>
                  <Tag color="purple">{entry.minutes}</Tag>
                </Flex>
              ))}
            </Flex>
          )}
        </Card>
      </Flex>

      {summaryStatus === 'loading' ? (
        <Flex align="center" justify="center" style={{ width: '100%', padding: 48 }}>
          <Spin size="large" />
        </Flex>
      ) : null}

      {entries.length === 0 && summaryStatus !== 'loading' ? (
        <Empty
          description={t('time.tracking.noEntries', {
            defaultValue: 'Non ci sono registrazioni di tempo per il periodo selezionato.'
          })}
        />
      ) : null}

      {entries.length > 0 ? (
        <Table
          rowKey={(record) => record.id}
          columns={columns}
          dataSource={entries}
          pagination={{ pageSize: 10 }}
        />
      ) : null}

      <Modal
        open={isModalOpen}
        title={
          modalMode === 'create'
            ? t('time.tracking.createTitle', { defaultValue: 'Registra tempo' })
            : t('time.tracking.editTitle', { defaultValue: 'Modifica registrazione' })
        }
        onCancel={closeModal}
        onOk={handleSubmit}
        confirmLoading={mutationStatus === 'loading'}
        okText={t('common.save', { defaultValue: 'Salva' })}
        cancelText={t('common.cancel', { defaultValue: 'Annulla' })}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={t('time.tracking.fields.task', { defaultValue: 'Task' })}
            name="taskId"
            rules={[{ required: true }]}
          >
            <Select
              options={taskOptions}
              showSearch
              optionFilterProp="label"
              disabled={modalMode === 'edit'}
            />
          </Form.Item>
          <Form.Item
            label={t('time.tracking.fields.entryDate', { defaultValue: 'Data' })}
            name="entryDate"
            rules={[{ required: true }]}
          >
            <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label={t('time.tracking.fields.duration', { defaultValue: 'Durata (minuti)' })}
            name="durationMinutes"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} max={1_000} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label={t('time.tracking.fields.description', { defaultValue: 'Descrizione' })}
            name="description"
          >
            <Input.TextArea rows={3} maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  )
}

export default ProjectTimeTrackingView
