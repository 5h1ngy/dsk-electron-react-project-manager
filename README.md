<div align="center">

# DSK Project Manager

[![License][license-badge]][license-link]
[![Node][node-badge]][node-link]
[![Electron][electron-badge]][electron-link]
[![React][react-badge]][react-link]
[![SQLite][sqlite-badge]][sqlite-link]

Offline‑friendly project management suite that bundles an Electron desktop shell, a standalone web SPA, and a typed REST API powered by SQLite.

![Application preview](.assets/preview.png)

</div>

---

## 📚 Table of Contents

1. [About the Product](#-about-the-product)
2. [Architecture at a Glance](#-architecture-at-a-glance)
3. [Workspace Breakdown](#-workspace-breakdown)
4. [Feature Highlights](#-feature-highlights)
5. [Developer Experience](#-developer-experience)
6. [Getting Started](#-getting-started)
7. [Scripts & Automation](#-scripts--automation)
8. [Configuration & Environment](#-configuration--environment)
9. [Data & Seeding](#-data--seeding)
10. [Testing & Quality](#-testing--quality)
11. [Docker Workflow](#-docker-workflow)
12. [Logging & Monitoring](#-logging--monitoring)
13. [Versioning & Releases](#-versioning--releases)
14. [License](#-license)

---

## 🧭 About the Product

DSK Project Manager centralizes day‑to‑day delivery activities (projects, tasks, wikis, notes, sprints, and role management) in a single workspace that can run completely offline.  
Key capabilities:

- **Secure desktop client** with Electron 38, single instance lock, hardened preload, and sandboxed renderer.
- **Web SPA** powered by React 19 + Ant Design 5 for teams that prefer running in the browser.
- **REST API** built with routing-controllers/Typedi, backed by SQLite and Sequelize with audit trails.
- **Shared domain layer** so business rules, DTOs, and services stay consistent across surfaces.
- **Seed & maintenance tools** that bootstrap demo data and run integrity checks in one command.

---

## 🏗 Architecture at a Glance

```
┌──────────────────────────┐
|  Electron Shell (Node)   |
|  packages/electron       |
|  • main process          |
|  • preload bridge        |
└────────────┬─────────────┘
             │ IPC / window.api
┌────────────▼─────────────┐
|  React Renderer          |
|  packages/frontend       |
|  • Ant Design UI         |
|  • Redux Toolkit store   |
└────────────┬─────────────┘
             │ HTTP / REST
┌────────────▼─────────────┐
|  Backend API (Node 22)   |
|  packages/backend        |
|  • routing-controllers   |
|  • Typedi DI             |
└────────────┬─────────────┘
             │ ORM
┌────────────▼─────────────┐
|  Shared Domain Layer     |
|  packages/shared         |
|  • Sequelize models      |
|  • Auth, audit, wiki     |
└────────────┬─────────────┘
             │ SQLite
       ┌─────▼─────┐
       | Storage   |
       | app.sqlite|
       └───────────┘
```

Additional packages:

| Package          | Role |
| ---------------- | ---- |
| `packages/seeding` | Faker-based seed orchestration and database maintenance utilities. |
| `scripts/*` | Support scripts (`versioning.mjs`, postinstall tasks, etc.). |
| `.assets/` | Static imagery for documentation and product previews. |

---

## ✨ Feature Highlights

- **Authentication & Role Management** – Admin-maintained roles (Admin, Maintainer, Contributor, Viewer) with audit trails.
- **Projects & Tasks** – Backlog, sprints, kanban lanes, saved views, and status automation.
- **Notes & Wikis** – Markdown editing with preview, search via FTS, and revision history.
- **Dashboards** – Cross-project overview, user analytics, filters, and saved board configurations.
- **Seed & Demo Data** – Deterministic Faker-based seeding for fast onboarding.
- **REST Documentation** – Automatic OpenAPI spec + Swagger UI at `/docs`.
- **Configurable Runtime** – Desktop, webapp, and backend each read dedicated env manifests from `env/`.

---

## 🛠 Developer Experience

- **Monorepo with shared tooling** – Single ESLint/Prettier/Jest configs at repo root plus TS project references.
- **electron-vite** – Unified build pipeline for Electron main, preload, and renderer processes.
- **Typed IPC bridge** – `window.api` surface validated in preload with runtime-safe contracts.
- **Structured logging** – Colorized console output plus optional file sink when `LOG_STORAGE_PATH` is provided.
- **Dockerized pipelines** – Separate builder/runtime stages for backend & frontend with curated dependency manifests.
- **Scripts for everything** – Formatting, linting, seeding, type checks, packaging, and clean-up (`npm run reset:build`).

---

## 🚀 Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Launch the desktop app**
   ```bash
   npm run dev:electron
   ```
3. **Run backend API only**
   ```bash
   npm run dev:backend
   ```
4. **Run web SPA**
   ```bash
   npm run dev:frontend
   ```
5. **Build artifacts**
   ```bash
    # Electron portable build (goes to dist/)
    npm run build:electron

    # Backend transpiled output (out/backend)
    npm run build:backend

    # SPA static bundle (out/renderer-web)
    npm run build:frontend
   ```
6. **Package Windows installer/portable**
   ```bash
   npm run build:win
   ```

> ℹ️ ENV files live under `env/`. Copy/adjust the appropriate `.env.*` file (`desktop`, `webapp`, `backend`) before running each surface to override ports, base paths, or logging destinations.

---

## 🤖 Scripts & Automation

| Command | Purpose |
| ------ | ------- |
| `npm run format` / `format:*` | Prettier formatting per workspace. |
| `npm run lint` / `lint:*` | ESLint across electron, frontend, backend, shared, seeding. |
| `npm run test:*` | Jest projects per workspace (JS DOM env where needed). |
| `npm run typecheck` | Validates Electron TS configs (node + web). |
| `npm run reset:build` | Removes `dist/` and `out/` via `rimraf`. |
| `npm run build:*` | Builds each surface (electron, backend, frontend). |
| `npm run dev:*` | Development watchers for each runtime. |
| `npm run db:seed` / `db:seed:backend` | Runs seeding pipeline via shared services. |
| `npm run version:bump` | Interactive semver bump via `scripts/versioning.mjs` (includes env/version badge updates). |

---

## ⚙ Configuration & Environment

- All runtime configs live in `env/` (dev/prod variants for desktop, webapp, backend).  
- Shared keys:
  - `LOG_LEVEL`, `LOG_STORAGE_PATH`
  - `APP_VERSION`, `APP_RUNTIME`, `VITE_APP_RUNTIME`
  - Backend-specific: `API_PORT`, `DB_STORAGE_PATH`, `SEED_BACKEND_PORT`
  - Web-specific: `VITE_API_BASE_URL`, `PUBLIC_BASE`, `VITE_PUBLIC_BASE`
- `LOG_STORAGE_PATH` enables file-based logging; directories are auto-created.
- `.env.example` documents every supported variable for quick reference.

---

## 🗄 Data & Seeding

- SQLite lives at `out/storage/backend/app.sqlite` by default (or `/data/app.sqlite` in Docker).  
- Seeding commands:
  ```bash
  npm run db:seed            # desktop/web combined context
  npm run db:seed:backend    # uses backend env + port overrides
  ```
- `packages/seeding` contains Faker-driven factories plus database maintenance utilities that ensure schema upgrades (FTS indexes, missing columns, etc.).

---

## 🧪 Testing & Quality

- **Jest multi-project config** (`jest.config.ts`) with dedicated projects for electron, frontend, backend, shared, and seeding.
- **Testing Library + React Testing Library** for renderer surfaces.
- **ts-jest** enables type-aware backend/electron tests.
- **ESLint 9 flat config** + Prettier 3 for consistent code style.
- `npm run lint`, `npm run test`, and `npm run typecheck` should pass before opening a PR.

---

## 🐳 Docker Workflow

- `docker/frontend.Dockerfile` – multi-stage build (Node builder ➜ nginx runtime).  
  Uses `docker/frontend.dev.package.json` for lean dependency installs.
- `docker/backend.Dockerfile` – builder (installs dev deps, compiles TS) ➜ runtime (installs prod deps, runs API).  
  Reads `LOG_STORAGE_PATH`, `API_PORT`, etc. from mounted env files.
- `docker-compose.yml` orchestrates `frontend` + `backend` services with shared volume `backend-data` for SQLite persistence.  
- Copy env files into the `env/` folder (already part of the repo); adjust `HOST_API_PORT`/`API_PORT`/`PUBLIC_BASE` to host the SPA under sub-paths.

---

## 📜 Logging & Monitoring

- Central logger lives in `packages/shared/src/config/logger.ts`.
- By default logs go to stdout with colored context tags.  
- If `LOG_STORAGE_PATH` is set (e.g., `out/logs/backend-dev.log` or `/data/logs/backend.log`), logs are additionally persisted to disk.
- Request middleware (`packages/backend/src/middleware/requestLogger.ts`) records method, path, auth snapshot, query/body payload (with sensitive keys redacted), latency, and user roles for every HTTP call.

---

## 🪄 Versioning & Releases

- `scripts/versioning.mjs` enforces semver bumps, updates `package.json`, `package-lock.json`, README badges, and every `.env*` file’s `APP_VERSION`, then stages + commits with `chore: bump version to x.y.z`.
- Electron packaging uses `packages/electron/electron-builder.yml`, outputting to `dist/`.
- Portable artifacts carry custom icons from `.assets` / `packages/electron/build`.

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

### Reference Links

[license-badge]: https://img.shields.io/badge/License-MIT-2ea44f.svg
[license-link]: LICENSE
[node-badge]: https://img.shields.io/badge/Node-22.x-43853d?logo=node.js&logoColor=white
[node-link]: https://nodejs.org/
[electron-badge]: https://img.shields.io/badge/Electron-38-47848f?logo=electron&logoColor=white
[electron-link]: https://www.electronjs.org/
[react-badge]: https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black
[react-link]: https://react.dev/
[sqlite-badge]: https://img.shields.io/badge/SQLite-3-003b57?logo=sqlite&logoColor=white
[sqlite-link]: https://www.sqlite.org/
