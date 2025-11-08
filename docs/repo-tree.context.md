# Albero repository: dsk-electron-react-project-manager

Generato: 2025-11-08T22:06:17Z

```
dsk-electron-react-project-manager
├── docker
│   ├── backend.Dockerfile
│   ├── backend.package.dev.json
│   ├── backend.package.prod.json
│   ├── frontend.Dockerfile
│   ├── frontend.nginx.conf
│   └── frontend.package.dev.json
├── docs
│   ├── features
│   │   └── roles.md
│   ├── auto-readme.prompt.md
│   └── repo-tree.context.md
├── env
├── out
│   ├── backend
│   │   └── packages
│   │       ├── backend
│   │       │   └── src
│   │       │       ├── controllers
│   │       │       │   ├── AuthController.js
│   │       │       │   ├── BaseController.js
│   │       │       │   ├── HealthController.js
│   │       │       │   ├── index.js
│   │       │       │   ├── NoteController.js
│   │       │       │   ├── ProjectController.js
│   │       │       │   ├── RoleController.js
│   │       │       │   ├── SeedController.js
│   │       │       │   ├── SprintController.js
│   │       │       │   ├── TaskController.js
│   │       │       │   ├── TaskStatusController.js
│   │       │       │   ├── ViewController.js
│   │       │       │   └── WikiController.js
│   │       │       ├── middleware
│   │       │       │   ├── errorHandler.js
│   │       │       │   └── requestLogger.js
│   │       │       ├── openapi
│   │       │       │   ├── decorators.js
│   │       │       │   └── schemas.js
│   │       │       ├── startup
│   │       │       │   ├── bootstrap.js
│   │       │       │   └── context.js
│   │       │       └── server.js
│   │       ├── seeding
│   │       │   └── src
│   │       │       ├── DevelopmentSeeder.js
│   │       │       ├── DevelopmentSeeder.types.js
│   │       │       ├── ProjectSeeder.js
│   │       │       ├── ProjectSeedFactory.js
│   │       │       ├── run.js
│   │       │       ├── seed.helpers.js
│   │       │       ├── seedConfig.js
│   │       │       ├── UserSeeder.js
│   │       │       └── UserSeedFactory.js
│   │       └── shared
│   │           └── src
│   │               ├── config
│   │               │   ├── appError.js
│   │               │   ├── database.js
│   │               │   ├── database.test.js
│   │               │   ├── database.types.js
│   │               │   ├── env.js
│   │               │   ├── env.test.js
│   │               │   ├── env.types.js
│   │               │   ├── logger.helpers.js
│   │               │   ├── logger.js
│   │               │   ├── logger.test.js
│   │               │   ├── logger.types.js
│   │               │   ├── storagePath.js
│   │               │   ├── storagePath.test.js
│   │               │   └── storagePath.types.js
│   │               ├── models
│   │               │   ├── AuditLog.js
│   │               │   ├── Comment.js
│   │               │   ├── Note.js
│   │               │   ├── NoteTag.js
│   │               │   ├── NoteTaskLink.js
│   │               │   ├── Project.js
│   │               │   ├── ProjectMember.js
│   │               │   ├── ProjectTag.js
│   │               │   ├── Role.js
│   │               │   ├── Sprint.js
│   │               │   ├── SystemSetting.js
│   │               │   ├── Task.js
│   │               │   ├── TaskStatus.js
│   │               │   ├── User.js
│   │               │   ├── UserRole.js
│   │               │   ├── View.js
│   │               │   ├── WikiPage.js
│   │               │   └── WikiRevision.js
│   │               ├── runtime
│   │               │   └── domainContext.js
│   │               ├── services
│   │               │   ├── audit
│   │               │   │   └── index.js
│   │               │   ├── auth
│   │               │   │   ├── constants.js
│   │               │   │   ├── index.js
│   │               │   │   ├── index.test.js
│   │               │   │   ├── password.js
│   │               │   │   ├── password.test.js
│   │               │   │   ├── schemas.js
│   │               │   │   ├── sessionManager.js
│   │               │   │   └── sessionManager.test.js
│   │               │   ├── databaseMaintenance
│   │               │   │   ├── index.js
│   │               │   │   └── types.js
│   │               │   ├── note
│   │               │   │   ├── helpers.js
│   │               │   │   ├── index.js
│   │               │   │   ├── index.test.js
│   │               │   │   ├── schemas.js
│   │               │   │   └── types.js
│   │               │   ├── project
│   │               │   │   ├── helpers.js
│   │               │   │   ├── index.js
│   │               │   │   ├── index.test.js
│   │               │   │   ├── roles.js
│   │               │   │   ├── schemas.js
│   │               │   │   └── types.js
│   │               │   ├── roles
│   │               │   │   ├── constants.js
│   │               │   │   ├── index.js
│   │               │   │   └── schemas.js
│   │               │   ├── sprint
│   │               │   │   ├── index.js
│   │               │   │   ├── schemas.js
│   │               │   │   └── types.js
│   │               │   ├── task
│   │               │   │   ├── helpers.js
│   │               │   │   ├── index.js
│   │               │   │   ├── index.test.js
│   │               │   │   ├── schemas.js
│   │               │   │   └── types.js
│   │               │   ├── taskStatus
│   │               │   │   ├── defaults.js
│   │               │   │   ├── index.js
│   │               │   │   ├── index.test.js
│   │               │   │   ├── schemas.js
│   │               │   │   └── types.js
│   │               │   ├── view
│   │               │   │   ├── index.js
│   │               │   │   ├── index.test.js
│   │               │   │   ├── schemas.js
│   │               │   │   └── types.js
│   │               │   ├── wiki
│   │               │   │   ├── helpers.js
│   │               │   │   ├── index.js
│   │               │   │   ├── schemas.js
│   │               │   │   └── types.js
│   │               │   ├── index.js
│   │               │   └── types.js
│   │               └── index.js
│   ├── main
│   │   └── index.js
│   ├── preload
│   │   └── index.cjs
│   ├── renderer
│   │   ├── assets
│   │   │   ├── index-g6nihbbo.css
│   │   │   └── index-gRvGBYcz.js
│   │   ├── favicon.ico
│   │   └── index.html
│   └── renderer-web
│       ├── assets
│       │   ├── index-BRiMaGOt.css
│       │   └── index-DCiJMJQs.js
│       ├── favicon.ico
│       └── index.html
├── packages
│   ├── backend
│   │   ├── src
│   │   │   ├── controllers
│   │   │   │   ├── AuthController.ts
│   │   │   │   ├── BaseController.ts
│   │   │   │   ├── HealthController.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── NoteController.ts
│   │   │   │   ├── ProjectController.ts
│   │   │   │   ├── RoleController.ts
│   │   │   │   ├── SeedController.ts
│   │   │   │   ├── SprintController.ts
│   │   │   │   ├── TaskController.ts
│   │   │   │   ├── TaskStatusController.ts
│   │   │   │   ├── ViewController.ts
│   │   │   │   └── WikiController.ts
│   │   │   ├── middleware
│   │   │   │   ├── errorHandler.ts
│   │   │   │   └── requestLogger.ts
│   │   │   ├── openapi
│   │   │   │   ├── decorators.ts
│   │   │   │   └── schemas.ts
│   │   │   ├── startup
│   │   │   │   ├── bootstrap.ts
│   │   │   │   └── context.ts
│   │   │   └── server.ts
│   │   ├── test
│   │   │   ├── __mocks__
│   │   │   │   ├── fileMock.ts
│   │   │   │   ├── noopModule.ts
│   │   │   │   ├── reactMarkdownMock.tsx
│   │   │   │   └── styleMock.ts
│   │   │   ├── setupEnv.ts
│   │   │   └── setupRendererTests.ts
│   │   ├── tsconfig.backend.dev.json
│   │   └── tsconfig.backend.prod.json
│   ├── electron
│   │   ├── resources
│   │   │   └── icon.png
│   │   ├── scripts
│   │   │   └── prune-dev-deps.cjs
│   │   ├── src
│   │   │   ├── main
│   │   │   │   ├── ipc
│   │   │   │   │   ├── auth.ts
│   │   │   │   │   ├── database.ts
│   │   │   │   │   ├── health.ts
│   │   │   │   │   ├── note.ts
│   │   │   │   │   ├── project.ts
│   │   │   │   │   ├── role.ts
│   │   │   │   │   ├── sprint.ts
│   │   │   │   │   ├── task.ts
│   │   │   │   │   ├── taskStatus.ts
│   │   │   │   │   ├── utils.ts
│   │   │   │   │   ├── view.ts
│   │   │   │   │   └── wiki.ts
│   │   │   │   ├── services
│   │   │   │   │   └── security
│   │   │   │   │       └── index.ts
│   │   │   │   ├── appContext.ts
│   │   │   │   └── index.ts
│   │   │   └── preload
│   │   │       └── src
│   │   │           ├── api
│   │   │           │   ├── auth.test.ts
│   │   │           │   ├── auth.ts
│   │   │           │   ├── database.ts
│   │   │           │   ├── health.test.ts
│   │   │           │   ├── health.ts
│   │   │           │   ├── note.test.ts
│   │   │           │   ├── note.ts
│   │   │           │   ├── project.test.ts
│   │   │           │   ├── project.ts
│   │   │           │   ├── role.ts
│   │   │           │   ├── shared.ts
│   │   │           │   ├── sprint.ts
│   │   │           │   ├── task.test.ts
│   │   │           │   ├── task.ts
│   │   │           │   ├── taskStatus.test.ts
│   │   │           │   ├── taskStatus.ts
│   │   │           │   ├── view.ts
│   │   │           │   └── wiki.ts
│   │   │           ├── global.d.ts
│   │   │           ├── index.test.ts
│   │   │           ├── index.ts
│   │   │           └── types.ts
│   │   ├── test
│   │   │   ├── __mocks__
│   │   │   │   ├── fileMock.ts
│   │   │   │   ├── noopModule.ts
│   │   │   │   ├── reactMarkdownMock.tsx
│   │   │   │   └── styleMock.ts
│   │   │   ├── setupEnv.ts
│   │   │   └── setupRendererTests.ts
│   │   ├── electron-builder.yml
│   │   ├── electron.vite.config.ts
│   │   ├── tsconfig.electron.json
│   │   ├── tsconfig.json
│   │   ├── tsconfig.node.json
│   │   └── tsconfig.web.json
│   ├── frontend
│   │   ├── src
│   │   │   ├── components
│   │   │   │   ├── DataStates
│   │   │   │   │   ├── EmptyState.tsx
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── LoadingSkeleton.tsx
│   │   │   │   ├── Markdown
│   │   │   │   │   ├── MarkdownEditor.tsx
│   │   │   │   │   ├── markdownRenderers.tsx
│   │   │   │   │   └── MarkdownViewer.tsx
│   │   │   │   ├── Surface
│   │   │   │   │   └── BorderedPanel.tsx
│   │   │   │   ├── TaskSearch
│   │   │   │   │   └── TaskSearchDrawer.tsx
│   │   │   │   ├── ErrorBoundary.test.tsx
│   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   ├── ErrorBoundary.types.tsx
│   │   │   │   ├── HealthStatusCard.helpers.ts
│   │   │   │   ├── HealthStatusCard.hooks.ts
│   │   │   │   ├── HealthStatusCard.test.tsx
│   │   │   │   ├── HealthStatusCard.tsx
│   │   │   │   ├── HealthStatusCard.types.tsx
│   │   │   │   ├── LanguageSwitcher.helpers.ts
│   │   │   │   ├── LanguageSwitcher.hooks.ts
│   │   │   │   ├── LanguageSwitcher.test.tsx
│   │   │   │   ├── LanguageSwitcher.tsx
│   │   │   │   ├── LanguageSwitcher.types.tsx
│   │   │   │   ├── ThemeControls.hooks.ts
│   │   │   │   ├── ThemeControls.test.tsx
│   │   │   │   ├── ThemeControls.tsx
│   │   │   │   └── ThemeControls.types.tsx
│   │   │   ├── config
│   │   │   │   └── runtime.ts
│   │   │   ├── hooks
│   │   │   │   ├── useDelayedLoading.ts
│   │   │   │   ├── useSessionWatcher.test.ts
│   │   │   │   └── useSessionWatcher.ts
│   │   │   ├── i18n
│   │   │   │   ├── locales
│   │   │   │   │   ├── de
│   │   │   │   │   │   ├── common.json
│   │   │   │   │   │   ├── dashboard.json
│   │   │   │   │   │   ├── database.json
│   │   │   │   │   │   ├── login.json
│   │   │   │   │   │   ├── projects.json
│   │   │   │   │   │   ├── register.json
│   │   │   │   │   │   └── roles.json
│   │   │   │   │   ├── en
│   │   │   │   │   │   ├── common.json
│   │   │   │   │   │   ├── dashboard.json
│   │   │   │   │   │   ├── database.json
│   │   │   │   │   │   ├── login.json
│   │   │   │   │   │   ├── projects.json
│   │   │   │   │   │   ├── register.json
│   │   │   │   │   │   └── roles.json
│   │   │   │   │   ├── fr
│   │   │   │   │   │   ├── common.json
│   │   │   │   │   │   ├── dashboard.json
│   │   │   │   │   │   ├── database.json
│   │   │   │   │   │   ├── login.json
│   │   │   │   │   │   ├── projects.json
│   │   │   │   │   │   ├── register.json
│   │   │   │   │   │   └── roles.json
│   │   │   │   │   └── it
│   │   │   │   │       ├── common.json
│   │   │   │   │       ├── dashboard.json
│   │   │   │   │       ├── database.json
│   │   │   │   │       ├── login.json
│   │   │   │   │       ├── projects.json
│   │   │   │   │       ├── register.json
│   │   │   │   │       └── roles.json
│   │   │   │   └── config.ts
│   │   │   ├── layout
│   │   │   │   ├── Shell
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── AccountMenu
│   │   │   │   │   │   │   ├── AccountMenu.style.tsx
│   │   │   │   │   │   │   ├── AccountMenu.tsx
│   │   │   │   │   │   │   ├── AccountMenu.types.ts
│   │   │   │   │   │   │   └── index.ts
│   │   │   │   │   │   ├── Sider
│   │   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   │   ├── Sider.style.tsx
│   │   │   │   │   │   │   ├── Sider.tsx
│   │   │   │   │   │   │   └── Sider.types.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── hooks
│   │   │   │   │   │   ├── useBreadcrumbStyle.ts
│   │   │   │   │   │   └── usePrimaryBreadcrumb.tsx
│   │   │   │   │   ├── utils
│   │   │   │   │   │   └── userIdentity.ts
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   ├── Shell.container.tsx
│   │   │   │   │   ├── Shell.helpers.tsx
│   │   │   │   │   ├── Shell.hooks.ts
│   │   │   │   │   ├── Shell.style.tsx
│   │   │   │   │   ├── Shell.types.tsx
│   │   │   │   │   ├── Shell.view.tsx
│   │   │   │   │   └── ShellHeader.context.tsx
│   │   │   │   ├── Blank.helpers.ts
│   │   │   │   ├── Blank.tsx
│   │   │   │   └── Blank.types.tsx
│   │   │   ├── pages
│   │   │   │   ├── Dashboard
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── CreateUserModal.tsx
│   │   │   │   │   │   ├── EditUserModal.tsx
│   │   │   │   │   │   ├── UserCardsGrid.tsx
│   │   │   │   │   │   ├── UserColumnVisibilityControls.constants.ts
│   │   │   │   │   │   ├── UserColumnVisibilityControls.tsx
│   │   │   │   │   │   ├── UserFilters.tsx
│   │   │   │   │   │   ├── UserListView.tsx
│   │   │   │   │   │   └── UserTable.tsx
│   │   │   │   │   ├── hooks
│   │   │   │   │   │   ├── useUserData.ts
│   │   │   │   │   │   ├── useUserForms.ts
│   │   │   │   │   │   └── useUserManagement.tsx
│   │   │   │   │   ├── schemas
│   │   │   │   │   │   ├── userSchemas.test.ts
│   │   │   │   │   │   └── userSchemas.ts
│   │   │   │   │   ├── Dashboard.helpers.tsx
│   │   │   │   │   ├── Dashboard.tsx
│   │   │   │   │   ├── Dashboard.types.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Database
│   │   │   │   │   ├── DatabasePage.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Login
│   │   │   │   │   ├── hooks
│   │   │   │   │   │   └── useLoginForm.ts
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── Login.helpers.ts
│   │   │   │   │   ├── Login.tsx
│   │   │   │   │   └── Login.types.ts
│   │   │   │   ├── ProjectLayout
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── ProjectLayout.helpers.tsx
│   │   │   │   │   ├── ProjectLayout.tsx
│   │   │   │   │   ├── ProjectLayout.types.ts
│   │   │   │   │   └── useProjectRouteContext.ts
│   │   │   │   ├── ProjectNotes
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── ProjectNotesPage.tsx
│   │   │   │   ├── ProjectOverview
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── ProjectOverview.helpers.test.ts
│   │   │   │   │   ├── ProjectOverview.helpers.ts
│   │   │   │   │   ├── ProjectOverview.tsx
│   │   │   │   │   └── ProjectOverview.types.ts
│   │   │   │   ├── Projects
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── CreateProjectModal.tsx
│   │   │   │   │   │   ├── EditProjectModal.tsx
│   │   │   │   │   │   ├── KanbanColumn.tsx
│   │   │   │   │   │   ├── ProjectBoard.tsx
│   │   │   │   │   │   ├── ProjectCardsGrid.tsx
│   │   │   │   │   │   ├── ProjectDetailsCard.tsx
│   │   │   │   │   │   ├── ProjectList.tsx
│   │   │   │   │   │   ├── ProjectsActionBar.tsx
│   │   │   │   │   │   ├── ProjectSavedViewsControls.tsx
│   │   │   │   │   │   ├── ProjectSummaryList.tsx
│   │   │   │   │   │   ├── ProjectTasksList.tsx
│   │   │   │   │   │   ├── ProjectTasksTable.tsx
│   │   │   │   │   │   ├── TaskCard.tsx
│   │   │   │   │   │   ├── TaskDetailsModal.tsx
│   │   │   │   │   │   └── TaskFormModal.tsx
│   │   │   │   │   ├── hooks
│   │   │   │   │   │   ├── useProjectBoard.tsx
│   │   │   │   │   │   ├── useProjectDetails.tsx
│   │   │   │   │   │   ├── useProjectForms.ts
│   │   │   │   │   │   ├── useProjectSavedViews.ts
│   │   │   │   │   │   ├── useProjectsPage.tsx
│   │   │   │   │   │   └── useTaskModals.tsx
│   │   │   │   │   ├── schemas
│   │   │   │   │   │   ├── projectSchemas.ts
│   │   │   │   │   │   └── taskSchemas.ts
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── Projects.helpers.ts
│   │   │   │   │   ├── Projects.tsx
│   │   │   │   │   └── Projects.types.ts
│   │   │   │   ├── ProjectSprints
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── ProjectSprintsPage.tsx
│   │   │   │   ├── ProjectTasks
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── ProjectSprintBoard
│   │   │   │   │   │   │   ├── SprintBoardToolbar.tsx
│   │   │   │   │   │   │   ├── SprintGroup.tsx
│   │   │   │   │   │   │   ├── SprintLane.tsx
│   │   │   │   │   │   │   ├── types.ts
│   │   │   │   │   │   │   └── UnassignedTasksCard.tsx
│   │   │   │   │   │   ├── ProjectSprintBoard.tsx
│   │   │   │   │   │   ├── ProjectTasksCardGrid.tsx
│   │   │   │   │   │   ├── TaskColumnVisibilityControls.tsx
│   │   │   │   │   │   ├── TaskFiltersBar.tsx
│   │   │   │   │   │   ├── TaskSavedViewsControls.test.tsx
│   │   │   │   │   │   ├── TaskSavedViewsControls.tsx
│   │   │   │   │   │   └── TaskStatusManager.tsx
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── ProjectTasks.helpers.ts
│   │   │   │   │   ├── ProjectTasks.tsx
│   │   │   │   │   └── ProjectTasks.types.ts
│   │   │   │   ├── ProjectWiki
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── ProjectWikiPage.tsx
│   │   │   │   ├── Register
│   │   │   │   │   ├── hooks
│   │   │   │   │   │   └── useRegisterForm.ts
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── Register.helpers.ts
│   │   │   │   │   ├── Register.tsx
│   │   │   │   │   └── Register.types.ts
│   │   │   │   ├── RoleManagement
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── RoleManagementPage.tsx
│   │   │   │   ├── Settings
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   └── Settings.tsx
│   │   │   │   ├── TaskDetails
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── TaskDetails.helpers.tsx
│   │   │   │   │   ├── TaskDetails.types.ts
│   │   │   │   │   └── TaskDetailsPage.tsx
│   │   │   │   ├── UserManagement
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── UserManagementPage.tsx
│   │   │   │   ├── ProtectedRoute.test.tsx
│   │   │   │   ├── ProtectedRoute.tsx
│   │   │   │   ├── PublicRoute.test.tsx
│   │   │   │   ├── PublicRoute.tsx
│   │   │   │   └── routes.tsx
│   │   │   ├── platform
│   │   │   │   └── httpBridge.ts
│   │   │   ├── store
│   │   │   │   ├── slices
│   │   │   │   │   ├── auth
│   │   │   │   │   │   ├── constants.ts
│   │   │   │   │   │   ├── helpers.ts
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   ├── selectors.ts
│   │   │   │   │   │   ├── slice.ts
│   │   │   │   │   │   ├── thunks.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── locale
│   │   │   │   │   │   ├── actions.ts
│   │   │   │   │   │   ├── constants.ts
│   │   │   │   │   │   ├── helpers.ts
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   ├── selectors.ts
│   │   │   │   │   │   ├── slice.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── notes
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   ├── notes.slice.test.ts
│   │   │   │   │   │   ├── selectors.ts
│   │   │   │   │   │   ├── slice.ts
│   │   │   │   │   │   ├── thunks.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── projects
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   ├── projects.slice.test.ts
│   │   │   │   │   │   ├── selectors.ts
│   │   │   │   │   │   ├── slice.ts
│   │   │   │   │   │   ├── thunks.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── sprints
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   ├── selectors.ts
│   │   │   │   │   │   ├── slice.ts
│   │   │   │   │   │   ├── thunks.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── tasks
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   ├── selectors.ts
│   │   │   │   │   │   ├── slice.ts
│   │   │   │   │   │   ├── tasks.slice.test.ts
│   │   │   │   │   │   ├── thunks.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── taskStatuses
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   ├── selectors.ts
│   │   │   │   │   │   ├── slice.ts
│   │   │   │   │   │   ├── taskStatuses.slice.test.ts
│   │   │   │   │   │   ├── thunks.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── theme
│   │   │   │   │   │   ├── constants.ts
│   │   │   │   │   │   ├── helpers.ts
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   ├── selectors.ts
│   │   │   │   │   │   ├── slice.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── views
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   ├── selectors.ts
│   │   │   │   │   │   ├── slice.ts
│   │   │   │   │   │   ├── thunks.ts
│   │   │   │   │   │   ├── types.ts
│   │   │   │   │   │   └── views.slice.test.ts
│   │   │   │   │   └── wiki
│   │   │   │   │       ├── index.ts
│   │   │   │   │       ├── selectors.ts
│   │   │   │   │       ├── slice.ts
│   │   │   │   │       ├── thunks.ts
│   │   │   │   │       └── types.ts
│   │   │   │   ├── hooks.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── setupStore.ts
│   │   │   │   └── types.ts
│   │   │   ├── theme
│   │   │   │   ├── components
│   │   │   │   │   ├── dark.ts
│   │   │   │   │   └── light.ts
│   │   │   │   ├── foundations
│   │   │   │   │   ├── brand.ts
│   │   │   │   │   ├── palette.ts
│   │   │   │   │   ├── shadow.ts
│   │   │   │   │   ├── shape.ts
│   │   │   │   │   ├── spacing.ts
│   │   │   │   │   └── typography.ts
│   │   │   │   ├── hooks
│   │   │   │   │   ├── useSemanticBadges.ts
│   │   │   │   │   └── useThemeTokens.ts
│   │   │   │   ├── utils
│   │   │   │   │   └── color.ts
│   │   │   │   └── index.ts
│   │   │   ├── App.test.tsx
│   │   │   ├── App.tsx
│   │   │   ├── env.d.ts
│   │   │   ├── main.tsx
│   │   │   └── types.ts
│   │   ├── test
│   │   │   ├── __mocks__
│   │   │   │   ├── fileMock.ts
│   │   │   │   ├── noopModule.ts
│   │   │   │   ├── reactMarkdownMock.tsx
│   │   │   │   └── styleMock.ts
│   │   │   ├── setupEnv.ts
│   │   │   └── setupRendererTests.ts
│   │   ├── index.html
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   ├── seeding
│   │   ├── src
│   │   │   ├── DevelopmentSeeder.ts
│   │   │   ├── DevelopmentSeeder.types.ts
│   │   │   ├── ProjectSeeder.ts
│   │   │   ├── ProjectSeedFactory.ts
│   │   │   ├── run.ts
│   │   │   ├── seed-config.json
│   │   │   ├── seed.helpers.ts
│   │   │   ├── seedConfig.ts
│   │   │   ├── UserSeeder.ts
│   │   │   └── UserSeedFactory.ts
│   │   ├── test
│   │   │   ├── __mocks__
│   │   │   │   ├── fileMock.ts
│   │   │   │   ├── noopModule.ts
│   │   │   │   ├── reactMarkdownMock.tsx
│   │   │   │   └── styleMock.ts
│   │   │   ├── setupEnv.ts
│   │   │   └── setupRendererTests.ts
│   │   └── tsconfig.tools.json
│   └── shared
│       ├── src
│       │   ├── config
│       │   │   ├── appError.ts
│       │   │   ├── database.test.ts
│       │   │   ├── database.ts
│       │   │   ├── database.types.ts
│       │   │   ├── env.test.ts
│       │   │   ├── env.ts
│       │   │   ├── env.types.ts
│       │   │   ├── logger.helpers.ts
│       │   │   ├── logger.test.ts
│       │   │   ├── logger.ts
│       │   │   ├── logger.types.ts
│       │   │   ├── storagePath.test.ts
│       │   │   ├── storagePath.ts
│       │   │   └── storagePath.types.ts
│       │   ├── models
│       │   │   ├── AuditLog.ts
│       │   │   ├── Comment.ts
│       │   │   ├── Note.ts
│       │   │   ├── NoteTag.ts
│       │   │   ├── NoteTaskLink.ts
│       │   │   ├── Project.ts
│       │   │   ├── ProjectMember.ts
│       │   │   ├── ProjectTag.ts
│       │   │   ├── Role.ts
│       │   │   ├── Sprint.ts
│       │   │   ├── SystemSetting.ts
│       │   │   ├── Task.ts
│       │   │   ├── TaskStatus.ts
│       │   │   ├── User.ts
│       │   │   ├── UserRole.ts
│       │   │   ├── View.ts
│       │   │   ├── WikiPage.ts
│       │   │   └── WikiRevision.ts
│       │   ├── runtime
│       │   │   └── domainContext.ts
│       │   ├── services
│       │   │   ├── audit
│       │   │   │   └── index.ts
│       │   │   ├── auth
│       │   │   │   ├── constants.ts
│       │   │   │   ├── index.test.ts
│       │   │   │   ├── index.ts
│       │   │   │   ├── password.test.ts
│       │   │   │   ├── password.ts
│       │   │   │   ├── schemas.ts
│       │   │   │   ├── sessionManager.test.ts
│       │   │   │   └── sessionManager.ts
│       │   │   ├── databaseMaintenance
│       │   │   │   ├── index.ts
│       │   │   │   └── types.ts
│       │   │   ├── note
│       │   │   │   ├── helpers.ts
│       │   │   │   ├── index.test.ts
│       │   │   │   ├── index.ts
│       │   │   │   ├── schemas.ts
│       │   │   │   └── types.ts
│       │   │   ├── project
│       │   │   │   ├── helpers.ts
│       │   │   │   ├── index.test.ts
│       │   │   │   ├── index.ts
│       │   │   │   ├── roles.ts
│       │   │   │   ├── schemas.ts
│       │   │   │   └── types.ts
│       │   │   ├── roles
│       │   │   │   ├── constants.ts
│       │   │   │   ├── index.ts
│       │   │   │   └── schemas.ts
│       │   │   ├── sprint
│       │   │   │   ├── index.ts
│       │   │   │   ├── schemas.ts
│       │   │   │   └── types.ts
│       │   │   ├── task
│       │   │   │   ├── helpers.ts
│       │   │   │   ├── index.test.ts
│       │   │   │   ├── index.ts
│       │   │   │   ├── schemas.ts
│       │   │   │   └── types.ts
│       │   │   ├── taskStatus
│       │   │   │   ├── defaults.ts
│       │   │   │   ├── index.test.ts
│       │   │   │   ├── index.ts
│       │   │   │   ├── schemas.ts
│       │   │   │   └── types.ts
│       │   │   ├── view
│       │   │   │   ├── index.test.ts
│       │   │   │   ├── index.ts
│       │   │   │   ├── schemas.ts
│       │   │   │   └── types.ts
│       │   │   ├── wiki
│       │   │   │   ├── helpers.ts
│       │   │   │   ├── index.ts
│       │   │   │   ├── schemas.ts
│       │   │   │   └── types.ts
│       │   │   ├── index.ts
│       │   │   └── types.ts
│       │   └── index.ts
│       └── test
│           ├── __mocks__
│           │   ├── fileMock.ts
│           │   ├── noopModule.ts
│           │   ├── reactMarkdownMock.tsx
│           │   └── styleMock.ts
│           ├── setupEnv.ts
│           └── setupRendererTests.ts
├── preview
│   ├── public
│   │   ├── Screenshot 2025-11-08 115411.png
│   │   ├── Screenshot 2025-11-08 115440.png
│   │   ├── Screenshot 2025-11-08 115503.png
│   │   ├── Screenshot 2025-11-08 115529.png
│   │   ├── Screenshot 2025-11-08 115554.png
│   │   ├── Screenshot 2025-11-08 115609.png
│   │   ├── Screenshot 2025-11-08 115625.png
│   │   └── Screenshot 2025-11-08 115638.png
│   ├── src
│   │   ├── components
│   │   │   ├── ArchitectureGraph.tsx
│   │   │   ├── ExperienceShowcase.tsx
│   │   │   ├── FeatureOrbit.tsx
│   │   │   ├── HeroGallery.tsx
│   │   │   └── HeroStage.tsx
│   │   ├── data
│   │   │   └── site.ts
│   │   ├── design
│   │   │   └── theme.ts
│   │   ├── hooks
│   │   │   ├── useBlurOnScroll.ts
│   │   │   ├── useGlobalAnimations.ts
│   │   │   └── useLenisScroll.ts
│   │   ├── theme
│   │   │   ├── foundations
│   │   │   │   ├── brand.ts
│   │   │   │   ├── palette.ts
│   │   │   │   ├── shadow.ts
│   │   │   │   ├── shape.ts
│   │   │   │   ├── spacing.ts
│   │   │   │   └── typography.ts
│   │   │   ├── index.ts
│   │   │   └── utils.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── public
│   └── favicon.ico
├── scripts
│   ├── postinstall.mjs
│   ├── repotree.mjs
│   └── versioning.mjs
├── commitlint.config.cjs
├── docker-compose.yml
├── eslint.config.mjs
├── jest.config.ts
├── LICENSE
├── package-lock.json
├── package.json
├── prettier.config.cjs
└── README.md
```
