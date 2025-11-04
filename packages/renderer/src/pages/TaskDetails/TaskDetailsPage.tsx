import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EditOutlined,
  MessageOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  UserOutlined
} from '@ant-design/icons'
import {
  Alert,
  Breadcrumb,
  Button,
  Card,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  List,
  Select,
  Skeleton,
  Space,
  Tag,
  Typography,
  message
} from 'antd'
import type { BreadcrumbProps } from 'antd'
import dayjs from 'dayjs'
import { Controller, useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useMemo, useState, type JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { ShellHeaderPortal } from '@renderer/layout/Shell/ShellHeader.context'
import { usePrimaryBreadcrumb } from '@renderer/layout/Shell/hooks/usePrimaryBreadcrumb'
import { useBreadcrumbStyle } from '@renderer/layout/Shell/hooks/useBreadcrumbStyle'
import { EmptyState } from '@renderer/components/DataStates'
import MarkdownViewer from '@renderer/components/Markdown/MarkdownViewer'
import MarkdownEditor from '@renderer/components/Markdown/MarkdownEditor'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import { addComment, fetchComments, updateTask } from '@renderer/store/slices/tasks'
import {
  selectTaskComments,
  selectTaskMutationStatus
} from '@renderer/store/slices/tasks/selectors'
import type { CommentDTO } from '@main/services/task/types'
import type { TaskDetails } from '@renderer/store/slices/tasks/types'
import { buildTags, formatDate } from '@renderer/pages/TaskDetails/TaskDetails.helpers'
import { buildBadgeStyle, useSemanticBadges } from '@renderer/theme/hooks/useSemanticBadges'
import { useProjectDetails } from '@renderer/pages/Projects/hooks/useProjectDetails'
import { taskFormSchema, type TaskFormValues } from '@renderer/pages/Projects/schemas/taskSchemas'
import { selectCurrentUser } from '@renderer/store/slices/auth/selectors'

const { TextArea } = Input

const PRIORITY_ORDER: TaskDetails['priority'][] = ['low', 'medium', 'high', 'critical']

const TaskDetailsContent = ({
  projectId,
  taskId
}: {
  projectId: string
  taskId: string
}): JSX.Element => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation('projects')
  const dispatch = useAppDispatch()
  const [commentForm] = Form.useForm<{ body: string }>()
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const badgeTokens = useSemanticBadges()

  const {
    project,
    projectLoading,
    tasks,
    tasksStatus,
    taskStatuses,
    taskStatusesStatus,
    refresh,
    refreshTasks,
    canManageTasks,
    messageContext: projectMessageContext
  } = useProjectDetails(projectId)
  const currentUser = useAppSelector(selectCurrentUser)
  const [searchParams, setSearchParams] = useSearchParams()

  const task: TaskDetails | null = useMemo(
    () => tasks.find((item) => item.id === taskId) ?? null,
    [taskId, tasks]
  )

  const statusLabelMap = useMemo(() => {
    const map: Record<string, string> = {}
    taskStatuses.forEach((status) => {
      map[status.key] = status.label
    })
    return map
  }, [taskStatuses])

  const statusOptions = useMemo(
    () =>
      taskStatuses.map((status) => ({
        value: status.key,
        label: status.label
      })),
    [taskStatuses]
  )

  const tags = useMemo(() => buildTags(task, t), [task, t])

  const activeMembers = useMemo(
    () => (project?.members ?? []).filter((member) => member.isActive),
    [project?.members]
  )

  const assigneeOptions = useMemo(
    () =>
      activeMembers.map((member) => ({
        value: member.userId,
        label: member.displayName || member.username || member.userId
      })),
    [activeMembers]
  )

  const ownerOptions = useMemo(() => {
    const options = activeMembers.map((member) => ({
      value: member.userId,
      label: member.displayName || member.username || member.userId
    }))
    if (currentUser?.id) {
      const exists = options.some((option) => option.value === currentUser.id)
      if (!exists) {
        options.push({
          value: currentUser.id,
          label: currentUser.displayName || currentUser.username || currentUser.id
        })
      }
    }
    return options
  }, [activeMembers, currentUser?.displayName, currentUser?.id, currentUser?.username])

  const commentsSelector = useMemo(() => selectTaskComments(taskId), [taskId])
  const commentsState = useAppSelector(commentsSelector)
  const comments: CommentDTO[] = useMemo(() => commentsState?.items ?? [], [commentsState?.items])
  const commentsLoading = commentsState?.status === 'loading'
  const commentsError = commentsState?.error ?? null
  const mutationStatus = useAppSelector(selectTaskMutationStatus)
  const updatingTask = mutationStatus === 'loading'
  const [isEditing, setIsEditing] = useState(false)

  const defaultEditValues = useMemo<TaskFormValues>(
    () => ({
      title: task?.title ?? '',
      description: task?.description ?? null,
      status: task?.status ?? taskStatuses[0]?.key ?? 'todo',
      priority: task?.priority ?? 'medium',
      dueDate: task?.dueDate ?? null,
      assigneeId: task?.assignee?.id ?? null,
      ownerId: task?.owner?.id ?? currentUser?.id ?? ownerOptions[0]?.value ?? '',
      sprintId: task?.sprint?.id ?? null,
      estimatedMinutes: task?.estimatedMinutes ?? null
    }),
    [currentUser?.id, ownerOptions, task, taskStatuses]
  )

  const editForm = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema) as unknown as Resolver<TaskFormValues>,
    mode: 'onSubmit',
    defaultValues: defaultEditValues
  })

  const {
    control: editControl,
    formState: editFormState,
    handleSubmit: submitEditForm,
    reset: resetEditForm
  } = editForm

  useEffect(() => {
    if (isEditing) {
      resetEditForm(defaultEditValues)
    }
  }, [defaultEditValues, isEditing, resetEditForm])

  useEffect(() => {
    const mode = searchParams.get('mode')
    if (!mode) {
      return
    }
    const next = new URLSearchParams(searchParams)
    next.delete('mode')
    setSearchParams(next, { replace: true })
    if (mode === 'edit') {
      if (canManageTasks) {
        setIsEditing(true)
      } else {
        message.warning(
          t('permissions.tasksUpdateDenied', {
            defaultValue: 'Non hai i permessi per modificare questo task.'
          })
        )
      }
    }
  }, [canManageTasks, searchParams, setSearchParams, t])

  useEffect(() => {
    if (!taskId) {
      return
    }
    const status = commentsState?.status ?? 'idle'
    if (status === 'idle') {
      dispatch(fetchComments(taskId))
    }
  }, [dispatch, taskId, commentsState?.status])

  const isLoading = projectLoading || tasksStatus === 'loading' || taskStatusesStatus === 'loading'

  const projectReference = useMemo(() => {
    if (project) {
      return t('tasks.details.projectReference', {
        key: project.key,
        name: project.name
      })
    }
    return t('tasks.details.projectUnknown')
  }, [project, t])

  const breadcrumbItems = usePrimaryBreadcrumb(
    useMemo<BreadcrumbProps['items']>(() => {
      const items: BreadcrumbProps['items'] = [
        {
          title: t('breadcrumbs.projects'),
          onClick: () => navigate('/projects')
        }
      ]
      if (project) {
        items.push({
          title: `${project.key} - ${project.name}`,
          onClick: () => navigate(`/projects/${project.id}`)
        })
      }
      items.push({
        title: t('breadcrumbs.tasks'),
        onClick: () => navigate(`/projects/${projectId}/tasks`)
      })
      items.push({
        title: task ? task.title : t('tasks.details.loadingTitle', { defaultValue: 'Task details' })
      })
      return items
    }, [navigate, project, projectId, t, task])
  )
  const breadcrumbStyle = useBreadcrumbStyle(breadcrumbItems)

  const handleBack = useCallback(() => {
    navigate(`/projects/${projectId}/tasks`)
  }, [navigate, projectId])

  const handleRefresh = useCallback(() => {
    refresh()
    refreshTasks()
  }, [refresh, refreshTasks])

  const handleLinkedNoteOpen = useCallback(
    (noteId: string) => {
      navigate(`/projects/${projectId}/notes?note=${noteId}`)
    },
    [navigate, projectId]
  )

  const handleAddNote = useCallback(() => {
    if (!task) {
      return
    }
    navigate(`/projects/${projectId}/notes?createNote=${task.id}`)
  }, [navigate, projectId, task])

  const handleSubmitComment = useCallback(async () => {
    if (!task) {
      return
    }
    try {
      const { body } = await commentForm.validateFields()
      setCommentSubmitting(true)
      await dispatch(
        addComment({
          taskId: task.id,
          body
        })
      ).unwrap()
      commentForm.resetFields()
      message.success(
        t('tasks.details.comments.success', { defaultValue: 'Comment added successfully' })
      )
    } catch (error) {
      if ((error as { errorFields?: unknown[] })?.errorFields) {
        return
      }
      const messageText =
        typeof error === 'string'
          ? error
          : error instanceof Error
            ? error.message
            : t('errors.generic', { defaultValue: 'Operazione non riuscita' })
      message.error(messageText)
    } finally {
      setCommentSubmitting(false)
    }
  }, [commentForm, dispatch, t, task])

  const handleSaveTask = useCallback(
    async (values: TaskFormValues) => {
      if (!task) {
        return
      }
      try {
        await dispatch(
          updateTask({
            taskId: task.id,
            input: {
              title: values.title,
              description: values.description,
              status: values.status,
              priority: values.priority,
              dueDate: values.dueDate,
              assigneeId: values.assigneeId,
              ownerId: values.ownerId,
              sprintId: values.sprintId,
              estimatedMinutes: values.estimatedMinutes
            }
          })
        ).unwrap()
        message.success(t('tasks.messages.updateSuccess'))
        resetEditForm(values)
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
    },
    [dispatch, resetEditForm, t, task]
  )

  const headerContent = (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 12
      }}
    >
      <Space size={12} wrap style={{ flex: '0 0 auto' }}>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          disabled={projectLoading || tasksStatus === 'loading'}
          loading={projectLoading || tasksStatus === 'loading'}
        >
          {t('details.refresh')}
        </Button>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          {t('tasks.details.goBack')}
        </Button>
      </Space>
      <Breadcrumb
        items={breadcrumbItems}
        style={{ flex: '1 1 240px', minWidth: 200, ...breadcrumbStyle }}
      />
      {task && canManageTasks ? (
        <Space size={8} wrap style={{ marginLeft: 'auto' }}>
          {isEditing ? (
            <>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={() => submitEditForm(handleSaveTask)()}
                loading={updatingTask}
                disabled={updatingTask}
              >
                {t('tasks.form.updateAction')}
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false)
                  resetEditForm(defaultEditValues)
                }}
                disabled={updatingTask}
              >
                {t('tasks.actions.cancel')}
              </Button>
            </>
          ) : (
            <Button icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
              {t('tasks.actions.edit')}
            </Button>
          )}
        </Space>
      ) : null}
    </div>
  )

  if (isLoading && !task) {
    return (
      <>
        <ShellHeaderPortal>{headerContent}</ShellHeaderPortal>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Space>
      </>
    )
  }

  if (!task) {
    return (
      <>
        <ShellHeaderPortal>{headerContent}</ShellHeaderPortal>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <EmptyState
            title={t('tasks.details.empty')}
            action={
              <Button type="primary" onClick={handleBack} icon={<ArrowLeftOutlined />}>
                {t('tasks.details.goBack')}
              </Button>
            }
          />
        </Space>
      </>
    )
  }

  const tagsContent = (
    <Space size={8} wrap>
      {tags.map((tag) => {
        const style =
          tag.variant === 'status'
            ? buildBadgeStyle(badgeTokens.status[tag.key] ?? badgeTokens.statusFallback)
            : buildBadgeStyle(badgeTokens.priority[tag.key as TaskDetails['priority']])
        return (
          <Tag key={tag.key} bordered={false} style={style}>
            {tag.label}
          </Tag>
        )
      })}
    </Space>
  )

  const commentsHeader = (
    <Space align="center" size={8}>
      <MessageOutlined />
      <Typography.Text strong>{t('tasks.details.comments.title')}</Typography.Text>
      <Tag bordered={false} style={buildBadgeStyle(badgeTokens.comment)}>
        {t('tasks.details.comments.count', { count: comments.length })}
      </Tag>
    </Space>
  )

  return (
    <>
      <ShellHeaderPortal>{headerContent}</ShellHeaderPortal>
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        {projectMessageContext}
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          {isEditing ? (
            <Form layout="vertical" requiredMark={false}>
              <Form.Item
                label={t('tasks.form.fields.title')}
                required
                validateStatus={editFormState.errors.title ? 'error' : undefined}
                help={editFormState.errors.title?.message}
                style={{ marginBottom: 0 }}
              >
                <Controller
                  control={editControl}
                  name="title"
                  render={({ field }) => <Input {...field} />}
                />
              </Form.Item>
            </Form>
          ) : (
            <Space align="center" size={8} wrap>
              <Typography.Title level={3} style={{ marginBottom: 0 }}>
                {task.title}
              </Typography.Title>
              <Button icon={<PlusOutlined />} onClick={handleAddNote}>
                {t('tasks.details.addNote')}
              </Button>
            </Space>
          )}
          <Typography.Text type="secondary">{projectReference}</Typography.Text>
          {!isEditing ? tagsContent : null}
        </Space>
        <Flex wrap gap={16} align="stretch" style={{ width: '100%' }}>
          <Flex vertical gap={24} style={{ flex: '1 1 640px', minWidth: 280, width: '100%' }}>
            <Card title={t('tasks.details.description')}>
              {isEditing ? (
                <Form layout="vertical" requiredMark={false}>
                  <Form.Item label={t('tasks.form.fields.description')}>
                    <Controller
                      control={editControl}
                      name="description"
                      render={({ field }) => (
                        <MarkdownEditor value={field.value ?? ''} onChange={field.onChange} />
                      )}
                    />
                  </Form.Item>
                </Form>
              ) : (
                <MarkdownViewer
                  value={task.description}
                  emptyFallback={
                    <Typography.Text type="secondary">
                      {t('tasks.details.noDescription')}
                    </Typography.Text>
                  }
                />
              )}
              <Divider />
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Typography.Text type="secondary">{t('tasks.details.linkedNotes')}</Typography.Text>
                {task.linkedNotes.length ? (
                  <Space direction="vertical" size={4}>
                    {task.linkedNotes.map((note) => (
                      <Space key={note.id} size={6} wrap>
                        <Button
                          type="link"
                          size="small"
                          onClick={() => handleLinkedNoteOpen(note.id)}
                        >
                          {note.title}
                        </Button>
                        {note.isPrivate ? (
                          <Tag
                            bordered={false}
                            style={buildBadgeStyle(badgeTokens.noteVisibility.private)}
                          >
                            {t('notes.labels.private')}
                          </Tag>
                        ) : null}
                      </Space>
                    ))}
                  </Space>
                ) : (
                  <Typography.Text type="secondary">
                    {t('tasks.details.noLinkedNotes')}
                  </Typography.Text>
                )}
              </Space>
            </Card>

            <Card title={commentsHeader}>
              {commentsError ? (
                <Alert type="error" showIcon style={{ marginBottom: 16 }} message={commentsError} />
              ) : null}
              <List<CommentDTO>
                dataSource={comments}
                loading={commentsLoading}
                locale={{ emptyText: t('tasks.details.comments.empty') }}
                renderItem={(comment) => (
                  <List.Item key={comment.id}>
                    <Space direction="vertical" size={2} style={{ width: '100%' }}>
                      <Space align="center" size={8}>
                        <UserOutlined aria-hidden />
                        <Typography.Text strong>
                          {comment.author?.displayName ?? comment.author?.username ?? 'â€”'}
                        </Typography.Text>
                        <Typography.Text type="secondary">
                          {formatDate(comment.createdAt, i18n.language)}
                        </Typography.Text>
                      </Space>
                      <Typography.Paragraph style={{ marginBottom: 0 }}>
                        {comment.body}
                      </Typography.Paragraph>
                    </Space>
                  </List.Item>
                )}
              />
              <Divider />
              <Form
                form={commentForm}
                layout="vertical"
                onFinish={() => void handleSubmitComment()}
              >
                <Form.Item
                  label={t('tasks.details.comments.addLabel')}
                  name="body"
                  rules={[
                    {
                      required: true,
                      message: t('tasks.details.comments.validation')
                    }
                  ]}
                >
                  <TextArea rows={4} autoSize={{ minRows: 4, maxRows: 6 }} />
                </Form.Item>
                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={commentSubmitting}
                    disabled={commentSubmitting}
                  >
                    {t('tasks.details.comments.submit')}
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Flex>
          <Flex
            vertical
            gap={16}
            style={{ flex: '1 1 320px', minWidth: 260, maxWidth: 420, width: '100%' }}
          >
            <div style={{ position: 'sticky', top: 24, width: '100%' }}>
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <Card title={t('tasks.details.propertiesTitle')}>
                  <Space direction="vertical" size={16} style={{ width: '100%' }}>
                    {isEditing ? (
                      <Form layout="vertical" requiredMark={false}>
                        <Form.Item
                          label={t('tasks.form.fields.status')}
                          required
                          validateStatus={editFormState.errors.status ? 'error' : undefined}
                          help={editFormState.errors.status?.message}
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
                                disabled={statusOptions.length === 0 || updatingTask}
                              />
                            )}
                          />
                        </Form.Item>
                        <Form.Item
                          label={t('tasks.form.fields.priority')}
                          required
                          validateStatus={editFormState.errors.priority ? 'error' : undefined}
                          help={editFormState.errors.priority?.message}
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
                                disabled={updatingTask}
                              />
                            )}
                          />
                        </Form.Item>
                        <Form.Item
                          label={t('tasks.form.fields.dueDate')}
                          validateStatus={editFormState.errors.dueDate ? 'error' : undefined}
                          help={editFormState.errors.dueDate?.toString()}
                        >
                          <Controller
                            control={editControl}
                            name="dueDate"
                            render={({ field }) => (
                              <DatePicker
                                value={field.value ? dayjs(field.value) : null}
                                format="YYYY-MM-DD"
                                allowClear
                                onChange={(value) =>
                                  field.onChange(value ? value.format('YYYY-MM-DD') : null)
                                }
                                style={{ width: '100%' }}
                                placeholder={t('tasks.form.placeholders.dueDate')}
                                disabled={updatingTask}
                              />
                            )}
                          />
                        </Form.Item>
                        <Form.Item
                          label={t('tasks.form.fields.assignee')}
                          validateStatus={editFormState.errors.assigneeId ? 'error' : undefined}
                          help={editFormState.errors.assigneeId?.toString()}
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
                                disabled={updatingTask}
                              />
                            )}
                          />
                        </Form.Item>
                        <Form.Item
                          label={t('tasks.form.fields.owner')}
                          required
                          validateStatus={editFormState.errors.ownerId ? 'error' : undefined}
                          help={editFormState.errors.ownerId?.toString()}
                        >
                          <Controller
                            control={editControl}
                            name="ownerId"
                            render={({ field }) => (
                              <Select
                                value={field.value}
                                placeholder={t('tasks.form.placeholders.owner')}
                                options={ownerOptions}
                                onChange={(value) => field.onChange(value)}
                                showSearch
                                optionFilterProp="label"
                                disabled={updatingTask || ownerOptions.length === 0}
                              />
                            )}
                          />
                        </Form.Item>
                      </Form>
                    ) : (
                      <Space direction="vertical" size={12} style={{ width: '100%' }}>
                        <div>
                          <Typography.Text type="secondary">
                            {t('tasks.details.statusLabel')}
                          </Typography.Text>
                          <br />
                          <Tag
                            bordered={false}
                            style={buildBadgeStyle(
                              badgeTokens.status[task.status] ?? badgeTokens.statusFallback
                            )}
                          >
                            {statusLabelMap[task.status] ?? task.status}
                          </Tag>
                        </div>
                        <div>
                          <Typography.Text type="secondary">
                            {t('tasks.details.priorityLabel')}
                          </Typography.Text>
                          <br />
                          <Tag
                            bordered={false}
                            style={buildBadgeStyle(badgeTokens.priority[task.priority])}
                          >
                            {t(`details.priority.${task.priority}`)}
                          </Tag>
                        </div>
                        <div>
                          <Typography.Text type="secondary">
                            {t('tasks.details.assigneeLabel')}
                          </Typography.Text>
                          <br />
                          <Space size={6} align="center">
                            <UserOutlined aria-hidden />
                            <Typography.Text>
                              {task.assignee?.displayName ??
                                task.assignee?.username ??
                                t('details.noAssignee')}
                            </Typography.Text>
                          </Space>
                        </div>
                        <div>
                          <Typography.Text type="secondary">
                            {t('tasks.details.dueDateLabel')}
                          </Typography.Text>
                          <br />
                          <Space size={6} align="center">
                            <CalendarOutlined aria-hidden />
                            <Typography.Text>
                              {task.dueDate
                                ? formatDate(task.dueDate, i18n.language, t('details.noDueDate'))
                                : t('details.noDueDate')}
                            </Typography.Text>
                          </Space>
                        </div>
                      </Space>
                    )}
                    <Space direction="vertical" size={12} style={{ width: '100%' }}>
                      <div>
                        <Typography.Text type="secondary">
                          {t('tasks.details.ownerLabel')}
                        </Typography.Text>
                        <br />
                        <Space size={6} align="center">
                          <UserOutlined aria-hidden />
                          <Typography.Text>
                            {task.owner?.displayName ?? task.owner?.username ?? 'â€”'}
                          </Typography.Text>
                        </Space>
                      </div>
                      <div>
                        <Typography.Text type="secondary">
                          {t('tasks.details.createdAtLabel')}
                        </Typography.Text>
                        <br />
                        <Space size={6} align="center">
                          <CalendarOutlined aria-hidden />
                          <Typography.Text>
                            {formatDate(task.createdAt, i18n.language)}
                          </Typography.Text>
                        </Space>
                      </div>
                      <div>
                        <Typography.Text type="secondary">
                          {t('tasks.details.updatedAtLabel')}
                        </Typography.Text>
                        <br />
                        <Space size={6} align="center">
                          <CalendarOutlined aria-hidden />
                          <Typography.Text>
                            {formatDate(task.updatedAt, i18n.language)}
                          </Typography.Text>
                        </Space>
                      </div>
                    </Space>
                  </Space>
                </Card>
              </Space>
            </div>
          </Flex>
        </Flex>
      </Space>
    </>
  )
}

const TaskDetailsPage = (): JSX.Element => {
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>()

  if (!projectId || !taskId) {
    return <Navigate to="/projects" replace />
  }

  return <TaskDetailsContent projectId={projectId} taskId={taskId} />
}

TaskDetailsPage.displayName = 'TaskDetailsPage'

export { TaskDetailsPage }
export default TaskDetailsPage
