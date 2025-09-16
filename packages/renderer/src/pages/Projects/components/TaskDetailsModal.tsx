import { useEffect, useMemo, useState, type JSX } from 'react'
import {
  Button,
  Divider,
  Form,
  Input,
  List,
  Modal,
  Popconfirm,
  Skeleton,
  Space,
  Tag,
  Tooltip,
  Typography
} from 'antd'
import {
  CalendarOutlined,
  EditOutlined,
  UserOutlined,
  DeleteOutlined,
  MessageOutlined,
  FileMarkdownOutlined,
  LockOutlined
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import type { TaskDetails } from '@renderer/store/slices/tasks'
import { buildTags, formatDate } from '@renderer/pages/TaskDetails/TaskDetails.helpers'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import { addComment, fetchComments, selectTaskComments } from '@renderer/store/slices/tasks'
import type { CommentDTO } from '@main/services/task/types'

export interface TaskDetailsModalProps {
  open: boolean
  task: TaskDetails | null
  loading?: boolean
  allowManage?: boolean
  onClose: () => void
  onEdit: (task: TaskDetails) => void
  onDelete: (task: TaskDetails) => Promise<void> | void
  deleting?: boolean
}

export const TaskDetailsModal = ({
  open,
  task,
  loading = false,
  allowManage = false,
  onClose,
  onEdit,
  onDelete,
  deleting = false
}: TaskDetailsModalProps): JSX.Element => {
  const { t, i18n } = useTranslation('projects')
  const dispatch = useAppDispatch()
  const [form] = Form.useForm<{ body: string }>()
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

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
      form.resetFields()
      setSubmitting(false)
    }
  }, [open, form])

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
      form.resetFields()
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
          <Tag icon={<MessageOutlined />} color="processing">
            {t('tasks.details.comments.count', { count: comments.length })}
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
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ body: '' }}>
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

  const tags = buildTags(task, (key) => t(key))

  const openLinkedNote = (noteId: string) => {
    if (!task) {
      return
    }
    onClose()
    navigate(`/projects/${task.projectId}/notes?note=${noteId}`)
  }

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={640} destroyOnClose>
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
                <Button icon={<EditOutlined />} onClick={() => onEdit(task)} type="default">
                  {t('tasks.actions.edit')}
                </Button>
                <Popconfirm
                  title={t('tasks.actions.deleteTitle')}
                  description={t('tasks.actions.deleteDescription', { title: task.title })}
                  okText={t('tasks.actions.deleteConfirm')}
                  cancelText={t('tasks.actions.cancel')}
                  onConfirm={() => onDelete(task)}
                  okButtonProps={{ loading: deleting }}
                >
                  <Button icon={<DeleteOutlined />} danger loading={deleting}>
                    {t('tasks.actions.delete')}
                  </Button>
                </Popconfirm>
              </Space>
            ) : null}
          </Space>

          <Space size={8} wrap>
            {tags.map((tag) => (
              <Tag key={tag.label} color={tag.color}>
                {tag.label}
              </Tag>
            ))}
          </Space>

          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Typography.Text type="secondary">{t('tasks.details.description')}</Typography.Text>
            <Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>
              {task.description ?? t('tasks.details.noDescription')}
            </Typography.Paragraph>
          </Space>

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
                      <Tooltip title={t('notes.labels.private')}>
                        <LockOutlined style={{ color: '#f97316' }} />
                      </Tooltip>
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

          <Space size={24} wrap>
            <Space size={6} align="center">
              <UserOutlined style={{ color: '#6366f1' }} aria-hidden />
              <Typography.Text type="secondary">
                {t('tasks.details.owner', {
                  owner: task.owner?.displayName ?? 'N/A'
                })}
              </Typography.Text>
            </Space>
            <Space size={6} align="center">
              <UserOutlined style={{ color: '#10b981' }} aria-hidden />
              <Typography.Text type="secondary">
                {t('tasks.details.assignee', {
                  assignee: task.assignee?.displayName ?? t('details.noAssignee')
                })}
              </Typography.Text>
            </Space>
          </Space>

          <Space size={24} wrap>
            <Space size={6} align="center">
              <CalendarOutlined style={{ color: '#0ea5e9' }} aria-hidden />
              <Typography.Text type="secondary">
                {t('tasks.details.createdAt', {
                  date: formatDate(task.createdAt, i18n.language)
                })}
              </Typography.Text>
            </Space>
            <Space size={6} align="center">
              <CalendarOutlined style={{ color: '#f97316' }} aria-hidden />
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
