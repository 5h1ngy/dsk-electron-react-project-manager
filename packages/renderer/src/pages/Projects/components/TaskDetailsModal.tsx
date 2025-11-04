import { useCallback, useEffect, useMemo, useState, type JSX } from 'react'
import {
  Button,
  DatePicker,
  Divider,
  Form,
  Input,
  List,
  Modal,
  Popconfirm,
  Select,
  Skeleton,
  Space,
  Tag,
  Typography,
  message,
  theme
} from 'antd'
import {
  CalendarOutlined,
  EditOutlined,
  UserOutlined,
  DeleteOutlined,
  MessageOutlined,
  FileMarkdownOutlined,
  LockOutlined,
  CheckOutlined
} from '@ant-design/icons'
import { Controller, useForm, type Resolver } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'

import type { TaskDetails } from '@renderer/store/slices/tasks'
import { buildTags, formatDate } from '@renderer/pages/TaskDetails/TaskDetails.helpers'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import {
  addComment,
  fetchComments,
  selectTaskComments,
  selectTaskMutationStatus,
  updateTask
} from '@renderer/store/slices/tasks'
import type { CommentDTO } from '@main/services/task/types'
import { taskFormSchema, type TaskFormValues } from '@renderer/pages/Projects/schemas/taskSchemas'
import MarkdownEditor from '@renderer/components/Markdown/MarkdownEditor'
import MarkdownViewer from '@renderer/components/Markdown/MarkdownViewer'
import { useSemanticBadges, buildBadgeStyle } from '@renderer/theme/hooks/useSemanticBadges'

export interface TaskDetailsModalProps {
  open: boolean
  task: TaskDetails | null
  loading?: boolean
  allowManage?: boolean
  onClose: () => void
  onDelete: (task: TaskDetails) => Promise<void> | void
  deleting?: boolean
  assigneeOptions?: Array<{ label: string; value: string }>
  statusOptions?: Array<{ label: string; value: string }>
  ownerOptions?: Array<{ label: string; value: string }>
}

const PRIORITY_ORDER: TaskDetails['priority'][] = ['low', 'medium', 'high', 'critical']

const buildEditValues = (
  task: TaskDetails | null,
  fallbackStatus: string,
  fallbackOwnerId: string
): TaskFormValues => ({
  title: task?.title ?? '',
  description: task?.description ?? null,
  status: task?.status ?? fallbackStatus,
  priority: task?.priority ?? 'medium',
  dueDate: task?.dueDate ?? null,
  assigneeId: task?.assignee?.id ?? null,
  ownerId: task?.owner?.id ?? fallbackOwnerId
})

