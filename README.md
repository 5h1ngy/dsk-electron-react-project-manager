# DSK Electron React Project Manager

[![Electron Shield][electron-shield]][electron-link]
[![React Shield][react-shield]][react-link]
[![SQLite Shield][sqlite-shield]][sqlite-link]
[![TypeScript Shield][typescript-shield]][typescript-link]
[![Jest Shield][jest-shield]][jest-link]

![Application preview](assets/preview.png)

>  Modern desktop project manager with a hardened Electron main process, a typed preload bridge, and a polished React/Redux experience (auth, Kanban, dashboards, theming, multilingual UI).

---

##  Table of Contents

1. [ Feature Highlights](#-feature-highlights)
2. [ Tech Stack](#-tech-stack)
3. [ Project Structure](#-project-structure)
4. [ Architecture Overview](#-architecture-overview)
5. [ Quick Start](#-quick-start)
6. [ Scripts & Tooling](#-scripts--tooling)
7. [ Database & Seeding](#-database--seeding)
8. [ Testing Strategy](#-testing-strategy)
9. [ window.api Contract](#-windowapi-contract)
10. [ Configuration](#-configuration)
11. [ Security](#-security)
12. [ Troubleshooting](#-troubleshooting)
13. [ Contributing](#-contributing)

---

##  Feature Highlights

*  **Secure shell** – sandboxed `BrowserWindow`, enforced CSP, blocked navigation, console proxying.
*  **Domain-driven services** – RBAC auth, project/task orchestration, audit logging, Argon2 hashing.
*  **Typed preload bridge** – `window.api` exposes health/auth/project/task IPC with DTO safety.
*  **Rich renderer** – React 19 + Ant Design 5, Redux Toolkit slices, i18next (it/en/de/fr), dynamic theming.
*  **Serious testing** – Jest multi-project (node + jsdom), Testing Library, helper utilities, solid coverage.
*  **Seed everything** – Faker-powered `DevelopmentSeeder` spins realistic roles, users, projects, Kanban tasks.

---

##  Tech Stack

| Layer    | Ingredients                                                                                                          |
| -------- | -------------------------------------------------------------------------------------------------------------------- |
| Runtime  | Electron 38 • Node 22                                                                                                |
| Renderer | React 19 • React Router 6 • Ant Design 5 • Redux Toolkit • React Hook Form • i18next                                 |
| Domain   | SQLite • Sequelize (TypeScript) • Zod • `@node-rs/argon2`                                                            |
| Tooling  | electron-vite • ts-node + tsconfig-paths • Jest + ts-jest • Testing Library • ESLint 9 • Prettier 3 • TypeScript 5.7 |

---

##  Project Structure

```text
dsk-electron-react-project-manager
 packages
   main        # Electron main process (window mgr, services, IPC, Sequelize)
   preload     # Typed context bridge exposing window.api
   renderer    # React/Redux UI, routes, layout, store, theme, i18n
 seeding        # DevelopmentSeeder + CLI entry points
 test           # Jest setup + static mocks
 resources      # Icons/assets for electron-builder
 out | build    # Generated artifacts
 configs        # electron.vite.config.ts, tsconfig.*.json, jest.config.ts, etc.
```

**Path aliases**

| Alias         | Target                    |
| ------------- | ------------------------- |
| `@main/*`     | `packages/main/src/*`     |
| `@preload/*`  | `packages/preload/src/*`  |
| `@renderer/*` | `packages/renderer/src/*` |

 **Note:** `ts-node` CLIs preload `tsconfig-paths/register` so aliases also work outside bundlers.

---

##  Architecture Overview

### Main Process (`packages/main`)

* `appContext.ts` wires session/auth/project/task services and exposes `MainWindowManager`.
* `services/security` enforces CSP, network whitelist, navigation guards, and permission denials.
* `services/{auth,project,task}` encapsulate Zod validation, RBAC, audit trails, Kanban logic.
* `ipc/*` registrars surface a consistent `IpcResponse` envelope to preload consumers.
* `config/database.ts` bootstraps Sequelize and is reused for seeding.
* `config/logger.ts` provides colorized logging plus renderer console forwarding.

### Preload (`packages/preload`)

* `contextBridge.exposeInMainWorld('api', api)` offers a typed API surface (health, auth, project, task).
* `invokeIpc` validates `IpcResponse` payloads before resolving Promises.

### Renderer (`packages/renderer`)

* `main.tsx` loads i18n, fonts, styles, and renders `<App />` within a Redux Provider.
* `App.tsx` orchestrates session restore, accent color injection, theme tokens, and routing.
* `layout/Shell` supplies a collapsible sidebar, header actions, user info, and accent-aware palette.
* `pages` cover login/register (public) plus dashboard, project overview/tasks/board, task details (guarded by `ProtectedRoute` + `useSessionWatcher`).
* Redux slices (`auth`, `locale`, `theme`, `projects`, `tasks`) include selectors, async thunks (IPC calls), helpers, and tests.
* Theme utilities override Ant Design tokens, support accent colors, and respond to light/dark toggles.

### Data & Persistence

* SQLite lives under `%APPDATA%/react-ts/storage/app.sqlite` (or OS equivalents) via `resolveAppStoragePath`.
* `SessionLifecycleManager` loads timeout from env/DB (`auth.sessionTimeoutMinutes`) and prunes sessions every 5 minutes.
* Seeding reuses the same Sequelize models to prevent schema drift.

---

##  Quick Start

### Prerequisites

* Node.js ≥ 20
* npm ≥ 10
* (Windows) Desktop development with C++ workload or comparable build tools (for `sqlite3`)

### Install

```bash
npm install
```

### Develop

```bash
npm run dev       # HMR for main + preload + renderer
npm start         # Preview production build
```

### Build

```bash
npm run build         # Typecheck + electron-vite build
npm run build:unpack  # Build + unpacked dir
npm run build:win     # Windows installer
npm run build:mac     # macOS dmg
npm run build:linux   # Linux AppImage
```

---

##  Scripts & Tooling

| Command                           | Description                                                                                |
| --------------------------------- | ------------------------------------------------------------------------------------------ |
| `npm run lint`                    | ESLint (cached)                                                                            |
| `npm run format`                  | Prettier write                                                                             |
| `npm run typecheck`               | Aggregated TS check (node + web)                                                           |
| `npm test` / `npm run test:watch` | Jest multi-project (main/preload node env, renderer jsdom)                                 |
| `npm run db:seed`                 | `DevelopmentSeeder` via `ts-node --project tsconfig.tools.json -r tsconfig-paths/register` |

---

##  Database & Seeding

Default storage path comes from `app.getPath('userData')`. Override via `DB_STORAGE_PATH` during runtime or seeding:

```bash
DB_STORAGE_PATH="c:/tmp/dsk-app.sqlite" npm run db:seed
```

Seeder output includes base roles, default admin + sample users, projects, tags, Kanban tasks, comments, and audit logs. SQL statements are logged (Sequelize debug) so you can observe what happens.

---

##  Testing Strategy

* **Jest multi-project** – node env for main/preload, jsdom for renderer, both sharing alias mappers.
* **Testing Library** – exercises components (`ThemeControls`, `LanguageSwitcher`, `HealthStatusCard`) and hooks (`useSessionWatcher`).
* **ts-jest** – respects `tsconfig.node.json` / `tsconfig.web.json`, so decorators, paths, and JSX stay in sync.
* Coverage pulls from `packages/**/*.{ts,tsx}` and `seeding/**/*.ts` (excluding entry points, `.d.ts`, and tests).

```bash
npm test
npm run test:watch
```

---

##  window.api Contract

Typed in `packages/preload/src/types.ts` and exposed globally:

* `window.api.health.check() → HealthResponse`
* `window.api.auth.{login, register, logout, session, listUsers, createUser, updateUser}`
* `window.api.project.{list, get, create, update, remove, addMember, removeMember}`
* `window.api.task.{list, get, create, update, move, remove, listComments, addComment, search}`

Every call resolves to `IpcResponse<T>`:

```ts
type IpcResponse<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };
```

Renderer helpers unwrap responses, attach `error.code`, and trigger Redux thunks or logout flows when sessions expire.

---

##  Configuration

| Variable                  | Default         | Purpose                                                             |
| ------------------------- | --------------- | ------------------------------------------------------------------- |
| `LOG_LEVEL`               | `info`          | Controls logger verbosity                                           |
| `SESSION_TIMEOUT_MINUTES` | `60`            | Overrides default session TTL (also stored in DB `system_settings`) |
| `DB_STORAGE_PATH`         | OS app data dir | Override SQLite location                                            |

Create a `.env` (see `.env.example`) to customize logging or storage without touching shell environments.

---

##  Security

*  Sandbox + `contextIsolation` + disabled `nodeIntegration` in `BrowserWindow`.
*  CSP enforces strict `script-src`, `connect-src`, `img-src`, etc., with optional dev allowances.
*  Network blocker only allows offline protocols plus `localhost` when not packaged.
*  Renderer navigation is prevented; `window.open` is denied; permission prompts auto-reject.
*  Console noise (Chromium autofill warnings) is filtered to keep logs readable.

---

##  Troubleshooting

*  **`MODULE_NOT_FOUND` for `@main/*` in ts-node** → run scripts via npm so `tsconfig-paths` is preloaded.
*  **SQLite native build errors (Windows)** → install VS Build Tools / “Desktop development with C++” workload.
*  **Renderer fails to load in dev** → ensure `ELECTRON_RENDERER_URL` is set by electron-vite; restarting `npm run dev` usually fixes stale ports.
*  **React Router warnings in tests** → opt into v7 future flags to silence upcoming behavior changes.

---

##  Contributing

1. Fork & clone, run `npm install`.
2. Use feature branches, keep imports on `@main`, `@preload`, `@renderer`.
3. Add or update tests next to your changes.
4. Validate with `npm run lint && npm run typecheck && npm test`.

No explicit license is bundled yet—decide internally before distributing binaries.

Enjoy shipping 

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
