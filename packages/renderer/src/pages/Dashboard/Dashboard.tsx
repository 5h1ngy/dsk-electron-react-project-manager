import type { JSX } from 'react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import {
  AppstoreOutlined,
  ArrowRightOutlined,
  SettingOutlined,
  TeamOutlined
} from '@ant-design/icons'
import { Breadcrumb, Card, Flex, Progress, Space, Statistic, Tag, Typography } from 'antd'

import { LoadingSkeleton } from '@renderer/components/DataStates'
import { HealthStatusCard } from '@renderer/components/HealthStatusCard'
import { useDelayedLoading } from '@renderer/hooks/useDelayedLoading'
import { ShellHeaderPortal } from '@renderer/layout/Shell/ShellHeader.context'
import { usePrimaryBreadcrumb } from '@renderer/layout/Shell/hooks/usePrimaryBreadcrumb'
import { useBreadcrumbStyle } from '@renderer/layout/Shell/hooks/useBreadcrumbStyle'
import {
  renderProjectsList,
  selectRecentProjects
} from '@renderer/pages/Dashboard/Dashboard.helpers'
import { useSemanticBadges } from '@renderer/theme/hooks/useSemanticBadges'
import { useAppSelector } from '@renderer/store/hooks'
import { selectCurrentUser } from '@renderer/store/slices/auth/selectors'
import { selectProjects, selectProjectsStatus } from '@renderer/store/slices/projects'

