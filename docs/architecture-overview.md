# Architecture Overview

This project is structured as a multi-package Electron application with a clear separation of concerns between the main process, preload bridge, and renderer UI. The codebase leverages TypeScript, React, Ant Design, and Sequelize to deliver a desktop experience backed by a local relational database.

## Layered Composition

- **Main Process (`packages/main`)**  
  Handles lifecycle, security, and backend orchestration. `MainProcessApplication` in `packages/main/src/index.ts` boots the app, enforces a single instance, and wires up window management. It initializes Sequelize via `config/database`, resolves storage paths, and loads services into the shared `appContext`. Session management is centralized inside `SessionLifecycleManager`, which synchronizes timeout policies with persisted `SystemSetting` records and falls back to environment defaults. IPC channels are registered through dedicated registrars (`@main/ipc/*`) that expose auth, project, task, note, and health capabilities to the renderer.

- **Preload Bridge (`packages/preload`)**  
  Uses secure context isolation to expose a typed API surface. The entry point (`packages/preload/src/index.ts`) composes feature-specific bridges defined under `packages/preload/src/api`, ensuring renderer code communicates through vetted IPC contracts rather than accessing Node internals directly. Shared TypeScript definitions live in `packages/preload/src/types.ts`, keeping the renderer and main processes in sync.

- **Renderer (`packages/renderer`)**  
  A React SPA rendered inside the Electron webview. `App.tsx` wraps routes with `ConfigProvider` and Ant Design’s global token system. The theme engine in `packages/renderer/src/theme` derives light/dark palettes and accent colors through helpers such as `createThemeConfig`, `useThemeTokens`, and palette resolvers in `foundations`. Layout orchestration happens in `src/layout/Shell`, where the sidebar, header toolbar, and routed content are composed. State management relies on Redux Toolkit (`src/store`), with slices for authentication, theme selection, and domain entities. Pages under `src/pages` consume typed hooks and shared UI components from `src/components` to render dashboards, project/task views, and auxiliary screens.

## Data & Services

- **Models**  
  Sequelize models (`packages/main/src/models`) represent users, projects, tasks, notes, tags, audit logs, and system settings. Associations between these models enable complex queries and cascading updates.

- **Domain Services**  
  Business logic resides in service modules (`packages/main/src/services`). Auth services coordinate credentials and sessions, project/task services orchestrate CRUD workflows, note services manage rich content, while audit/security modules enforce policies such as role checks and content sanitization.

- **Seeds & Fixtures**  
  The `seeding` directory hosts dataset blueprints and scripts that hydrate the database for development or testing, keeping renderer screens populated with realistic content.

## Communication Flow

1. The main process bootstraps, applies hardening via `registerSecurityHooks`, connects to the database, configures session policies, and starts IPC registrars.
2. The preload script exposes strongly typed functions that proxy IPC channels, ensuring the renderer never bypasses security boundaries.
3. The renderer dispatches actions through the preload API. Redux slices coordinate UI state while responses update components, which are themed via Ant Design tokens derived from the active palette.
4. Layout components in `Shell` host routed views. Shared hooks like `useThemeTokens` and `useShellStyles` centralize spacing, color, and typography decisions across light/dark variants.

## Tooling & Quality

- **Build & Packaging**: Electron Vite configuration (`electron.vite.config.ts`) streamlines development and bundling, with `electron-builder.yml` handling distributables.
- **Testing**: Jest configuration targets both renderer and preload modules (`jest.config.ts`, `packages/preload/src/index.test.ts`), supporting unit-level validation.
- **Linting & Formatting**: ESLint (`eslint.config.mjs`) and Prettier (`.prettierrc.yaml`) enforce consistent coding standards across packages.

This layered design keeps the security-sensitive main process isolated, while the renderer remains a fully featured React application that communicates via typed IPC boundaries. The supporting tooling ensures the project remains maintainable as new features are introduced.

