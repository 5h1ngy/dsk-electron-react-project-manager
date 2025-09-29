import { useState, useMemo, useCallback, type JSX } from 'react'
import {
  Button,
  Form,
  Input,
  List,
  Modal,
  Popconfirm,
  Select,
  Space,
  Typography,
  message
} from 'antd'
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import {
  createTaskStatus,
  updateTaskStatus,
  reorderTaskStatuses,
  deleteTaskStatus,
  selectTaskStatusesMutationStatus
} from '@renderer/store/slices/taskStatuses'
import type { TaskStatusItem } from '@renderer/store/slices/taskStatuses'

export interface TaskStatusManagerProps {
  projectId: string
  statuses: TaskStatusItem[]
  disabled?: boolean
  onRefreshTasks?: () => void
}

interface StatusFormValues {
  label: string
}

const normalizeLabel = (label: string): string => label.trim()

const TaskStatusManager = ({
  projectId,
  statuses,
  disabled = false,
  onRefreshTasks
}: TaskStatusManagerProps): JSX.Element => {
  const { t } = useTranslation('projects')
  const dispatch = useAppDispatch()
  const mutationStatus = useAppSelector(selectTaskStatusesMutationStatus)
  const [isManagerOpen, setManagerOpen] = useState(false)
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [isEditOpen, setEditOpen] = useState(false)
  const [editingStatus, setEditingStatus] = useState<TaskStatusItem | null>(null)
  const [isDeleteOpen, setDeleteOpen] = useState(false)
  const [deletingStatus, setDeletingStatus] = useState<TaskStatusItem | null>(null)
  const [form] = Form.useForm<StatusFormValues>()
  const [deleteForm] = Form.useForm<{ fallbackId: string }>()

  const isBusy = mutationStatus === 'loading'

  const orderedStatuses = useMemo(
    () => [...statuses].sort((a, b) => a.position - b.position),
    [statuses]
  )

  const fallbackOptions = useMemo(
    () =>
      orderedStatuses
        .filter((status) => !deletingStatus || status.id !== deletingStatus.id)
        .map((status) => ({ label: status.label, value: status.id })),
    [deletingStatus, orderedStatuses]
  )

  const handleOpenManager = () => {
    setManagerOpen(true)
  }

  const handleCloseManager = () => {
    setManagerOpen(false)
    setCreateOpen(false)
    setEditOpen(false)
    setDeleteOpen(false)
    setEditingStatus(null)
    setDeletingStatus(null)
    form.resetFields()
    deleteForm.resetFields()
  }

  const handleCreate = useCallback(async () => {
    try {
      const values = await form.validateFields()
      const label = normalizeLabel(values.label)
      if (!label) {
        return
      }
      await dispatch(createTaskStatus({ projectId, label })).unwrap()
      message.success(t('tasks.statusManager.messages.created'))
      setCreateOpen(false)
      form.resetFields()
      setManagerOpen(true)
    } catch (error) {
      if (error instanceof Error && error.message.includes('validateFields')) {
        return
      }
      message.error(
        error instanceof Error ? error.message : t('tasks.statusManager.messages.error')
      )
    }
  }, [dispatch, form, projectId, t])

  const handleEdit = useCallback(async () => {
    if (!editingStatus) {
      return
    }
    try {
      const values = await form.validateFields()
      const label = normalizeLabel(values.label)
      if (!label) {
        return
      }
      await dispatch(updateTaskStatus({ statusId: editingStatus.id, payload: { label } })).unwrap()
      message.success(t('tasks.statusManager.messages.updated'))
      setEditOpen(false)
      setEditingStatus(null)
      form.resetFields()
      setManagerOpen(true)
    } catch (error) {
      if (error instanceof Error && error.message.includes('validateFields')) {
        return
      }
      message.error(
        error instanceof Error ? error.message : t('tasks.statusManager.messages.error')
      )
    }
  }, [dispatch, editingStatus, form, t])

  const moveStatus = async (statusId: string, direction: -1 | 1) => {
    const currentIndex = orderedStatuses.findIndex((status) => status.id === statusId)
    if (currentIndex === -1) {
      return
    }
    const targetIndex = currentIndex + direction
    if (targetIndex < 0 || targetIndex >= orderedStatuses.length) {
      return
    }
    const nextOrder = [...orderedStatuses]
    const [moved] = nextOrder.splice(currentIndex, 1)
    nextOrder.splice(targetIndex, 0, moved)
    await dispatch(
      reorderTaskStatuses({
        projectId,
        order: nextOrder.map((status) => status.id)
      })
    ).unwrap()
    message.success(t('tasks.statusManager.messages.reordered'))
  }

  const handleDelete = useCallback(async () => {
    if (!deletingStatus) {
      return
    }
    try {
      const { fallbackId } = await deleteForm.validateFields()
      await dispatch(
        deleteTaskStatus({
          projectId,
          statusId: deletingStatus.id,
          fallbackStatusId: fallbackId
        })
      ).unwrap()
      message.success(t('tasks.statusManager.messages.deleted'))
      setDeleteOpen(false)
      setDeletingStatus(null)
      deleteForm.resetFields()
      setManagerOpen(true)
      onRefreshTasks?.()
    } catch (error) {
      if (error instanceof Error && error.message.includes('validateFields')) {
        return
      }
      message.error(
        error instanceof Error ? error.message : t('tasks.statusManager.messages.error')
      )
    }
  }, [deleteForm, deletingStatus, dispatch, onRefreshTasks, projectId, t])

  const openCreateModal = () => {
    form.resetFields()
    setCreateOpen(true)
  }

  const openEditModal = (status: TaskStatusItem) => {
    setEditingStatus(status)
    form.setFieldsValue({ label: status.label })
    setEditOpen(true)
  }

  const openDeleteModal = (status: TaskStatusItem) => {
    setDeletingStatus(status)
    deleteForm.resetFields()
    setDeleteOpen(true)
  }

  return (
    <>
      <Button icon={<SettingOutlined />} onClick={handleOpenManager} disabled={disabled}>
        {t('tasks.statusManager.manageButton')}
      </Button>
      <Modal
        open={isManagerOpen}
        title={t('tasks.statusManager.title')}
        onCancel={handleCloseManager}
        footer={null}
        width={520}
        destroyOnHidden
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Button type="dashed" icon={<PlusOutlined />} onClick={openCreateModal} disabled={isBusy}>
            {t('tasks.statusManager.add')}
          </Button>
          <List
            dataSource={orderedStatuses}
            locale={{ emptyText: t('tasks.statusManager.empty') }}
            renderItem={(status, index) => (
              <List.Item
                actions={[
                  <Button
                    key="move-up"
                    type="text"
                    icon={<ArrowUpOutlined />}
                    disabled={isBusy || index === 0}
                    onClick={async () => await moveStatus(status.id, -1)}
                  />,
                  <Button
                    key="move-down"
                    type="text"
                    icon={<ArrowDownOutlined />}
                    disabled={isBusy || index === orderedStatuses.length - 1}
                    onClick={async () => await moveStatus(status.id, 1)}
                  />,
                  <Button
                    key="edit"
                    type="text"
                    icon={<EditOutlined />}
                    disabled={isBusy}
                    onClick={() => openEditModal(status)}
                  />,
                  <Popconfirm
                    key="delete"
                    title={t('tasks.statusManager.deleteTitle')}
                    description={t('tasks.statusManager.deleteDescription', {
                      status: status.label
                    })}
                    okText={t('tasks.statusManager.confirm')}
                    cancelText={t('tasks.statusManager.cancel')}
                    disabled={isBusy || orderedStatuses.length <= 1}
                    onConfirm={() => openDeleteModal(status)}
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      disabled={isBusy || orderedStatuses.length <= 1}
                    />
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  title={status.label}
                  description={<Typography.Text type="secondary">{status.key}</Typography.Text>}
                />
              </List.Item>
            )}
          />
        </Space>
      </Modal>
      <Modal
        open={isCreateOpen}
        title={t('tasks.statusManager.createTitle')}
        onCancel={() => {
          setCreateOpen(false)
          form.resetFields()
        }}
        onOk={handleCreate}
        confirmLoading={isBusy}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={t('tasks.statusManager.fields.label')}
            name="label"
            rules={[
              {
                required: true,
                message: t('tasks.statusManager.validation.labelRequired')
              },
              {
                max: 80,
                message: t('tasks.statusManager.validation.labelMax')
              }
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        open={isEditOpen}
        title={t('tasks.statusManager.editTitle')}
        onCancel={() => {
          setEditOpen(false)
          setEditingStatus(null)
          form.resetFields()
        }}
        onOk={handleEdit}
        confirmLoading={isBusy}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={t('tasks.statusManager.fields.label')}
            name="label"
            rules={[
              {
                required: true,
                message: t('tasks.statusManager.validation.labelRequired')
              },
              {
                max: 80,
                message: t('tasks.statusManager.validation.labelMax')
              }
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        open={isDeleteOpen}
        title={t('tasks.statusManager.deleteTitle')}
        onCancel={() => {
          setDeleteOpen(false)
          setDeletingStatus(null)
          deleteForm.resetFields()
        }}
        onOk={handleDelete}
        confirmLoading={isBusy}
        destroyOnHidden
      >
        <Typography.Paragraph>
          {t('tasks.statusManager.deletePrompt', {
            status: deletingStatus?.label ?? ''
          })}
        </Typography.Paragraph>
        <Form form={deleteForm} layout="vertical">
          <Form.Item
            label={t('tasks.statusManager.fields.fallback')}
            name="fallbackId"
            rules={[
              {
                required: true,
                message: t('tasks.statusManager.validation.fallbackRequired')
              }
            ]}
          >
            <Select options={fallbackOptions} disabled={fallbackOptions.length === 0} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

TaskStatusManager.displayName = 'TaskStatusManager'

export { TaskStatusManager }
export default TaskStatusManager
