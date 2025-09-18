import type { JSX } from 'react'
import { Card, Col, Row, Skeleton, Space, Statistic } from 'antd'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { EmptyState } from '@renderer/components/DataStates'
import { useDelayedLoading } from '@renderer/hooks/useDelayedLoading'
import { ProjectDetailsCard } from '@renderer/pages/Projects/components/ProjectDetailsCard'
import { useProjectRouteContext } from '@renderer/pages/ProjectLayout'
import { calculateProjectMetrics } from '@renderer/pages/ProjectOverview/ProjectOverview.helpers'
import type { ProjectOverviewPageProps } from '@renderer/pages/ProjectOverview/ProjectOverview.types'

const ProjectOverviewPage = ({}: ProjectOverviewPageProps): JSX.Element => {
  const { project, projectLoading, tasks } = useProjectRouteContext()
  const { t } = useTranslation('projects')
  const showSkeleton = useDelayedLoading(projectLoading)

  const metrics = useMemo(() => calculateProjectMetrics(tasks), [tasks])

  if (!project && !projectLoading) {
    return (
      <div style={{ marginTop: 64 }}>
        <EmptyState title={t('details.notFound')} />
      </div>
    )
  }

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <ProjectDetailsCard project={project ?? null} loading={projectLoading} />
      <Card title={t('details.overview.metrics.title')}>
        {showSkeleton ? (
          <Skeleton active paragraph={{ rows: 3 }} title={false} />
        ) : (
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
        )}
      </Card>
    </Space>
  )
}

ProjectOverviewPage.displayName = 'ProjectOverviewPage'

export { ProjectOverviewPage }
export default ProjectOverviewPage