export const TaskDetailsModal = ({
  open,
  task,
  loading = false,
  allowManage = false,
  onClose,
  onDelete,
  deleting = false,
  assigneeOptions = [],
  statusOptions = [],
  ownerOptions = []
}: TaskDetailsModalProps): JSX.Element => {
  const { t, i18n } = useTranslation('projects')
  const { token } = theme.useToken()
  const statusLabelMap = useMemo(() => {
    const labels: Record<string, string> = {}
    statusOptions.forEach((option) => {
      labels[option.value] = option.label
    })
    return labels
  }, [statusOptions])
  const defaultStatusKey = useMemo(() => statusOptions[0]?.value ?? 'todo', [statusOptions])
  const dispatch = useAppDispatch()
  const badgeTokens = useSemanticBadges()
  const navigate = useNavigate()
  const [commentForm] = Form.useForm<{ body: string }>()
  const [submitting, setSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const mutationStatus = useAppSelector(selectTaskMutationStatus)
  const updating = isEditing && mutationStatus === 'loading'

  const resolvedOwnerOptions = useMemo(
    () => (ownerOptions.length ? ownerOptions : assigneeOptions),
    [assigneeOptions, ownerOptions]
  )

  const defaultOwnerId = useMemo(
    () => task?.owner?.id ?? resolvedOwnerOptions[0]?.value ?? '',
    [resolvedOwnerOptions, task?.owner?.id]
  )

  const defaultEditValues = useMemo(
    () => buildEditValues(task, defaultStatusKey, defaultOwnerId),
    [defaultOwnerId, defaultStatusKey, task]
  )

  const editForm = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema) as unknown as Resolver<TaskFormValues>,
    mode: 'onSubmit',
    defaultValues: defaultEditValues
  })

  const commentsState = useAppSelector((state) =>
    task ? selectTaskComments(task.id)(state) : null
  )

  const comments = useMemo<CommentDTO[]>(() => commentsState?.items ?? [], [commentsState?.items])
  const commentsLoading = loading || commentsState?.status === 'loading'
  const commentsError = commentsState?.error

  useEffect(() => {
    if (!open || !task) {
      return
    }
    const status = commentsState?.status ?? 'idle'
    if (status === 'idle') {
      void dispatch(fetchComments(task.id))
    }
  }, [open, task, commentsState?.status, dispatch])

  useEffect(() => {
    if (!open) {
      commentForm.resetFields()
      setSubmitting(false)
      setIsEditing(false)
      editForm.reset(buildEditValues(null, defaultStatusKey, defaultOwnerId))
    }
  }, [open, commentForm, editForm, defaultOwnerId, defaultStatusKey])

  useEffect(() => {
    if (!task || !open || isEditing) {
      return
    }
    editForm.reset(defaultEditValues)
  }, [task, open, isEditing, editForm, defaultEditValues])

  const handleSubmit = async (values: { body: string }) => {
    if (!task) {
      return
    }
    const trimmed = values.body.trim()
    if (!trimmed) {
      return
    }
    setSubmitting(true)
    try {
      await dispatch(
        addComment({
          taskId: task.id,
          body: trimmed
        })
      ).unwrap()
      commentForm.resetFields()
      setSubmitting(false)
    } catch {
      setSubmitting(false)
    }
  }

  const sortedComments = useMemo(
    () =>
      comments
        .slice()
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [comments]
  )

  const {
    control: editControl,
    handleSubmit: submitEditForm,
    formState: { errors: editErrors }
  } = editForm

  const handleStartEdit = () => {
    if (!task) {
      return
    }
    editForm.reset(defaultEditValues)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    editForm.reset(defaultEditValues)
    setIsEditing(false)
  }

  const handleUpdate = submitEditForm(async (values) => {
    if (!task) {
      return
    }
    try {
      await dispatch(
        updateTask({
          taskId: task.id,
          input: {
            title: values.title,
            description: values.description ?? null,
            status: values.status,
            priority: values.priority,
            dueDate: values.dueDate ?? null,
            assigneeId: values.assigneeId ?? null,
            ownerId: values.ownerId
          }
        })
      ).unwrap()
      message.success(t('tasks.messages.updateSuccess'))
      setIsEditing(false)
    } catch (error) {
      const messageText =
        typeof error === 'string'
          ? error
          : error instanceof Error
            ? error.message
            : t('errors.generic', { defaultValue: 'Operazione non riuscita' })
      message.error(messageText)
    }
  })

  const commentSection = (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      <Space
        align="center"
        style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}
      >
        <Typography.Title level={5} style={{ margin: 0 }}>
          {t('tasks.details.comments.title')}
        </Typography.Title>
        {commentsLoading ? (
          <Skeleton.Input style={{ width: 120 }} active size="small" />
        ) : (
          <Tag
            icon={<MessageOutlined />}
            bordered={false}
            style={buildBadgeStyle(badgeTokens.comment)}
          >
            {task?.commentCount ?? comments.length ?? 0}
          </Tag>
        )}
      </Space>
      {commentsError ? (
        <Typography.Text type="danger">{commentsError}</Typography.Text>
      ) : (
        <List
          dataSource={sortedComments}
          loading={commentsLoading}
          locale={{ emptyText: t('tasks.details.comments.empty') }}
          renderItem={(comment) => (
            <List.Item>
              <List.Item.Meta
                title={comment.author.displayName}
                description={
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <Typography.Paragraph style={{ marginBottom: 0 }}>
                      {comment.body}
                    </Typography.Paragraph>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {formatDate(comment.createdAt, i18n.language)}
                    </Typography.Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
      {allowManage ? (
        <Form
          form={commentForm}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ body: '' }}
        >
          <Form.Item
            name="body"
            label={t('tasks.details.comments.addLabel')}
            rules={[
              {
                required: true,
                message: t('tasks.details.comments.validation')
              }
            ]}
          >
            <Input.TextArea rows={3} allowClear maxLength={5000} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={submitting} disabled={submitting}>
              {t('tasks.details.comments.submit')}
            </Button>
          </Form.Item>
        </Form>
      ) : null}
    </Space>
  )

  const translateTag = useCallback(
    (key: string) => {
      if (key.startsWith('details.status.')) {
        const statusKey = key.replace('details.status.', '')
        return statusLabelMap[statusKey] ?? t(key)
      }
      return t(key)
    },
    [statusLabelMap, t]
  )

  const decoratedTags = useMemo(() => {
    return buildTags(task, translateTag).map((tag) => {
      if (tag.variant === 'status') {
        return {
          label: tag.label,
          badge: badgeTokens.status[tag.key as TaskDetails['status']] ?? badgeTokens.statusFallback
        }
      }
      return {
        label: tag.label,
        badge: badgeTokens.priority[tag.key as TaskDetails['priority']]
      }
    })
  }, [badgeTokens, translateTag, task])

  const openLinkedNote = (noteId: string) => {
    if (!task) {
      return
    }
    onClose()
    navigate(`/projects/${task.projectId}/notes?note=${noteId}`)
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="80vw"
      destroyOnHidden
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      {loading ? (
        <Skeleton active title paragraph={{ rows: 5 }} />
      ) : task ? (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space
            align="start"
            style={{ justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: 12 }}
          >
            <Space direction="vertical" size={4}>
              <Typography.Text type="secondary">{task.key}</Typography.Text>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {task.title}
              </Typography.Title>
            </Space>
            {allowManage ? (
              <Space>
                {isEditing ? (
                  <>
                    <Button onClick={handleCancelEdit} disabled={updating}>
                      {t('tasks.actions.cancel')}
                    </Button>
                    <Button
                      type="primary"
                      onClick={handleUpdate}
                      loading={updating}
                      icon={<CheckOutlined />}
                    >
                      {t('tasks.form.updateAction')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button icon={<EditOutlined />} onClick={handleStartEdit} type="default">
                      {t('tasks.actions.edit')}
                    </Button>
                    <Popconfirm
                      title={t('tasks.actions.deleteTitle')}
                      description={t('tasks.actions.deleteDescription', { title: task.title })}
                      okText={t('tasks.actions.deleteConfirm')}
                      cancelText={t('tasks.actions.cancel')}
                      onConfirm={() => onDelete(task)}
                      okButtonProps={{ loading: deleting }}
                      disabled={deleting || updating}
                    >
                      <Button
                        icon={<DeleteOutlined />}
                        danger
                        loading={deleting}
                        disabled={deleting || updating}
                      >
                        {t('tasks.actions.delete')}
                      </Button>
                    </Popconfirm>
                  </>
                )}
              </Space>
            ) : null}
          </Space>

          <Space size={8} wrap>
            {decoratedTags.map((tag) => (
              <Tag key={tag.label} bordered={false} style={buildBadgeStyle(tag.badge)}>
                {tag.label}
              </Tag>
            ))}
          </Space>

          {isEditing ? (
            <Form layout="vertical" onFinish={handleUpdate} disabled={updating}>
              <Form.Item
                label={t('tasks.form.fields.title')}
                required
                validateStatus={editErrors.title ? 'error' : ''}
                help={editErrors.title?.message}
              >
                <Controller
                  control={editControl}
                  name="title"
                  render={({ field }) => (
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      placeholder={t('tasks.form.placeholders.title')}
                    />
                  )}
                />
              </Form.Item>

              <Form.Item
                label={t('tasks.form.fields.description')}
                validateStatus={editErrors.description ? 'error' : ''}
                help={editErrors.description?.message?.toString()}
              >
                <Controller
                  control={editControl}
                  name="description"
                  render={({ field }) => (
                    <MarkdownEditor
                      value={field.value ?? ''}
                      onChange={(next) => field.onChange(next)}
                      placeholder={t('tasks.form.placeholders.description')}
                      maxLength={20000}
                      disabled={updating}
                    />
                  )}
                />
              </Form.Item>

              <Space size="large" style={{ width: '100%' }} wrap>
                <Form.Item
                  label={t('tasks.form.fields.status')}
                  style={{ flex: 1, minWidth: 160 }}
                  required
                  validateStatus={editErrors.status ? 'error' : ''}
                  help={editErrors.status?.message}
                >
                  <Controller
                    control={editControl}
                    name="status"
                    render={({ field }) => (
                      <Select
                        {...field}
                        value={field.value}
                        options={statusOptions}
                        showSearch
                        optionFilterProp="label"
                        disabled={statusOptions.length === 0 || updating}
                      />
                    )}
                  />
                </Form.Item>

                <Form.Item
                  label={t('tasks.form.fields.priority')}
                  style={{ flex: 1, minWidth: 160 }}
                  required
                  validateStatus={editErrors.priority ? 'error' : ''}
                  help={editErrors.priority?.message}
                >
                  <Controller
                    control={editControl}
                    name="priority"
                    render={({ field }) => (
                      <Select
                        {...field}
                        value={field.value}
                        options={PRIORITY_ORDER.map((priority) => ({
                          value: priority,
                          label: t(`details.priority.${priority}`)
                        }))}
                        disabled={updating}
                      />
                    )}
                  />
                </Form.Item>
              </Space>

              <Space size="large" style={{ width: '100%' }} wrap>
                <Form.Item
                  label={t('tasks.form.fields.dueDate')}
                  style={{ flex: 1, minWidth: 180 }}
                  validateStatus={editErrors.dueDate ? 'error' : ''}
                  help={editErrors.dueDate?.toString()}
                >
                  <Controller
                    control={editControl}
                    name="dueDate"
                    render={({ field }) => (
                      <DatePicker
                        value={field.value ? dayjs(field.value) : null}
                        format="YYYY-MM-DD"
                        onChange={(value) =>
                          field.onChange(value ? value.format('YYYY-MM-DD') : null)
                        }
                        style={{ width: '100%' }}
                        placeholder={t('tasks.form.placeholders.dueDate')}
                        disabled={updating}
                      />
                    )}
                  />
                </Form.Item>

                <Form.Item
                  label={t('tasks.form.fields.assignee')}
                  style={{ flex: 1, minWidth: 200 }}
                  validateStatus={editErrors.assigneeId ? 'error' : ''}
                  help={editErrors.assigneeId?.toString()}
                >
                  <Controller
                    control={editControl}
                    name="assigneeId"
                    render={({ field }) => (
                      <Select
                        value={field.value ?? undefined}
                        allowClear
                        placeholder={t('tasks.form.placeholders.assignee')}
                        options={assigneeOptions}
                        onChange={(value) => field.onChange(value ?? null)}
                        showSearch
                        optionFilterProp="label"
                        disabled={updating}
                      />
                    )}
                  />
                </Form.Item>
                <Form.Item
                  label={t('tasks.form.fields.owner')}
                  style={{ flex: 1, minWidth: 200 }}
                  required
                  validateStatus={editErrors.ownerId ? 'error' : ''}
                  help={editErrors.ownerId?.toString()}
                >
                  <Controller
                    control={editControl}
                    name="ownerId"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        placeholder={t('tasks.form.placeholders.owner')}
                        options={resolvedOwnerOptions}
                        onChange={(value) => field.onChange(value)}
                        showSearch
                        optionFilterProp="label"
                        disabled={updating || resolvedOwnerOptions.length === 0}
                      />
                    )}
                  />
                </Form.Item>
              </Space>
            </Form>
          ) : (
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Typography.Text type="secondary">{t('tasks.details.description')}</Typography.Text>
              <MarkdownViewer
                value={task.description}
                emptyFallback={
                  <Typography.Text type="secondary">
                    {t('tasks.details.noDescription')}
                  </Typography.Text>
                }
              />
            </Space>
          )}

          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Typography.Text type="secondary">{t('tasks.details.linkedNotes')}</Typography.Text>
            {task.linkedNotes.length ? (
              <Space direction="vertical" size={4}>
                {task.linkedNotes.map((note) => (
                  <Space key={note.id} size={8}>
                    <Button
                      type="link"
                      icon={<FileMarkdownOutlined />}
                      onClick={() => openLinkedNote(note.id)}
                    >
                      {note.title}
                    </Button>
                    {note.isPrivate ? (
                      <Tag
                        bordered={false}
                        icon={<LockOutlined />}
                        style={buildBadgeStyle(badgeTokens.noteVisibility.private)}
                      >
                        {t('notes.labels.private')}
                      </Tag>
                    ) : null}
                  </Space>
                ))}
              </Space>
            ) : (
              <Typography.Text type="secondary">{t('tasks.details.noLinkedNotes')}</Typography.Text>
            )}
          </Space>

          <Space size={24} wrap>
            <Space size={6} align="center">
              <UserOutlined style={{ color: token.colorPrimary }} aria-hidden />
              <Typography.Text type="secondary">
                {t('tasks.details.owner', {
                  owner: task.owner?.displayName ?? 'N/A'
                })}
              </Typography.Text>
            </Space>
            <Space size={6} align="center">
              <UserOutlined style={{ color: token.colorSuccess }} aria-hidden />
              <Typography.Text type="secondary">
                {t('tasks.details.assignee', {
                  assignee: task.assignee?.displayName ?? t('details.noAssignee')
                })}
              </Typography.Text>
            </Space>
          </Space>

          <Space size={24} wrap>
            <Space size={6} align="center">
              <CalendarOutlined style={{ color: token.colorInfo }} aria-hidden />
              <Typography.Text type="secondary">
                {t('tasks.details.createdAt', {
                  date: formatDate(task.createdAt, i18n.language)
                })}
              </Typography.Text>
            </Space>
            <Space size={6} align="center">
              <CalendarOutlined style={{ color: token.colorWarning }} aria-hidden />
              <Typography.Text type="secondary">
                {task.dueDate
                  ? t('tasks.details.dueDate', {
                      date: formatDate(task.dueDate, i18n.language, t('details.noDueDate'))
                    })
                  : t('details.noDueDate')}
              </Typography.Text>
            </Space>
          </Space>

          <Divider style={{ margin: '8px 0 0' }} />

          {commentSection}
        </Space>
      ) : (
        <EmptyState />
      )}
    </Modal>
  )
}

const EmptyState = (): JSX.Element => {
  const { t } = useTranslation('projects')
  return (
    <Space direction="vertical" size="small" style={{ width: '100%', alignItems: 'center' }}>
      <Typography.Text type="secondary">{t('tasks.details.empty')}</Typography.Text>
    </Space>
  )
}

TaskDetailsModal.displayName = 'TaskDetailsModal'

export default TaskDetailsModal
