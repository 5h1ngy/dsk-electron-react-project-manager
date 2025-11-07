## Services & API Refactor Outline

- ### Overview
- Introduce `packages/shared` as the shared domain layer housing database orchestration, Sequelize models, and business services.
- Keep `packages/electron/src/main` focused purely on Electron concerns (app lifecycle, window & IPC wiring, security hooks) while delegating domain work to the shared package.
- Add `packages/api` exposing the same domain through an HTTP interface built with decorator-driven controllers.

### packages/shared
- `config/`: typed environment access, structured logger, storage-path resolver, and database bootstrap logic.
- `database/`: entry-points (`initializeDatabase`, `DatabaseManager`) and helper contracts.
- `models/`: Sequelize models formerly under `packages/electron/src/main/models`.
- `services/`: domain services (auth, projects, tasks, notes, wiki, sprints, roles, time-tracking, reporting, etc.) plus DTOs/schemas.
- `runtime/`: factories and registries used to instantiate domain services for Electron or API callers (`createDomainContext`, teardown helpers).
- Lightweight exports in `src/index.ts` re-export all shared types/APIs for consumers.

### packages/electron (Electron runtime)
- Retain Electron-specific bootstrapping, window management, IPC registrars, and security hardening.
- Replace direct imports of models/services/config with `@services/*` (pointing at `packages/shared`) equivalents.
- Compose the shared domain context through the services package, keeping session management and audit logging centralized.
- Structure the sources under `packages/electron/src/{main,preload,renderer}` so that bundlers and tsconfig aliases have a single root.

### packages/api (Backend)
- `controllers/`: decorator-based `routing-controllers` HTTP endpoints for auth, projects, tasks, notes, wiki, and admin operations.
- `middlewares/`: auth/session guards mapping bearer tokens to domain actors.
- `startup/`: domain context bootstrap, database initialization, and Express server wiring.
- `server.ts`: CLI entry-point supporting standalone backend execution.
- Renderer fallback wiring automatically hydrates `window.api` via HTTP when the Electron preload bridge is absent, allowing the SPA build to target the REST API seamlessly.

### Tooling & Scripts
- Extend TypeScript path aliases and Jest module mapping to include `@services/*` (-> `packages/shared/src`) and `@api/*`.
- Add npm scripts for `dev:electron`, `dev:frontend`, `dev:api`, plus `build:electron`, `build:frontend`, `build:api`.
- Provide a `docker-compose.yml` that runs frontend (Vite preview) and backend (API server) together on localhost.

### Launch Modes
- **Electron**: Continue using `npm run dev:electron` for the offline desktop app.
- **Backend**: `npm run dev:api` runs the decorator-driven server with live reload (ts-node/tsx).
- **Frontend**: `npm run dev:frontend` launches the renderer in browser-only mode.
- **Combined**: `docker-compose up` to spin up API + frontend for web deployments or companion services.
