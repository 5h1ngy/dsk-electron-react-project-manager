import { ArrowLeftOutlined } from '@ant-design/icons'
import { Breadcrumb, Button, Card, Empty, Space, Spin, Tag, Typography } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import type { TaskDetails } from '@renderer/store/slices/tasks'
import { useAppSelector } from '@renderer/store/hooks'
import { selectToken } from '@renderer/store/slices/auth'

interface LoadState {
  loading: boolean
  error?: string
}

const formatDate = (value: string | Date | null, locale: string): string => {
  if (!value) {
    return '–'
  }
  const date = value instanceof Date ? value : new Date(value)
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

const TaskDetailsPage = () => {
  const { t, i18n } = useTranslation('projects')
  const { taskId } = useParams<{ taskId: string }>()
  const token = useAppSelector(selectToken)
  const navigate = useNavigate()
  const [task, setTask] = useState<TaskDetails | null>(null)
  const [{ loading, error }, setLoadState] = useState<LoadState>({ loading: true })

  useEffect(() => {
    let mounted = true
    if (!taskId || !token) {
      setLoadState({ loading: false, error: t('errors.generic') })
      return
    }
    setLoadState({ loading: true })
    window.api.task
      .get(token, taskId)
      .then((result) => {
        if (!mounted) {
          return
        }
        setTask(result)
        setLoadState({ loading: false })
      })
      .catch((err: unknown) => {
        if (!mounted) {
          return
        }
        const message =
          err instanceof Error
            ? err.message
            : t('errors.generic', { defaultValue: 'Operazione non riuscita' })
        setLoadState({ loading: false, error: message })
      })
    return () => {
      mounted = false
    }
  }, [taskId, token, t])

  const handleBack = () => {
    if (task?.projectId) {
      navigate(`/projects/${task.projectId}/tasks`, { replace: true })
    } else {
      navigate(-1)
    }
  }

  const breadcrumbItems = useMemo(() => {
    const items = [
      {
        title: (
          <span className="breadcrumb-link" onClick={() => navigate('/projects')}>
            {t('breadcrumbs.projects')}
          </span>
        )
      }
    ]
    if (task) {
      items.push({
        title: (
          <span
            className="breadcrumb-link"
            onClick={() => navigate(`/projects/${task.projectId}/tasks`)}
          >
            {task.projectKey ?? t('breadcrumbs.tasks')}
          </span>
        )
      })
      items.push({ title: task.key })
    } else {
      items.push({ title: t('details.loading') })
    }
    return items
  }, [t, task, navigate])

  const tags = useMemo(() => {
    if (!task) {
      return []
    }
    return [
      {
        label: t(`details.status.${task.status}`),
        color: 'blue'
      },
      {
        label: t(`details.priority.${task.priority}`),
        color: task.priority === 'critical' ? 'red' : task.priority === 'high' ? 'orange' : 'green'
      }
    ]
  }, [task, t])

  if (loading) {
    return (
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <Breadcrumb items={breadcrumbItems} />
        <Spin tip={t('details.loading')} />
      </Space>
    )
  }

  if (error || !task) {
    return (
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <Breadcrumb items={breadcrumbItems} />
        <Card style={{ maxWidth: 720, width: '100%' }}>
          <Empty
            description={error ?? t('details.notFound')}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
              {t('details.backToList')}
            </Button>
          </Empty>
        </Card>
      </Space>
    )
  }

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <Breadcrumb items={breadcrumbItems} />
      <Card
        style={{ maxWidth: 720, width: '100%' }}
        title={
          <Space align="center" justify="space-between" style={{ width: '100%' }}>
            <Space direction="vertical" size={4}>
              <Typography.Text type="secondary">{task.key}</Typography.Text>
              <Typography.Title level={3} style={{ margin: 0 }}>
                {task.title}
              </Typography.Title>
            </Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
              {t('details.backToList')}
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space size={8} wrap>
            {tags.map((tag) => (
              <Tag key={tag.label} color={tag.color}>
                {tag.label}
              </Tag>
            ))}
          </Space>
          <div>
            <Typography.Text type="secondary">{t('details.drawer.description')}</Typography.Text>
            <Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>
              {task.description ?? t('details.summary.noDescription')}
            </Typography.Paragraph>
          </div>
          <Space size={24} wrap>
            <div>
              <Typography.Text type="secondary">{t('details.drawer.owner')}</Typography.Text>
              <Typography.Paragraph style={{ marginBottom: 0 }}>
                {task.owner?.displayName ?? '–'}
              </Typography.Paragraph>
            </div>
            <div>
              <Typography.Text type="secondary">{t('details.drawer.assignee')}</Typography.Text>
              <Typography.Paragraph style={{ marginBottom: 0 }}>
                {task.assignee?.displayName ?? t('details.noAssignee')}
              </Typography.Paragraph>
            </div>
          </Space>
          <Space size={24} wrap>
            <div>
              <Typography.Text type="secondary">{t('details.drawer.createdAt')}</Typography.Text>
              <Typography.Paragraph style={{ marginBottom: 0 }}>
                {formatDate(task.createdAt, i18n.language)}
              </Typography.Paragraph>
            </div>
            <div>
              <Typography.Text type="secondary">{t('details.drawer.dueDate')}</Typography.Text>
              <Typography.Paragraph style={{ marginBottom: 0 }}>
                {task.dueDate ? formatDate(task.dueDate, i18n.language) : t('details.noDueDate')}
              </Typography.Paragraph>
            </div>
          </Space>
        </Space>
      </Card>
    </Space>
  )
}

export default TaskDetailsPage
