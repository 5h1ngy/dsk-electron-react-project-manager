import { useEffect, useState, type JSX, type CSSProperties } from 'react'
import {
  Button,
  Card,
  Col,
  DatePicker,
  Drawer,
  Empty,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  message
} from 'antd'
import {
  CalendarOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  FileSearchOutlined,
  PlusOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
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
import type { SprintDTO } from '@main/services/sprint/types'
import type { TaskDetailsDTO } from '@main/services/task/types'

const { RangePicker } = DatePicker

interface ProjectSprintBoardProps {
  projectId: string | null
  canManage: boolean
}

const metricsTagStyle: CSSProperties = {
  marginBottom: 8
}

const placeholderTasks: TaskDetailsDTO[] = []

export const ProjectSprintBoard = ({
  projectId,
  canManage
}: ProjectSprintBoardProps): JSX.Element => {
  const { t } = useTranslation('projects')
  const dispatch = useAppDispatch()
  const [messageApi, messageContext] = message.useMessage()

  const sprintState = useAppSelector((state) =>
    projectId ? selectSprintsForProject(projectId)(state) : undefined
  )
  const sprints = useAppSelector((state) => (projectId ? selectSprintList(projectId)(state) : []))

  const [detailsSprintId, setDetailsSprintId] = useState<string | null>(null)
  const detailsState = useAppSelector((state) =>
    detailsSprintId ? selectSprintDetails(detailsSprintId)(state) : undefined
  )
  const [isDetailVisible, setDetailVisible] = useState(false)

  const [formVisible, setFormVisible] = useState(false)
  const [form] = Form.useForm()
  const [editingSprint, setEditingSprint] = useState<SprintDTO | null>(null)

  const sprintStatus = sprintState?.status ?? 'idle'

  useEffect(() => {
    if (projectId && sprintStatus === 'idle') {
      dispatch(fetchSprints(projectId))
    }
  }, [dispatch, projectId, sprintStatus])

  useEffect(() => {
    if (detailsSprintId) {
      void dispatch(fetchSprintDetails(detailsSprintId))
    }
  }, [detailsSprintId, dispatch])

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

  const handleOpenDetails = (sprintId: string) => {
    setDetailsSprintId(sprintId)
    setDetailVisible(true)
  }

  const renderMetrics = (sprint: SprintDTO) => {
    const total = sprint.metrics.totalTasks
    const timeSpent = sprint.metrics.timeSpentMinutes
    const estimated = sprint.metrics.estimatedMinutes ?? 0
    const capacity = sprint.capacityMinutes ?? null
    const utilization = sprint.metrics.utilizationPercent ?? 0

    return (
      <Flex vertical gap={12} style={{ width: '100%' }}>
        <Flex wrap gap={8}>
          <Tag style={metricsTagStyle}>
            {t('sprints.totalTasks', { defaultValue: 'Task totali' })}: {total}
          </Tag>
          <Tag style={metricsTagStyle} color="blue">
            {t('sprints.estimatedMinutes', { defaultValue: 'Stimati' })}: {estimated}
          </Tag>
          <Tag style={metricsTagStyle} color="green">
            {t('sprints.spentMinutes', { defaultValue: 'Registrati' })}: {timeSpent}
          </Tag>
          {capacity !== null ? (
            <Tag style={metricsTagStyle} color={timeSpent > capacity ? 'red' : 'gold'}>
              {t('sprints.capacityMinutes', { defaultValue: 'Capacità' })}: {capacity}
            </Tag>
          ) : null}
        </Flex>
        <div>
          <Typography.Text type="secondary" style={{ marginRight: 8 }}>
            {t('sprints.utilization', { defaultValue: 'Utilizzo' })}
          </Typography.Text>
          <Progress
            percent={Number.isFinite(utilization) ? Math.min(utilization, 150) : 0}
            status={utilization > 100 ? 'exception' : 'active'}
            format={(percent) => `${Math.round(percent ?? 0)}%`}
          />
        </div>
        <Flex wrap gap={8}>
          {Object.entries(sprint.metrics.statusBreakdown).map(([statusKey, count]) => (
            <Tag key={statusKey} color="processing">
              {statusKey}: {count}
            </Tag>
          ))}
        </Flex>
      </Flex>
    )
  }

  const renderSprintCard = (sprint: SprintDTO) => (
    <Col xs={24} sm={12} lg={8} key={sprint.id}>
      <Card
        title={
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <Typography.Text strong>{sprint.name}</Typography.Text>
            <Space size={8} wrap>
              <Tag color="geekblue">
                {t(`sprints.status.${sprint.status}`, { defaultValue: sprint.status })}
              </Tag>
              <Space size={4}>
                <CalendarOutlined />
                <Typography.Text type="secondary">
                  {dayjs(sprint.startDate).format('DD MMM')} ?{' '}
                  {dayjs(sprint.endDate).format('DD MMM')}
                </Typography.Text>
              </Space>
            </Space>
          </Space>
        }
        actions={[
          <Button
            key="details"
            type="link"
            icon={<FileSearchOutlined />}
            onClick={() => handleOpenDetails(sprint.id)}
          >
            {t('sprints.actions.viewTasks', { defaultValue: 'Vedi task' })}
          </Button>,
          canManage ? (
            <Button
              key="edit"
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(sprint)}
            >
              {t('common.edit', { defaultValue: 'Modifica' })}
            </Button>
          ) : null,
          canManage ? (
            <Button
              key="delete"
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(sprint)}
            >
              {t('common.delete', { defaultValue: 'Elimina' })}
            </Button>
          ) : null
        ].filter(Boolean)}
      >
        {renderMetrics(sprint)}
        {sprint.goal ? (
          <Typography.Paragraph style={{ marginTop: 16 }}>{sprint.goal}</Typography.Paragraph>
        ) : null}
      </Card>
    </Col>
  )

  const detailTasks = detailsState?.data?.tasks ?? placeholderTasks

  return (
    <Flex vertical gap={24} style={{ width: '100%' }}>
      {messageContext}
      <Flex justify="space-between" align="center" wrap>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('sprints.title', { defaultValue: 'Sprint del progetto' })}
        </Typography.Title>
        {canManage ? (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
            {t('sprints.actions.create', { defaultValue: 'Nuovo sprint' })}
          </Button>
        ) : null}
      </Flex>
      {sprintState?.status === 'loading' ? (
        <Flex align="center" justify="center" style={{ width: '100%', padding: 48 }}>
          <Spin size="large" />
        </Flex>
      ) : null}
      {sprints.length === 0 && sprintState?.status !== 'loading' ? (
        <Empty
          description={t('sprints.empty', {
            defaultValue: 'Non ci sono sprint per questo progetto.'
          })}
        />
      ) : null}
      {sprints.length > 0 ? (
        <Row gutter={[24, 24]}>{sprints.map((sprint) => renderSprintCard(sprint))}</Row>
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
        destroyOnClose
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
                {
                  value: 'planned',
                  label: t('sprints.status.planned', { defaultValue: 'Pianificato' })
                },
                {
                  value: 'active',
                  label: t('sprints.status.active', { defaultValue: 'In corso' })
                },
                {
                  value: 'completed',
                  label: t('sprints.status.completed', { defaultValue: 'Completato' })
                },
                {
                  value: 'archived',
                  label: t('sprints.status.archived', { defaultValue: 'Archiviato' })
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

      <Drawer
        open={isDetailVisible}
        width={480}
        onClose={() => {
          setDetailVisible(false)
          setDetailsSprintId(null)
        }}
        title={
          detailsState?.data?.name ??
          t('sprints.details.title', { defaultValue: 'Dettagli sprint' })
        }
      >
        {detailsState?.status === 'loading' ? (
          <Flex align="center" justify="center" style={{ width: '100%', padding: 24 }}>
            <Spin />
          </Flex>
        ) : null}
        {detailsState?.data ? (
          <Flex vertical gap={16}>
            <Flex align="center" gap={8} wrap>
              <Tag color="geekblue">
                {t(`sprints.status.${detailsState.data.status}`, {
                  defaultValue: detailsState.data.status
                })}
              </Tag>
              <Space size={4}>
                <CalendarOutlined />
                <Typography.Text>
                  {dayjs(detailsState.data.startDate).format('DD MMM YYYY')} ?{' '}
                  {dayjs(detailsState.data.endDate).format('DD MMM YYYY')}
                </Typography.Text>
              </Space>
              <Space size={4}>
                <ClockCircleOutlined />
                <Typography.Text>
                  {t('sprints.spentMinutes', { defaultValue: 'Registrati' })}:{' '}
                  {detailsState.data.metrics.timeSpentMinutes}
                </Typography.Text>
              </Space>
            </Flex>
            {detailsState.data.goal ? (
              <Typography.Paragraph>{detailsState.data.goal}</Typography.Paragraph>
            ) : null}
            <Typography.Title level={5}>
              {t('sprints.details.tasks', { defaultValue: 'Task' })}
            </Typography.Title>
            {detailTasks.length === 0 ? (
              <Empty
                description={t('sprints.details.emptyTasks', {
                  defaultValue: 'Nessun task nello sprint'
                })}
              />
            ) : (
              <Flex vertical gap={12}>
                {detailTasks.map((task) => (
                  <Card key={task.id} size="small" bordered>
                    <Space direction="vertical" size={2} style={{ width: '100%' }}>
                      <Typography.Text strong>{task.key}</Typography.Text>
                      <Typography.Text>{task.title}</Typography.Text>
                      <Space size={4} wrap>
                        <Tag>{task.status}</Tag>
                        {task.assignee ? <Tag color="blue">{task.assignee.displayName}</Tag> : null}
                      </Space>
                    </Space>
                  </Card>
                ))}
              </Flex>
            )}
          </Flex>
        ) : null}
      </Drawer>
    </Flex>
  )
}

export default ProjectSprintBoard
