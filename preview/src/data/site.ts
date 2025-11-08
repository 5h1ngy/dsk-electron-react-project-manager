export const featureCards = [
  {
    title: 'Offline-first everything',
    description:
      'Electron shell, REST API, and renderer all share the same domain logic so you can run projects even without a network connection.',
    emoji: '🛰️'
  },
  {
    title: 'Typed domain services',
    description:
      'Sequelize + Zod + Typedi keep auth, wiki, notes, and sprint automation predictable across backend and renderer.',
    emoji: '🧱'
  },
  {
    title: 'Multi-surface renderer',
    description:
      'React 19 + Ant Design 5 deliver dashboards, kanban, wiki, and command surfaces with a11y-first components.',
    emoji: '🖥️'
  },
  {
    title: 'Automated seeding',
    description:
      'Faker-driven factories bootstrap realistic demo data and keep SQLite migrations in check with a single command.',
    emoji: '🌱'
  },
  {
    title: 'Security-aware IPC',
    description:
      'A hardened preload bridge exposes a typed window.api contract guarded by runtime validation and logging.',
    emoji: '🔐'
  },
  {
    title: 'Docker-native builds',
    description:
      'Curated builder/runtime images for backend + webapp make CI/CD to Github Pages or containers painless.',
    emoji: '🐳'
  }
]

export const releaseStats = [
  { label: 'Electron runtime', value: '38.3.0' },
  { label: 'React renderer', value: '19.2.0' },
  { label: 'Database', value: 'SQLite + Sequelize' },
  { label: 'Testing', value: 'Jest + RTL' }
]

export const workflowTimeline = [
  {
    title: '1. Secure Desktop Shell',
    details:
      'Single-instance Electron app orchestrates auth, project data, and bridges renderer IPC to backend services.'
  },
  {
    title: '2. REST + Domain',
    details:
      'Routing-controllers API backed by shared domain modules keeps browser, desktop, and automation flows in sync.'
  },
  {
    title: '3. React Experience',
    details:
      'Ant Design tokens, Redux Toolkit, and i18next generate a cohesive UX across dashboards, wiki, and tasks.'
  },
  {
    title: '4. Seed, Ship, Observe',
    details:
      'Faker seeding, Docker builds, and structured logging make it trivial to demo, deploy, and monitor.'
  }
]

export const experienceScenes = [
  {
    title: 'Incident-proof delivery',
    context: 'Electron shell + SQLite domain keep ops offline',
    badge: 'Resilience'
  },
  {
    title: 'Intelligent wiki surfaces',
    context: 'Markdown with realtime audit + FTS enrichment',
    badge: 'Knowledge'
  },
  {
    title: 'Program-level dashboards',
    context: 'Saved views, sprint boards, anomaly flags',
    badge: 'Insights'
  }
]

export const momentumTags = [
  'Offline-first',
  'Typed IPC',
  'Sequelize Domain',
  'Secure Preload',
  'Docker Ready',
  'Seed Factories',
  'Ant Design 5',
  'React 19'
]