const Dashboard = (): JSX.Element | null => {
  const { t } = useTranslation('dashboard')
  const navigate = useNavigate()
  const currentUser = useAppSelector(selectCurrentUser)
  const projects = useAppSelector(selectProjects)
  const projectsStatus = useAppSelector(selectProjectsStatus)
  const badgeTokens = useSemanticBadges()

  const isLoadingProjects = projectsStatus === 'loading'
  const projectsSkeleton = useDelayedLoading(isLoadingProjects)

  const totalProjects = projects.length

  const roleCounts = useMemo(() => {
    return projects.reduce(
      (acc, project) => {
        acc[project.role] = (acc[project.role] ?? 0) + 1
        return acc
      },
      { admin: 0, edit: 0, view: 0 } as Record<'admin' | 'edit' | 'view', number>
    )
  }, [projects])

  const managedProjects = roleCounts.admin
  const collaborativeProjects = roleCounts.edit
  const watchingProjects = roleCounts.view

  const roleLabels = useMemo(
    () => ({
      admin: t('summary.roles.admin'),
      edit: t('summary.roles.edit'),
      view: t('summary.roles.view')
    }),
    [t]
  )

  const roleDistribution = useMemo(
    () =>
      (['admin', 'edit', 'view'] as const).map((key) => ({
        key,
        label: roleLabels[key],
        count: roleCounts[key],
        percent: totalProjects > 0 ? Math.round((roleCounts[key] / totalProjects) * 100) : 0
      })),
    [roleCounts, roleLabels, totalProjects]
  )

  const tagInsights = useMemo(() => {
    const frequency = new Map<string, number>()
    projects.forEach((project) => {
      project.tags.forEach((tag) => {
        frequency.set(tag, (frequency.get(tag) ?? 0) + 1)
      })
    })

    const sorted = Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    const totalAssignments = Array.from(frequency.values()).reduce((sum, value) => sum + value, 0)

    return sorted.map(([tag, count]) => ({
      tag,
      count,
      percent: totalAssignments > 0 ? Math.round((count / totalAssignments) * 100) : 0
    }))
  }, [projects])

  const recentProjects = useMemo(() => {
    const sorted = [...projects].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    return selectRecentProjects(sorted, 5)
  }, [projects])

  const isCurrentUserAdmin = (currentUser?.roles ?? []).includes('Admin')

  const lastLoginText = currentUser?.lastLoginAt
    ? dayjs(currentUser.lastLoginAt).format('LLL')
    : t('summary.noLastLogin')

  const breadcrumbItems = usePrimaryBreadcrumb([
    { title: t('appShell.navigation.dashboard', { ns: 'common' }) }
  ])
  const breadcrumbStyle = useBreadcrumbStyle(breadcrumbItems)

  const quickLinks = useMemo(() => {
    const items = [
      {
        key: 'projects',
        label: t('quickLinks.projects'),
        description: t('quickLinks.projectsDescription'),
        icon: <AppstoreOutlined />,
        onClick: () => navigate('/projects')
      },
      {
        key: 'settings',
        label: t('quickLinks.settings'),
        description: t('quickLinks.settingsDescription'),
        icon: <SettingOutlined />,
        onClick: () => navigate('/settings')
      }
    ]

    if (isCurrentUserAdmin) {
      items.push({
        key: 'users',
        label: t('quickLinks.users'),
        description: t('quickLinks.usersDescription'),
        icon: <TeamOutlined />,
        onClick: () => navigate('/admin/users')
      })
    }

    return items
  }, [isCurrentUserAdmin, navigate, t])

  const summaryCards = useMemo(
    () => [
      {
        key: 'total',
        title: t('summary.cards.total.title'),
        value: totalProjects,
        caption: t('summary.cards.total.caption')
      },
      {
        key: 'managed',
        title: t('summary.cards.managed.title'),
        value: managedProjects,
        caption: t('summary.cards.managed.caption')
      },
      {
        key: 'collaborating',
        title: t('summary.cards.collaborating.title'),
        value: collaborativeProjects,
        caption: t('summary.cards.collaborating.caption')
      },
      {
        key: 'watching',
        title: t('summary.cards.watching.title'),
        value: watchingProjects,
        caption: t('summary.cards.watching.caption')
      }
    ],
    [collaborativeProjects, managedProjects, totalProjects, watchingProjects, t]
  )

  if (!currentUser) {
    return null
  }

  return (
    <>
      <ShellHeaderPortal>
        <Space
          size={12}
          wrap
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start'
          }}
        >
          <Breadcrumb items={breadcrumbItems} style={breadcrumbStyle} />
        </Space>
      </ShellHeaderPortal>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Flex wrap gap={16} align="stretch" style={{ width: '100%' }}>
          <Flex vertical gap={16} style={{ flex: '1 1 640px', minWidth: 320 }}>
            <Flex wrap gap={16}>
              {summaryCards.map((card) => (
                <Card key={card.key} style={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    <Statistic title={card.title} value={card.value} />
                    <Typography.Text type="secondary">{card.caption}</Typography.Text>
                  </Space>
                </Card>
              ))}
            </Flex>
            <Card title={t('insights.title')}>
              <Space direction="vertical" size={24} style={{ width: '100%' }}>
                <div>
                  <Typography.Text strong>{t('insights.roles')}</Typography.Text>
                  <Space direction="vertical" size={12} style={{ width: '100%', marginTop: 12 }}>
                    {roleDistribution.map((role) => (
                      <div key={role.key}>
                        <Flex justify="space-between">
                          <Typography.Text>{role.label}</Typography.Text>
                          <Typography.Text strong>{role.count}</Typography.Text>
                        </Flex>
                        <Progress percent={role.percent} showInfo={false} />
                      </div>
                    ))}
                  </Space>
                </div>
                <div>
                  <Typography.Text strong>{t('insights.tags')}</Typography.Text>
                  {tagInsights.length === 0 ? (
                    <Typography.Text type="secondary" style={{ display: 'block', marginTop: 12 }}>
                      {t('insights.noTags')}
                    </Typography.Text>
                  ) : (
                    <Space direction="vertical" size={12} style={{ width: '100%', marginTop: 12 }}>
                      {tagInsights.map((tag) => (
                        <div key={tag.tag}>
                          <Flex justify="space-between" align="center">
                            <Space size={8}>
                              <Tag bordered={false}>{tag.tag}</Tag>
                              <Typography.Text type="secondary">
                                {t('insights.tagCountLabel', { count: tag.count })}
                              </Typography.Text>
                            </Space>
                            <Typography.Text strong>{`${tag.percent}%`}</Typography.Text>
                          </Flex>
                          <Progress percent={tag.percent} showInfo={false} />
                        </div>
                      ))}
                    </Space>
                  )}
                </div>
              </Space>
            </Card>
            <Card title={t('recentProjects.title')}>
              {projectsSkeleton ? (
                <LoadingSkeleton layout="stack" />
              ) : (
                renderProjectsList(recentProjects, t, badgeTokens)
              )}
            </Card>
          </Flex>
          <Flex vertical gap={16} style={{ flex: '1 1 320px', minWidth: 280, maxWidth: 420 }}>
            <Card title={t('profile.title')}>
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Typography.Text>
                  <Typography.Text strong>{t('profile.username')}:</Typography.Text>{' '}
                  {currentUser.username}
                </Typography.Text>
                <Typography.Text>
                  <Typography.Text strong>{t('profile.lastLogin')}:</Typography.Text>{' '}
                  {lastLoginText}
                </Typography.Text>
                <Space direction="vertical" size={4}>
                  <Typography.Text strong>{t('profile.roles')}</Typography.Text>
                  <Space wrap>
                    {currentUser.roles.map((role) => (
                      <Tag key={role} bordered={false}>
                        {t(`roles.${role}`, { defaultValue: role })}
                      </Tag>
                    ))}
                  </Space>
                </Space>
              </Space>
            </Card>
            <Card title={t('quickLinks.title')}>
              <Flex wrap gap={16}>
                {quickLinks.map((link) => (
                  <Card
                    key={link.key}
                    hoverable
                    onClick={link.onClick}
                    style={{ flex: '1 1 220px', minWidth: 220, cursor: 'pointer' }}
                    styles={{ body: { padding: 16 } }}
                  >
                    <Space align="start" size={12}>
                      <Typography.Text style={{ fontSize: 20, lineHeight: 1 }}>
                        {link.icon}
                      </Typography.Text>
                      <Flex vertical gap={4} style={{ flex: 1 }}>
                        <Typography.Text strong>{link.label}</Typography.Text>
                        <Typography.Text type="secondary">{link.description}</Typography.Text>
                      </Flex>
                      <ArrowRightOutlined />
                    </Space>
                  </Card>
                ))}
              </Flex>
            </Card>
            <HealthStatusCard cardStyle={{ width: '100%' }} />
          </Flex>
        </Flex>
      </Space>
    </>
  )
}

Dashboard.displayName = 'Dashboard'

export { Dashboard }
export default Dashboard
