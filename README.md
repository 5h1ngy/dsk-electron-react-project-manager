<div align="center">

# DSK Project Manager

[![License][license-badge]][license-link]
[![Node][node-badge]][node-link]
[![Electron][electron-badge]][electron-link]
[![React][react-badge]][react-link]
[![SQLite][sqlite-badge]][sqlite-link]

Suite di project management offline-friendly che combina una shell Electron, una SPA React/Vite e un'API REST tipizzata su SQLite.

![Application preview](.assets/preview.png)

</div>

---

## Indice

1. [Perche DSK Project Manager](#perche-dsk-project-manager)
2. [Stack tecnologico](#stack-tecnologico)
3. [Repository cheat-sheet](#repository-cheat-sheet)
4. [Architettura](#architettura)
5. [Feature map](#feature-map)
6. [Pacchetti e moduli](#pacchetti-e-moduli)
7. [Modello dati](#modello-dati)
8. [Configurazione & ambienti](#configurazione--ambienti)
9. [Setup rapido](#setup-rapido)
10. [Testing & qualita](#testing--qualita)
11. [Database, seeding & manutenzione](#database-seeding--manutenzione)
12. [Desktop runtime (Electron)](#desktop-runtime-electron)
13. [Web SPA (React)](#web-spa-react)
14. [Backend API](#backend-api)
15. [Docker & distribuzione](#docker--distribuzione)
16. [Script & automazione](#script--automazione)
17. [Documentazione & risorse](#documentazione--risorse)
18. [Contributi & CI](#contributi--ci)
19. [Licenza](#licenza)

---

## Perche DSK Project Manager

- **Un'unica fonte di verita**: il dominio condiviso (`packages/shared/src`) contiene modelli Sequelize, servizi (project, task, wiki, note, roles, sprint, view) e infrastruttura (logger, env, storage) riutilizzati da Electron, dall'API e dallo strato di seeding.
- **Esperienza completamente offline**: l'app desktop (`packages/electron/src/main/index.ts`) gestisce storage SQLite locale, backup crittografati e ripristino senza dipendenze esterne.
- **Modalita web**: la SPA (`packages/frontend/src`) puo funzionare standalone contro l'API (`packages/backend/src/server.ts`) grazie al bridge HTTP (`packages/frontend/src/platform/httpBridge.ts`).
- **Sicurezza by design**: controllo ruoli/permessi (`packages/shared/src/services/roles/constants.ts` + `docs/roles.md`), sessioni in memoria (`packages/shared/src/services/auth/sessionManager.ts`), guardie IPC, CSP e network blocker (`packages/electron/src/main/services/security/index.ts`).
- **Osservabilita e auditing**: `packages/backend/src/middleware/requestLogger.ts` e `packages/shared/src/services/audit/index.ts` registrano chi fa cosa, mentre `packages/shared/src/config/logger.ts` gestisce output su stdout/file.
- **Documentazione interna**: l'albero completo del repo e' rigenerabile con `scripts/repotree.mjs`, producendo `docs/repo-tree.md`, `docs/big-files.txt` e `docs/notes-todos.txt` per avere sempre visibilita dei file dichiarati.

---

## Stack tecnologico

| Livello | Tecnologie | File chiave |
| --- | --- | --- |
| Desktop | Electron 38, electron-vite, electron-builder, Node 22 | `packages/electron/electron.vite.config.ts`, `packages/electron/src/main/index.ts`, `packages/electron/electron-builder.yml` |
| Renderer | React 19, Vite 7, Ant Design 5, Redux Toolkit, React Hook Form, i18next | `packages/frontend/vite.config.ts`, `packages/frontend/src/App.tsx`, `packages/frontend/src/store` |
| Backend | Node 22, routing-controllers, Typedi, Sequelize + SQLite, Swagger/OpenAPI | `packages/backend/src/server.ts`, `packages/backend/src/controllers`, `packages/backend/src/openapi/schemas.ts` |
| Dominio condiviso | Sequelize models, services (project/task/note/wiki/view/roles), logger, env, AES-GCM backup | `packages/shared/src/models`, `packages/shared/src/services`, `packages/shared/src/config` |
| Tooling | Jest multi-project, ESLint 9 (flat), Prettier 3, Faker seeding, docker-compose | `jest.config.ts`, `eslint.config.mjs`, `packages/seeding/src`, `docker/` |

---

## Repository cheat-sheet

- `docs/repo-tree.md` (generato da `node scripts/repotree.mjs`, invocabile anche via `npm run autodocs`) elenca **ogni** file della repo: consultalo quando servono percorsi completi.
- `docs/big-files.txt` e `docs/notes-todos.txt` vengono prodotti dallo stesso script per monitorare file pesanti e TODO/FIXME sparsi.

### Directory principali

| Path | Contenuti | Dettagli |
| --- | --- | --- |
| `.assets/` | Immagini e icone per README/app | `preview.png` viene referenziato nel banner iniziale. |
| `.extensions/` | Risorse extra (es. Redux DevTools CRX) | Caricate dal preload quando necessario. |
| `.github/` | Workflow CI (`branch-policy.yml`, `release.yml`) | Controllano naming branches e build/release Windows. |
| `.husky/` | Hook Git (commit-msg) | Esegue `commitlint` per enforcement convenzioni. |
| `.vscode/` | Settings & snippets locali | Non obbligatori ma utili per uniformare editor. |
| `dist/` | Output electron-builder (`win-unpacked`, portable `.exe`) | Generato da `npm run build:win`. |
| `docker/` | Dockerfile multi-stage + manifest package ridotti | `backend.package.*.json` e `frontend.package.*.json` minimizzano dipendenze. |
| `docs/` | `repo-tree.md`, `roles.md` | Documentazione funzionamento ruoli e mappa repo. |
| `env/` | `.env.*` per desktop, webapp, backend, esempio | Copiare/derivare da `.env.example`. |
| `out/` | Build intermedie (backend/main/preload/renderer) | Popolato da electron-vite / tsc. |
| `packages/backend/` | API REST (controllers, middleware, startup) | Compilata via `ts-node`/`tsc`. |
| `packages/electron/` | Main process, preload bridge, builder config | Contiene `src/main`, `src/preload`, `resources`, `build`. |
| `packages/frontend/` | SPA React + store, layout, pagine | Includono route protette e pagina di manutenzione DB. |
| `packages/seeding/` | Seeder Faker, CLI (`run.ts`), factory e config | Usato sia localmente sia via endpoint `/seed`. |
| `packages/shared/` | Modelli Sequelize, servizi dominio, logger/env/storage | Cuore logico riutilizzato ovunque. |
| `preview/` | Mini-sito Vite per marketing/demo UI | Script `npm run dev/build/preview` dedicati. |
| `public/` | Asset statici Vite (`favicon.ico`) | Serviti dalla SPA. |
| `scripts/` | `repotree.mjs`, `versioning.mjs`, `postinstall.mjs` | Automazioni documentate piu avanti. |
| `temp_featureOrbit.txt` | Note temporanee del team | Lasciare intatto finche non viene integrato nel flusso ufficiale. |

---

## Architettura

```
+-----------------------------+
| Electron Shell              |
| packages/electron           |
|  - main process + IPC       |
|  - preload sandboxed API    |
+--------------+--------------+
               | window.api / IPC
+--------------v--------------+
| React Renderer (desktop/web)|
| packages/frontend           |
|  - Ant Design + Redux       |
|  - Routing / i18n           |
+--------------+--------------+
               | REST / IPC bridge
+--------------v--------------+
| Backend API (Node 22)       |
| packages/backend            |
|  - routing-controllers      |
|  - Typedi DI                |
+--------------+--------------+
               | Sequelize models
+--------------v--------------+
| Shared Domain + SQLite      |
| packages/shared             |
|  - models/services/logger   |
|  - AES-GCM backup + seeding |
+-----------------------------+
```

- La sessione utente vive in `SessionManager` (`packages/shared/src/services/auth/sessionManager.ts`) e viene propagata ai servizi via IPC/REST.
- Le API espongono documentazione OpenAPI (`/docs`, generata in `packages/backend/src/server.ts`).
- La pagina **Database** del renderer parla con `DatabaseMaintenanceService` (`packages/shared/src/services/databaseMaintenance/index.ts`) tramite canale IPC dedicato (`packages/electron/src/main/ipc/database`).

---

## Feature map

- **Autenticazione e ruoli**: login/register/logout, gestione utenti e ruoli (controller `packages/backend/src/controllers/AuthController.ts` + `RoleController.ts`, servizio `packages/shared/src/services/auth/index.ts`). Permessi e ruoli di default documentati in `docs/roles.md`.
- **Gestione progetti**: CRUD progetti, membership, tag (`packages/shared/src/services/project`). Task board con stati ordinabili (`packages/shared/src/services/task.ts`, `packages/shared/src/services/taskStatus`). Sprints e backlog (`packages/shared/src/services/sprint`).
- **Note & Wiki**: note Markdown con FTS (`packages/shared/src/services/note`) e wiki con revisioni (`packages/shared/src/services/wiki`). UI dedicate sotto `packages/frontend/src/pages/ProjectNotes` e `ProjectWiki`.
- **Views & dashboard**: salvataggio viste filtrate (`packages/shared/src/services/view`) + pagina dashboard (`packages/frontend/src/pages/Dashboard`).
- **Database maintenance**: export/import cifrati (AES-256-GCM + scrypt + gzip) e riavvio controllato (`packages/shared/src/services/databaseMaintenance/index.ts` + UI `packages/frontend/src/pages/Database/DatabasePage.tsx`).
- **Audit trail**: `packages/shared/src/services/audit/index.ts` registra ogni mutazione, mentre i servizi dominio invocano direttamente `AuditService`.
- **Internationalization**: localizzazioni `en`, `it`, `fr`, `de` (`packages/frontend/src/i18n/locales`), rilevate all'avvio e commutabili da UI.

---

## Pacchetti e moduli

### `packages/electron`

- `src/main/index.ts`: orchestration principale (single-instance lock, hook app, session lifecycle, boot DB via `initializeDatabase`).
- `src/main/appContext.ts`: factory per servizi dominio (Project/Task/...).
- `src/main/services/security/index.ts`: CSP, blocco navigazione, disabilitazione DevTools quando `ENABLE_DEVTOOLS=false`.
- `src/main/ipc/*`: registrar per auth, project, task, status, note, view, role, sprint, wiki, database.
- `src/preload/src/index.ts`: espone `window.api` e `window.devtoolsConfig`, incapsulando tutte le API tipizzate definite in `src/preload/src/types.ts`.
- `src/preload/src/api/*.ts`: wrapper IPC lato renderer.
- `electron.vite.config.ts`, `tsconfig.*`, `electron-builder.yml`: toolchain build e packaging.

### `packages/frontend`

- `src/App.tsx`: bootstrap Ant Design, router, sincronizzatori di tema/scrollbar, restore session.
- `src/pages/*`: dashboard, login/register, projects overview/tasks/details, sprints, wiki, notes, role management, user management, settings, database maintenance.
- `src/pages/routes.tsx` + `ProtectedRoute.tsx`/`PublicRoute.tsx`: gating basato su auth.
- `src/store`: Redux Toolkit store + slice per `auth`, `projects`, `tasks`, `taskStatuses`, `notes`, `views`, `sprints`, `wiki`, `locale`, `theme`.
- `src/platform/httpBridge.ts`: fallback HTTP per runtime web (`runtime.isWebapp`).
- `src/layout/Shell`: container comune.
- `src/theme`: generatori token Ant Design e accent chooser.
- `test/`: setup Testing Library (`packages/frontend/test/setupRendererTests.ts`).

### `packages/backend`

- `src/server.ts`: crea Express server via routing-controllers, monta swagger (`/docs`), registra middleware custom (request logger + error handler).
- Controllers: `AuthController`, `ProjectController`, `TaskController`, `TaskStatusController`, `NoteController`, `ViewController`, `RoleController`, `SprintController`, `WikiController`, `SeedController`, `HealthController`.
- Middleware: `packages/backend/src/middleware/requestLogger.ts`, `AppErrorHandler` (`packages/backend/src/middleware/errorHandler.ts`).
- `openapi/`: helper per decoratori + definizioni Zod (`apiRegistry`).
- `startup/bootstrap.ts` + `startup/context.ts`: inizializzazione DomainContext (Typedi) e shutdown hook.

### `packages/shared`

- `config/`: env loader (`env.ts`), logger (`logger.ts`), database bootstrap (`database.ts`), storage path resolver (`storagePath.ts`), error helper (`appError.ts`).
- `models/`: tutte le entita Sequelize (tabella completa nella sezione [Modello dati](#modello-dati)).
- `services/`: moduli per audit, auth, project, task, taskStatus, note, view, wiki, roles, sprint, databaseMaintenance.
- `runtime/domainContext.ts`: container unico per servizi condivisi.

### `packages/seeding`

- `run.ts`: CLI entrypoint (`SeedCommand`, supporto a `--host/--port` per trigger remoto).
- `DevelopmentSeeder.ts`: orchestrazione Faker (seed configurabile, upsert utenti/progetti/notes/wiki/sprints).
- `ProjectSeedFactory.ts`, `UserSeedFactory.ts`, `ProjectSeeder.ts`, `UserSeeder.ts`: logica di generazione e persistenza.
- `seedConfig.ts` + `seed-config.json`: parametri (tassi di generazione per commenti, note, wiki, sprints).

### Altre cartelle rilevanti

- `preview/`: micro-sito React/GSAP per presentazioni (non incluso nel build principale).
- `scripts/`: `repotree.mjs` (autodoc repo), `versioning.mjs` (bump semver + commit), `postinstall.mjs` (wrappa `electron-builder install-app-deps` evitando recursion).
- `.extensions/redux-devtools`: CRX utilizzata per sviluppi offline.
- `.husky/commit-msg`: richiama `npx commitlint --edit`.
- `.github/workflows`: branch policy (prefissi `release/*`, `hotfix/*`, `feature/*`, `bugfix/*`, `fix/*`) e pipeline release Windows.
- `temp_featureOrbit.txt`: brainstorming/notes, non eliminare senza allinearsi col team.

---

## Modello dati

| Modello | File | Descrizione |
| --- | --- | --- |
| `SystemSetting` | `packages/shared/src/models/SystemSetting.ts` | Chiave/valore configurabili (es. timeout sessione) letti dal main process. |
| `Role` | `packages/shared/src/models/Role.ts` | Ruoli globali con JSON di permessi normalizzati. |
| `User` | `packages/shared/src/models/User.ts` | Utenti, password Argon2 (`packages/shared/src/services/auth/password.ts`), stato attivo, metadata login. |
| `UserRole` | `packages/shared/src/models/UserRole.ts` | Tabella ponte utenti-ruoli. |
| `AuditLog` | `packages/shared/src/models/AuditLog.ts` | Storico operazioni con payload diff JSON. |
| `Project` | `packages/shared/src/models/Project.ts` | Progetti, owner, tag, impostazioni flusso. |
| `ProjectMember` | `packages/shared/src/models/ProjectMember.ts` | Ruolo per progetto (`view/edit/admin`). |
| `ProjectTag` | `packages/shared/src/models/ProjectTag.ts` | Tag classificazione progetti. |
| `Sprint` | `packages/shared/src/models/Sprint.ts` | Iterazioni con data inizio/fine, stato. |
| `TaskStatus` | `packages/shared/src/models/TaskStatus.ts` | Colonne kanban (default `todo/in_progress/blocked/done`). |
| `Task` | `packages/shared/src/models/Task.ts` | Task con owner/assignee, sprint, FTS (`tasks_fts`) e storia commenti. |
| `Comment` | `packages/shared/src/models/Comment.ts` | Commenti task, autore, timestamps. |
| `Note` | `packages/shared/src/models/Note.ts` | Note Markdown, relazioni tag/task, FTS `notes_fts`. |
| `NoteTag` | `packages/shared/src/models/NoteTag.ts` | Tagging note. |
| `NoteTaskLink` | `packages/shared/src/models/NoteTaskLink.ts` | Link note-task. |
| `View` | `packages/shared/src/models/View.ts` | Salvataggio filtri/visti e sharing flag. |
| `WikiPage` | `packages/shared/src/models/WikiPage.ts` | Pagine wiki per progetto. |
| `WikiRevision` | `packages/shared/src/models/WikiRevision.ts` | Versioni storiche wiki restore-able. |

`packages/shared/src/config/database.ts` sincronizza gli schemi, abilita WAL, FK, crea ruoli e admin di default e garantisce infrastruttura FTS per task/notes.

---

## Configurazione & ambienti

- **Env files** (`env/.env.*`):
  - `.env.desktop.dev|prod`: toggles per Electron (`LOG_LEVEL`, `LOG_STORAGE_PATH`, `ENABLE_DEVTOOLS`, `APP_RUNTIME=desktop`).
  - `.env.webapp.dev|prod`: Vite (`VITE_APP_RUNTIME`, `VITE_API_BASE_URL`, `API_PROXY_TARGET`, `ENABLE_DEVTOOLS`).
  - `.env.backend.dev|prod`: API (`API_PORT`, `SEED_BACKEND_PORT`, `DB_STORAGE_PATH`, `APP_RUNTIME=webapp`).
  - `.env.example`: reference generale, include `HOST_API_PORT`/`API_PORT` per docker compose.
- **Variabili chiave**:
  - `LOG_LEVEL`, `LOG_STORAGE_PATH`: gestiscono logger (`packages/shared/src/config/logger.ts`).
  - `APP_RUNTIME` / `VITE_APP_RUNTIME`: distinguono desktop/webapp (`packages/frontend/src/config/runtime.ts`).
  - `ENABLE_DEVTOOLS`: abilita scorciatoie DevTools in preload/renderer (`packages/electron/src/preload/src/index.ts`, `MainWindowManager`).
  - `API_PROXY_TARGET`, `VITE_API_BASE_URL`, `PUBLIC_BASE`: configurano host SPA e proxy.
  - `API_PORT` / `HOST_API_PORT`: espongono backend in locale/Docker.
  - `DB_STORAGE_PATH`: override percorso SQLite (altrimenti calcolato da `StoragePathResolver`, `packages/shared/src/config/storagePath.ts`).
  - `SEED_BACKEND_PORT`, `SEED_BACKEND_HOST`: necessari per `npm run db:seed:backend` o `SeedCommand` remoto.
- **Module alias** (`package.json::_moduleAliases`): `@backend`, `@services`, `@main`, `@preload`, `@renderer`, `@seeding`.
- **Logging**: definire `LOG_STORAGE_PATH` per scrivere su file (es. `out/logs/backend-dev.log`).

---

## Setup rapido

1. **Prerequisiti**: Node 22.x, npm 10+, SQLite installato (solo per CLI). Windows/macOS/Linux supportati (Electron builder gia configurato per win).
2. **Installazione**:
   ```bash
   npm install
   cp env/.env.example env/.env.desktop.dev   # adatta ai vari target
   ```
3. **Dev servers**:
   - Desktop: `npm run dev:electron` (usa `.env.desktop.dev`, avvia electron-vite con main/preload/renderer).
   - Backend: `npm run dev:backend` (ts-node, alias registrati, porta definita da `API_PORT`).
   - Web SPA: `npm run dev:frontend` (Vite + proxy API).
4. **Seed dati**:
   - Locale/offline (stesso DB usato da Electron): `npm run db:seed` (usa `.env.desktop` e `packages/seeding/src/run.ts`).
   - Backend remoto (API REST in esecuzione): `npm run db:seed:backend -- --port 4000`.
5. **Build**:
   - `npm run build:frontend` / `npm run build:backend`.
   - `npm run build:win` (typecheck + electron-vite build + electron-builder).
6. **Utility**:
   - `npm run reset:build` per pulire `dist` e `out`.

---

## Testing & qualita

- **Jest multi-project** (`jest.config.ts`):
  - `frontend` (jsdom, Testing Library), `backend`, `shared`, `seeding`, `electron`.
  - Coverage target globale per electron `statements>=80%`, `branches>=70%`, `functions>=80%`, `lines>=80%`.
- **Comandi**:
  - `npm run test` (tutti i progetti) o `npm run test -- --selectProjects frontend`.
  - `npm run lint` / `npm run lint:fix`.
  - `npm run format` (Prettier su electron/frontend/backend/shared/seeding).
  - `npm run typecheck`, `npm run typecheck:node`, `npm run typecheck:web`.
- **Dev workflow**:
  - Husky (`.husky/commit-msg`) forza `commitlint`.
  - Branch policy enforced da `.github/workflows/branch-policy.yml` (prefissi obbligatori).
  - Prima di aprire una PR: lint + test + typecheck devono passare e, per feature visibili, rigenerare `docs/repo-tree.md` con `node scripts/repotree.mjs`.

---

## Database, seeding & manutenzione

- **Inizializzazione**: `DatabaseManager` (`packages/shared/src/config/database.ts`) crea cartella storage, abilita WAL, FK, semina ruoli default e admin `admin/changeme!`, garantisce colonne/indici mancanti (es. `sprintId` su tasks).
- **Seed**:
  - `DevelopmentSeeder` (`packages/seeding/src/DevelopmentSeeder.ts`): Faker con seed deterministico, upsert utenti (via `UserSeeder`) e progetti completi (task, commenti, note, wiki, sprint). Configurazioni in `seed-config.json`.
  - Endpoint `/seed` (`packages/backend/src/controllers/SeedController.ts`) richiama lo stesso seeder dentro l'API (utile per ambienti remoti).
- **Backup & ripristino**:
  - `DatabaseMaintenanceService` (`packages/shared/src/services/databaseMaintenance/index.ts`) esporta snapshot in JSON compresso + cifrato (AES-256-GCM, chiave derivata via scrypt).
  - UI in `packages/frontend/src/pages/Database/DatabasePage.tsx`: form per export/import password-protected e richiesta riavvio controllata (solo Admin).
  - Restart orchestrato via `DatabaseIpcRegistrar`/`MainProcessApplication`.
- **Session timeout dinamico**: `SessionLifecycleManager` (`packages/electron/src/main/index.ts`) legge `SystemSetting` `auth.sessionTimeoutMinutes` (o `SESSION_TIMEOUT_MINUTES` env) e pulisce sessioni ogni 5 minuti.

---

## Desktop runtime (Electron)

- `MainProcessApplication` (`packages/electron/src/main/index.ts`) gestisce lifecycle app, handshake DB, registrazione IPC e avvio finestra (con opzioni in `MAIN_WINDOW_OPTIONS`).
- `MainWindowManager` (`packages/electron/src/main/appContext.ts`) controlla preload, showing, forwarding console, auto-hide DevTools, icone (da `resources/icon.png`).
- Sicurezza: `registerSecurityHooks` applica CSP, blocca navigation/will-navigate, nega window.open, filtra richieste di rete non locali quando packaged.
- IPC: registrars in `packages/electron/src/main/ipc/*` eseguono autorizzazione (AuthService) e inoltrano alle service class condivise.
- Preload API: `packages/electron/src/preload/src/index.ts` + `types.ts` definiscono contratti e gestiscono flag `devtoolsConfig`.
- Logging: `shouldSuppressDevtoolsMessage` filtra rumore `Autofill` per mantenere console pulita.

---

## Web SPA (React)

- Router hash-based (`HashRouter`) per compatibilita con electron e hosting statico (`packages/frontend/src/App.tsx`).
- Stato globale: Redux Toolkit store (`packages/frontend/src/store/setupStore.ts`) con slice verticali e thunk che chiamano `window.api` o `httpBridge`.
- UI:
  - Layout shell (`packages/frontend/src/layout`) con header, breadcrumb e portal per azioni contestuali.
  - Themes dinamici + accent color (`packages/frontend/src/theme`).
  - Componenti modulare (es. `ShellHeaderPortal`, `hooks/useBreadcrumbStyle`).
- Feature pages:
  - `Pages/Projects`, `ProjectTasks`, `TaskDetails`, `ProjectSprints`, `ProjectNotes`, `ProjectWiki`, `RoleManagement`, `UserManagement`, `Settings`, `Database`.
  - `ProtectedRoute`/`PublicRoute` gestiscono accesso in base a login e session token.
- Internazionalizzazione: `packages/frontend/src/i18n/config.ts` + `locales/{en,it,fr,de}`.

---

## Backend API

- Routing basato su decoratori (`routing-controllers`):
  - `AuthController`: login/logout/register, CRUD utenti, session introspection.
  - `ProjectController`: CRUD progetti/membri.
  - `TaskController` + `TaskStatusController`: gestione tasks, commenti, move, reorder lanes.
  - `NoteController`, `WikiController`, `ViewController`.
  - `RoleController`: CRUD ruoli + sync default.
  - `SprintController`, `SeedController`, `HealthController`.
- `RequestLoggingMiddleware` (`packages/backend/src/middleware/requestLogger.ts`): log JSON con role snapshot e latenza.
- `AppErrorHandler` (`packages/backend/src/middleware/errorHandler.ts`): mapping errori `AppError` -> HTTP status, stack sanitizzato.
- OpenAPI: `routingControllersToSpec` + `OpenApiGeneratorV3` (`packages/backend/src/server.ts`) arricchiscono lo spec con schemi Zod (`packages/backend/src/openapi/schemas.ts`), disponibile su `/docs` (UI) e `/docs.json`.
- Dependency injection: `Typedi` + `ApiContextToken` condividono `DomainContext` e servizi.

---

## Docker & distribuzione

- `docker/backend.Dockerfile`: multi-stage (builder + runtime). Usa `docker/backend.package.dev|prod.json` per installare solo dipendenze richieste, legge `.env.backend.prod`, espone `API_PORT`.
- `docker/frontend.Dockerfile`: build Vite con env `VITE_API_BASE_URL`/`VITE_PUBLIC_BASE`, serve via nginx (`docker/frontend.nginx.conf`) con proxy `/api/` verso backend.
- `docker-compose.yml`: due servizi (`backend`, `frontend`), porta 3000->backend, 8080->frontend, volume `backend-data` per SQLite persistente (`/data/app.sqlite`).
- Artefatti desktop:
  - `out/` contiene bundle TS transpilati (backend/main/preload/renderer/renderer-web).
  - `dist/` contiene packaging electron-builder (portable `.exe`, `win-unpacked`, `builder-debug.yml`).
- Preview site (`preview/`): utile per landing statiche, non incluso in build principale (comando `npm run --prefix preview dev`).

---

## Script & automazione

| Script | Descrizione |
| --- | --- |
| `npm run autodocs` (`node scripts/repotree.mjs`) | Rigenera `docs/repo-tree.md`, `docs/big-files.txt`, `docs/notes-todos.txt` ignorando `node_modules/dist`. |
| `npm run version:bump` (`scripts/versioning.mjs`) | Ensures working tree pulito, chiede nuova versione semver, aggiorna `package.json`, `package-lock.json`, `.env*`, badge README, crea commit `chore: bump version`. |
| `npm run postinstall` (`scripts/postinstall.mjs`) | Wrappa `electron-builder install-app-deps`, evita recursion durante packaging e permette opt-out via `SKIP_ELECTRON_BUILDER_POSTINSTALL`. |
| `npm run reset:build` | Cancella `dist/` e `out/`. |
| `npm run prepare` | Abilita husky hook dopo install. |

---

## Documentazione & risorse

- **Albero completo**: `docs/repo-tree.md` (aggiornato almeno ad ogni PR rilevante).
- **Ruoli & permessi**: `docs/roles.md` e' la fonte ufficiale per capire `ROLE_PERMISSION_DEFINITIONS` e guardie (`RoleService`, `ProjectService`).
- **Issue tracker**: `package.json::bugs.url` punta a GitHub Issues (`https://github.com/dsk-labs/dsk-electron-react-project-manager/issues`).
- **Preview assets**: `.assets/` e `preview/` contengono materiale marketing/prodotti.
- **Note temporanee**: `temp_featureOrbit.txt` custodisce brainstorming in corso.

---

## Contributi & CI

- **Linee guida branch**: workflow `branch-policy.yml` impedisce merge in `main` da branch non `release/*` o `hotfix/*`, e in `develop` da branch senza prefisso `feature/*`, `feat/*`, `bugfix/*`, `bug/*`, `fix/*`.
- **Pipeline release**: `.github/workflows/release.yml`:
  - Job `prepare` genera numero di versione/notes (`node scripts/release/generate-release-info.mjs`).
  - Job `build` (Windows) esegue `npm ci`, `npm run build:win`, pubblica artefatti portable.
  - Job `release` tagga `vX.Y.Z`, allega binari all'uscita GitHub.
- **Contributi**: aprire issue/PR con descrizione dettagliata, allegando estratti `docs/repo-tree.md` aggiornati e risultati `npm run lint && npm run test && npm run typecheck`.

---

## Licenza

Distribuito con licenza [MIT](LICENSE).

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
