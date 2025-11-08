export const heroContent = {
  eyebrow: 'Offline-first delivery suite',
  title: 'DSK Project Manager',
  description:
    'One workspace that blends Electron, React, and a typed REST API so distributed teams can run projects, wikis, and automations even when the connection drops.',
  heroShot: '/Screenshot 2025-11-08 115411.png',
  primaryCta: 'Download desktop',
  secondaryCta: 'Explore docs',
  stats: [
    { label: 'Surfaces', value: 'Electron / Web / API' },
    { label: 'Roles', value: 'Admin / Maintainer / Contributor / Viewer' },
    { label: 'Seed time', value: '< 2 min faker bootstrap' }
  ]
}

export const featureHighlights = [
  {
    title: 'Resilient Work OS',
    description:
      'Single-instance Electron shell, offline queues, and secure preload bridge keep execution flowing.',
    icon: 'ThunderboltOutlined'
  },
  {
    title: 'Typed Service Mesh',
    description: 'Routing-controllers, Typedi, and Zod shared DTOs align renderer + API logic.',
    icon: 'ApiOutlined'
  },
  {
    title: 'Knowledge & Delivery',
    description: 'Kanban, dashboards, and markdown wiki hubs powered by React 19 + Ant Design 5.',
    icon: 'LayoutOutlined'
  },
  {
    title: 'Automation & Ops',
    description: 'Docker builds, Faker seed lab, and scripted releases mirror production flows.',
    icon: 'CloudUploadOutlined'
  }
]

export const experienceDeck = [
  {
    title: 'Mission control for sprints',
    summary:
      'Batch-edit lanes, automate status transitions, and keep telemetry alive even when VPN links fail.',
    image: '/Screenshot 2025-11-08 115440.png',
    badge: 'Kanban + dashboards',
    highlights: ['Offline sync queue', 'Saved board views', 'Role-aware widgets']
  },
  {
    title: 'Knowledge that sticks',
    summary:
      'Markdown wiki with revisions, audit logs, and instant search so context stays attached to delivery.',
    image: '/Screenshot 2025-11-08 115503.png',
    badge: 'Docs & wiki',
    highlights: ['Revision timeline', 'Search boosters', 'Granular permissions']
  },
  {
    title: 'Security on autopilot',
    summary:
      'Argon2 hashing, JWT sessions, seeded admin roles, and policy-backed APIs make each deploy production-ready.',
    image: '/Screenshot 2025-11-08 115554.png',
    badge: 'Roles & governance',
    highlights: ['Role-based guards', 'Audit-ready logs', 'API health probes']
  }
]

export const galleryShots = [
  '/Screenshot 2025-11-08 115625.png',
  '/Screenshot 2025-11-08 115609.png',
  '/Screenshot 2025-11-08 115638.png',
  '/Screenshot 2025-11-08 115529.png'
]

export const architectureGraph = {
  core: {
    title: 'Shared domain layer',
    description:
      'Typed DTOs, Sequelize models, wiki services, authentication, and audit emitters shared by every surface.',
    capabilities: ['packages/shared', 'Zod schemas', 'Event emitters']
  },
  nodes: [
    {
      title: 'Electron shell',
      description: 'Single-instance desktop with secure preload + IPC bridge and OS native services.',
      capabilities: ['packages/electron', 'window.api bridge', 'Offline queue']
    },
    {
      title: 'React renderer',
      description: 'Ant Design 5 UI, Redux Toolkit store, i18n, and feature modules for projects + wiki.',
      capabilities: ['packages/frontend', 'Ant Design tokens', 'Realtime views']
    },
    {
      title: 'Backend API',
      description: 'Routing-controllers, Typedi DI, and SQLite persistence served through Node 22 workers.',
      capabilities: ['packages/backend', 'REST /auth, /projects', 'Background jobs']
    },
    {
      title: 'Seeding & ops',
      description: 'Faker-driven seed orchestrators, env-aware scripts, and Docker-ready manifests.',
      capabilities: ['packages/seeding', 'scripts/versioning', 'Docker compose']
    }
  ]
}
