import {
  ArrowLeftOutlined,
  CalendarOutlined,
  MessageOutlined,
  ReloadOutlined,
  UserOutlined
} from '@ant-design/icons'
import {
  Alert,
  Breadcrumb,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  List,
  Row,
  Skeleton,
  Space,
  Tag,
  Typography,
  message
} from 'antd'
import type { BreadcrumbProps } from 'antd'
import { useCallback, useEffect, useMemo, useState, type JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import { ShellHeaderPortal } from '@renderer/layout/Shell/ShellHeader.context'
import { usePrimaryBreadcrumb } from '@renderer/layout/Shell/hooks/usePrimaryBreadcrumb'
import { EmptyState } from '@renderer/components/DataStates'
import MarkdownViewer from '@renderer/components/Markdown/MarkdownViewer'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import { addComment, fetchComments } from '@renderer/store/slices/tasks'
import { selectTaskComments } from '@renderer/store/slices/tasks/selectors'
import type { CommentDTO } from '@main/services/task/types'
import type { TaskDetails } from '@renderer/store/slices/tasks/types'
import { buildTags, formatDate } from '@renderer/pages/TaskDetails/TaskDetails.helpers'
import { buildBadgeStyle, useSemanticBadges } from '@renderer/theme/hooks/useSemanticBadges'
import { useProjectDetails } from '@renderer/pages/Projects/hooks/useProjectDetails'

const { TextArea } = Input

const TaskDetailsPage = (): JSX.Element => {
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation('projects')
  const dispatch = useAppDispatch()
  const [commentForm] = Form.useForm<{ body: string }>()
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const badgeTokens = useSemanticBadges()

  if (!projectId || !taskId) {
    return <Navigate to="/projects" replace />
  }

  const {
    project,
    projectLoading,
    tasks,
    tasksStatus,
    taskStatuses,
    taskStatusesStatus,
    refresh,
    refreshTasks,
    messageContext: projectMessageContext
  } = useProjectDetails(projectId)

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

  const tags = useMemo(() => buildTags(task, t), [task, t])

  const commentsSelector = useMemo(
    () => selectTaskComments(taskId),
    [taskId]
  )
  const commentsState = useAppSelector(commentsSelector)
  const comments: CommentDTO[] = useMemo(
    () => commentsState?.items ?? [],
    [commentsState?.items]
  )
  const commentsLoading = commentsState?.status === 'loading'
  const commentsError = commentsState?.error ?? null

  useEffect(() => {
    if (!taskId) {
      return
    }
    const status = commentsState?.status ?? 'idle'
    if (status === 'idle') {
      dispatch(fetchComments(taskId))
    }
  }, [dispatch, taskId, commentsState?.status])

  const isLoading =
    projectLoading || tasksStatus === 'loading' || taskStatusesStatus === 'loading'

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
          title: project.name,
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

  if (isLoading && !task) {
    return (
      <>
        <ShellHeaderPortal>
          <Breadcrumb items={breadcrumbItems} />
        </ShellHeaderPortal>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Space>
      </>
    )
  }

  if (!task) {
    return (
      <>
        <ShellHeaderPortal>
          <Breadcrumb items={breadcrumbItems} />
        </ShellHeaderPortal>
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
      <ShellHeaderPortal>
        <Space align="center" size={12} wrap style={{ width: '100%' }}>
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
          <Breadcrumb items={breadcrumbItems} />
        </Space>
      </ShellHeaderPortal>
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        {projectMessageContext}
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Typography.Title level={3} style={{ marginBottom: 0 }}>
            {task.title}
          </Typography.Title>
          {tagsContent}
        </Space>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Space direction="vertical" size={24} style={{ width: '100%' }}>
              <Card title={t('tasks.details.description')}>
                <MarkdownViewer
                  value={task.description}
                  emptyFallback={
                    <Typography.Text type="secondary">
                      {t('tasks.details.noDescription')}
                    </Typography.Text>
                  }
                />
                <Divider />
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Typography.Text type="secondary">
                    {t('tasks.details.linkedNotes')}
                  </Typography.Text>
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
                  <Alert
                    type="error"
                    showIcon
                    style={{ marginBottom: 16 }}
                    message={commentsError}
                  />
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
                            {comment.author?.displayName ?? comment.author?.username ?? '—'}
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
            </Space>
          </Col>
          <Col xs={24} lg={8}>
            <div style={{ position: 'sticky', top: 24 }}>
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <Card title={t('tasks.details.propertiesTitle')}>
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
                        {t('tasks.details.ownerLabel')}
                      </Typography.Text>
                      <br />
                      <Space size={6} align="center">
                        <UserOutlined aria-hidden />
                        <Typography.Text>
                          {task.owner?.displayName ?? task.owner?.username ?? '—'}
                        </Typography.Text>
                      </Space>
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
                </Card>
              </Space>
            </div>
          </Col>
        </Row>
      </Space>
    </>
  )
}

TaskDetailsPage.displayName = 'TaskDetailsPage'

export { TaskDetailsPage }
export default TaskDetailsPage
