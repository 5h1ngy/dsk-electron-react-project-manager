import type { JSX } from 'react'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Breadcrumb, Button, Card, Empty, Space, Spin, Tag, Typography } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import type { TaskDetails } from '@renderer/store/slices/tasks/types'
import { useAppSelector } from '@renderer/store/hooks'
import { selectToken } from '@renderer/store/slices/auth'
import {
  buildBreadcrumbItems,
  buildTags,
  formatDate
} from '@renderer/pages/TaskDetails/TaskDetails.helpers'
import type {
  LoadState,
  TaskDetailsPageProps
} from '@renderer/pages/TaskDetails/TaskDetails.types'

const TaskDetailsPage = ({}: TaskDetailsPageProps): JSX.Element => {
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

  const breadcrumbItems = useMemo(
    () =>
      buildBreadcrumbItems({
        t,
        task,
        navigate
      }),
    [t, task, navigate]
  )

  const tags = useMemo(() => buildTags(task, t), [task, t])

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
                {task.owner?.displayName ?? 'N/A'}
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

TaskDetailsPage.displayName = 'TaskDetailsPage'

export { TaskDetailsPage }
export default TaskDetailsPage
