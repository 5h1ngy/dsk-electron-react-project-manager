import { Card, Col, Empty, Row, Space, Statistic } from 'antd'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { ProjectDetailsCard } from '@renderer/pages/Projects/components/ProjectDetailsCard'
import { useProjectRouteContext } from '@renderer/pages/ProjectLayout'

export const ProjectOverviewPage = () => {
  const { project, projectLoading, tasks } = useProjectRouteContext()
  const { t } = useTranslation('projects')

  const metrics = useMemo(() => {
    const total = tasks.length
    const done = tasks.filter((task) => task.status === 'done').length
    const active = total - done
    return { total, active, done }
  }, [tasks])

  if (!project && !projectLoading) {
    return (
      <Empty
        description={t('details.notFound')}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={{ marginTop: 64 }}
      />
    )
  }

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <ProjectDetailsCard project={project ?? null} loading={projectLoading} />
      <Card title={t('details.overview.metrics.title')}>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Statistic
              title={t('details.overview.metrics.total')}
              value={metrics.total}
              valueStyle={{ fontSize: 28 }}
            />
          </Col>
          <Col xs={24} md={8}>
            <Statistic
              title={t('details.overview.metrics.active')}
              value={metrics.active}
              valueStyle={{ fontSize: 28 }}
            />
          </Col>
          <Col xs={24} md={8}>
            <Statistic
              title={t('details.overview.metrics.done')}
              value={metrics.done}
              valueStyle={{ fontSize: 28 }}
            />
          </Col>
        </Row>
      </Card>
    </Space>
  )
}

export default ProjectOverviewPage
