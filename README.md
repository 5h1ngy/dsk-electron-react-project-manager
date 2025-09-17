# DSK Electron React Project Manager

[![Electron Shield][electron-shield]][electron-link]
[![React Shield][react-shield]][react-link]
[![SQLite Shield][sqlite-shield]][sqlite-link]
[![TypeScript Shield][typescript-shield]][typescript-link]
[![Jest Shield][jest-shield]][jest-link]

![Application preview](assets/preview.png)

> Release 7.4.19 - Modern desktop project manager with a hardened Electron main process, a typed preload bridge, and a polished React/Redux experience.

---

## Table of Contents
- [Feature Highlights](#feature-highlights)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Quick Start](#quick-start)
- [Scripts & Tooling](#scripts--tooling)
- [Database & Seeding](#database--seeding)
- [Testing Strategy](#testing-strategy)
- [window.api Contract](#windowapi-contract)
- [Configuration](#configuration)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Feature Highlights

- Hardened Electron main process with single instance lock, security hooks, and structured logging.
- Domain-driven services for auth, projects, tasks, notes, and auditing backed by Sequelize.
- Strongly typed preload bridge exposing the `window.api` contract with runtime validation.
- Rich React 19 renderer using Ant Design 5, Redux Toolkit, i18next, and dynamic accent theming.
- Comprehensive testing setup spanning Jest, Testing Library, and ts-jest across processes.
- Faker-powered seeders that bootstrap realistic demo data for local development.

---

## Tech Stack

| Layer | Highlights |
| ----- | ---------- |
| Runtime | Electron 38, Node 22 |
| Renderer | React 19, React Router 6, Ant Design 5, Redux Toolkit, React Hook Form, i18next |
| Domain | SQLite, Sequelize (TypeScript), Zod, @node-rs/argon2 |
| Tooling | electron-vite, ts-node + tsconfig-paths, Jest + ts-jest, Testing Library, ESLint 9, Prettier 3, TypeScript 5.7 |

---

## Project Structure

```text
dsk-electron-react-project-manager
|- packages
|  |- main        # Electron main process, IPC registrars, services, Sequelize models
|  |- preload     # Typed context bridge defining window.api
|  \- renderer    # React/Redux UI, routes, layout, theme system, i18n
|- seeding        # Seeder entry points and dataset builders
|- resources      # Icons and extra assets for packaging
|- test           # Jest configuration, mocks, and helpers
|- assets         # Static resources (preview, logos, etc.)
\- build/out/dist # Generated artifacts
```

---

## Architecture Overview

See `docs/architecture-overview.md` for a deeper walkthrough of the Electron lifecycle, IPC surface, renderer composition, and data flow between layers. The document is kept alongside this README so the implementation notes evolve with the codebase.

---

## Quick Start

1. Install dependencies: `npm install`
2. Launch the app in development: `npm run dev`
3. Run the renderer preview in a browser-only context: `npm start`
4. Build production assets: `npm run build`
5. Package the desktop app: `npm run build:win` (or `build:mac`, `build:linux`)

All commands assume a recent Node 22 environment. The Electron app automatically seeds sane defaults on first launch.

---

## Scripts & Tooling

| Command | Purpose |
| ------- | ------- |
| `npm run format` | Prettier formatting across the repo |
| `npm run lint` | ESLint with caching |
| `npm run typecheck` | Aggregated TypeScript checks for Node and web |
| `npm test`, `npm run test:watch` | Jest multi-project test runner |
| `npm run db:seed` | Execute `DevelopmentSeeder` via ts-node with path aliases |

---

## Database & Seeding

Set `DB_STORAGE_PATH` to override the default SQLite location (Electron `app.getPath('userData')`). Run `npm run db:seed` to populate the database with roles, users, projects, Kanban boards, notes, comments, and audit logs. Seeders log progress to the console so large batches remain traceable.

---

## Testing Strategy

- Jest multi-project setup covers both Node (main/preload) and jsdom (renderer) environments.
- Testing Library exercises UI components, hooks, and flows relevant to routing and theming.
- ts-jest respects the repo's TypeScript configuration, enabling decorators and module aliases without extra setup.
- Coverage targets `packages/**/*.{ts,tsx}` and seeding modules while excluding generated code and declaration files.

---

## window.api Contract

The preload script exposes a single `window.api` namespace typed in `packages/preload/src/types.ts`. Every action resolves to an `IpcResponse<T>` discriminated union. Available modules include:

- `health.check()`
- `auth.login`, `auth.logout`, `auth.session`, `auth.listUsers`, `auth.createUser`, `auth.updateUser`
- `project.list`, `project.get`, `project.create`, `project.update`, `project.remove`, `project.addMember`, `project.removeMember`
- `task.list`, `task.get`, `task.create`, `task.update`, `task.move`, `task.remove`, `task.listComments`, `task.addComment`, `task.search`
- `note.list`, `note.get`, `note.create`, `note.update`, `note.remove`, `note.attachTask`, `note.detachTask`

Utility helpers unwrap the union inside the renderer and trigger session recovery or logout flows on failure.

---

## Configuration

| Variable | Default | Description |
| -------- | ------- | ----------- |
| `LOG_LEVEL` | `info` | Adjusts the structured logger verbosity |
| `SESSION_TIMEOUT_MINUTES` | `60` | Overrides the default auth session TTL (also persisted in `system_settings`) |
| `DB_STORAGE_PATH` | Electron app data dir | Custom database location for runtime and seeding |
| `ELECTRON_START_URL` | auto | Dev server URL, injected by electron-vite during `npm run dev` |

Use `.env` or per-machine environment variables to customize settings; see `.env.example` for guidance.

---

## Security

- BrowserWindow instances disable `nodeIntegration`, enforce `contextIsolation`, and apply a strict content security policy.
- Navigation and new window requests are denied unless explicitly whitelisted.
- Network access defaults to offline-only with optional localhost allowances in development.
- Session lifecycle management prunes expired tokens on an interval to reduce attack surface.
- Console noise is filtered and re-routed through the structured logger for easier diagnostics.

---

## Troubleshooting

- **Missing `@main/*` imports in scripts**: Always execute CLIs via `npm run` so `tsconfig-paths/register` is loaded.
- **SQLite build issues on Windows**: Install Visual Studio Build Tools with the "Desktop development with C++" workload.
- **Renderer fails to load in dev**: Restart `npm run dev` to refresh the electron-vite dev server and ports.
- **React Router warnings in tests**: Future-facing flags are enabled; re-run tests after clearing Jest cache if warnings persist.

---

## Contributing

1. Clone the repository and install dependencies.
2. Branch off `main` before starting work.
3. Keep imports aligned with the configured path aliases (`@main/*`, `@preload/*`, `@renderer/*`).
4. Add or update tests alongside code changes.
5. Validate with `npm run lint && npm run typecheck && npm test`.

No explicit OSS license is bundled; coordinate internally before distributing binaries.

---

[electron-shield]: https://img.shields.io/badge/electron-38.3-47848f?logo=electron&logoColor=white
[electron-link]: https://www.electronjs.org/
[react-shield]: https://img.shields.io/badge/react-19-61dafb?logo=react&logoColor=white
[react-link]: https://react.dev/
[sqlite-shield]: https://img.shields.io/badge/sqlite-3-blue?logo=sqlite&logoColor=white
[sqlite-link]: https://www.sqlite.org/
[typescript-shield]: https://img.shields.io/badge/typescript-5.7-3178c6?logo=typescript&logoColor=white
[typescript-link]: https://www.typescriptlang.org/
[jest-shield]: https://img.shields.io/badge/tests-jest%2029-99425b?logo=jest&logoColor=white
[jest-link]: https://jestjs.io/
