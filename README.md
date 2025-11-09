# DSK Project Manager

[![Release Workflow](https://github.com/5h1ngy/dsk-electron-react-project-manager/actions/workflows/release.yml/badge.svg)](https://github.com/5h1ngy/dsk-electron-react-project-manager/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Version](https://img.shields.io/badge/version-0.61.17-6C63FF.svg)

Gestore di progetti offline-first costruito con Electron 38, React 19, Ant Design 5 e un dominio condiviso TypeScript/SQLite pensato per ambienti air-gapped o installazioni on-prem. Include API REST, CLI di seeding e pipeline di rilascio Windows portabile.

![Application preview](docs/preview.png)

## Indice
- [Architettura & mappa componenti](#architettura--mappa-componenti)
- [Requisiti di sistema](#requisiti-di-sistema)
- [Installazione (passi numerati)](#installazione-passi-numerati)
- [Configurazione](#configurazione)
- [Esecuzione locale (comandi + hot-reload)](#esecuzione-locale-comandi--hot-reload)
- [Test (unit/e2e) e coverage](#test-unite2e-e-coverage)
- [Lint/format, quality gates](#lintformat-quality-gates)
- [Build & Deploy (Docker/K8s/CI)](#build--deploy-dockerk8sci)
- [API (endpoint principali con esempi curl)](#api-endpoint-principali-con-esempi-curl)
- [CLI (comandi principali)](#cli-comandi-principali)
- [Roadmap / Limiti noti](#roadmap--limiti-noti)
- [Contribuire (branching, commit style, PR)](#contribuire-branching-commit-style-pr)
- [Licenza](#licenza)
- [Riferimenti/Créditi](#riferimenticréditi)

## Architettura & mappa componenti

Stack principale: Electron + React + Vite + Express 5 (routing-controllers) + Sequelize/SQLite, tutto scritto in TypeScript e condiviso tramite alias (`@main`, `@renderer`, `@services`, ecc.).

- **Nome repo:** `dsk-electron-react-project-manager`
- **Monorepo:** sì ➜ `packages/{electron,frontend,backend,shared,seeding}`
- **Entry-point principali:** `packages/electron/src/main/index.ts`, `packages/frontend/src/main.tsx`, `packages/backend/src/server.ts`, `packages/seeding/src/run.ts`
- **Comandi tipici:** `npm run dev:electron`, `npm run dev:backend`, `npm run dev:frontend`, `npm run db:seed`, `npm run build:win`, `npm run lint`, `npm run test`
- **Directory da tenere d’occhio:** `packages/*`, `env/`, `docker/`, `.github/workflows`, `docs/`
- **Percorsi da ignorare in review/build:** `dist/`, `out/`, `node_modules/`, `preview/dist/`

```
[Utente]
   │
   ▼
[Electron Main Process] ── IPC ──> [React Renderer (Ant Design, Redux Toolkit)]
   │                                  │
   │                                  ▼
   │                         [Preload bridge / HTTP bridge]
   │                                  │
   ▼                                  ▼
[Shared Domain Services + Sequelize + SQLite]
   ▲                                  │
   │                                  ▼
[Express API (routing-controllers) ── Swagger] ↔ [Web SPA build]
   │
   ▼
[Seeding CLI + Dockerized backend/frontend + Release pipeline]
```

#### Albero cartelle (profondità 3)

```
.
├─ packages/
│  ├─ electron/            # electron-vite, main & preload, builder config
│  ├─ frontend/            # React 19 + Vite + Redux Toolkit
│  ├─ backend/             # Express 5 + routing-controllers + Swagger
│  ├─ shared/              # Sequelize models + domain services + config
│  └─ seeding/             # Seeder CLI e orchestrazione remoto
├─ env/                    # profili .env.{desktop,backend,webapp}.{dev,prod}
├─ docker/                 # Dockerfile backend/frontend + packages minimal
├─ docs/                   # preview, prompts e documentazione funzionale
├─ scripts/                # postinstall electron-builder, version bump
├─ .github/workflows/      # branch policy + release portabile Windows
└─ dist|out|preview/       # artefatti (da evitare in review)
```

#### Mappa componenti

| Modulo | Percorso | Responsabilità | Dipendenze interne |
| --- | --- | --- | --- |
| Electron Main Process | `packages/electron/src/main` | bootstrap dell’app desktop, session lifecycle, IPC verso i servizi dominio, gestione finestra principale | `@services/config/*`, `@services/runtime/domainContext`, `@main/appContext` |
| Preload bridge | `packages/electron/src/preload/src` | `contextBridge` sicuro verso il renderer + feature flag DevTools | `@preload/api/*`, `@main/ipc/*`, tipi condivisi |
| React Renderer | `packages/frontend/src` | UI in Ant Design, store Redux Toolkit, i18n, orchestrazione viste e task board | `window.api` (Electron) o `platform/httpBridge` (webapp) |
| Backend API REST | `packages/backend/src` | Express + routing-controllers, OpenAPI `/docs`, orchestrazione seed remoto | `@services/runtime/domainContext`, `@backend/openapi` |
| Shared domain layer | `packages/shared/src` | Config ambiente/logger/storage, Sequelize models + servizi (project/task/wiki/role ecc.) | Usato da main, backend e seeding |
| Seeding CLI | `packages/seeding/src` | Popola database locale o remoto, espone `run.ts` richiamato dagli script npm | `DatabaseManager`, `DevelopmentSeeder`, `seedConfig` |
| Infrastruttura delivery | `.github/workflows`, `docker/*`, `scripts/versioning.mjs` | Build CI, pacchetto portable win, policy branch e version bump | npm scripts, electron-builder, docker compose |

#### Dipendenze (runtime/dev)

Dipendenze runtime (`package.json`):

```
@ant-design/icons ^5.6.1
@ant-design/plots ^2.1.9
@ant-design/v5-patch-for-react-19 ^1.0.3
@asteasolutions/zod-to-openapi ^7.3.4
@electron-toolkit/preload ^3.0.2
@electron-toolkit/utils ^4.0.0
@hookform/resolvers ^5.2.2
@node-rs/argon2 ^2.0.2
@redux-devtools/extension ^3.3.0
@reduxjs/toolkit ^2.9.1
@uiw/react-markdown-preview ^5.1.2
ajv ^8.17.1
antd ^5.27.5
class-transformer ^0.5.1
class-validator ^0.14.2
cors ^2.8.5
dayjs ^1.11.13
dotenv ^16.4.5
express ^5.1.0
i18next ^23.16.8
module-alias ^2.2.3
react ^19.2.0
react-dom ^19.2.0
react-hook-form ^7.65.0
react-i18next ^15.7.4
react-markdown ^9.0.1
react-redux ^9.2.0
react-router-dom ^6.30.1
reflect-metadata ^0.1.14
rehype-sanitize ^6.0.0
remark-gfm ^4.0.0
routing-controllers ^0.11.3
routing-controllers-openapi ^5.0.0
sequelize ^6.37.7
sequelize-typescript ^2.1.6
sqlite3 ^5.1.7
swagger-ui-express ^5.0.1
tsconfig-paths ^4.2.0
typedi ^0.10.0
zod ^3.25.76
```

Dipendenze dev:

```
@commitlint/cli ^20.1.0
@commitlint/config-conventional ^20.0.0
@electron-toolkit/eslint-config-prettier ^3.0.0
@electron-toolkit/eslint-config-ts ^3.1.0
@electron-toolkit/tsconfig ^2.0.0
@faker-js/faker ^8.4.1
@testing-library/dom ^10.4.1
@testing-library/jest-dom ^6.9.1
@testing-library/react ^16.3.0
@testing-library/user-event ^14.6.1
@types/jest ^29.5.12
@types/node ^22.12.0
@types/react ^19.2.2
@types/react-dom ^19.2.2
@vitejs/plugin-react ^5.0.4
cross-env ^7.0.3
dotenv-cli ^11.0.0
electron ^38.3.0
electron-builder ^26.0.12
electron-devtools-installer ^4.0.0
electron-vite ^4.0.1
eslint ^9.38.0
eslint-import-resolver-typescript ^4.4.4
eslint-plugin-import-x ^4.16.1
eslint-plugin-react ^7.37.5
eslint-plugin-react-hooks ^5.2.0
eslint-plugin-react-refresh ^0.4.20
husky ^9.1.7
jest ^29.7.0
jest-environment-jsdom ^29.7.0
prettier ^3.6.2
rimraf ^6.1.0
ts-jest ^29.4.5
ts-node ^10.9.2
typescript ^5.7.3
vite ^7.1.10
```

## Requisiti di sistema

- Node.js 22.x LTS + npm 10.x (necessari per electron-vite e per i pacchetti opzionali `@node-rs/argon2`)
- Git 2.40+ per rispettare gli hook Husky e la policy branch
- Sistema operativo: Windows 10/11 (build ufficiale), macOS 13+ o Linux x64 per sviluppo
- Risorse disco: ~4 GB (repo + `node_modules` + `out/`); RAM consigliata ≥ 8 GB per build Electron
- Docker 24+ (opzionale) per eseguire backend/frontend containerizzati

## Installazione (passi numerati)

1. **Clona il repository**
   ```bash
   git clone https://github.com/5h1ngy/dsk-electron-react-project-manager.git
   cd dsk-electron-react-project-manager
   ```
2. **Installa le dipendenze** (esegue `scripts/postinstall.mjs` che installa le app-deps di electron-builder in modo sicuro)
   ```bash
   npm install
   ```
3. **Seleziona/duplica i profili `.env`**: usa i file in `env/` (`.env.desktop.dev`, `.env.backend.dev`, `.env.webapp.dev`, ecc.) oppure duplica `.env.example` per override locali.
4. **(Opzionale) Aggiorna alias TypeScript**: se usi IDE diversi, assicurati che `tsconfig.json` e `module-alias` puntino ai path corretti.

## Configurazione

Tutte le variabili sono documentate in `env/.env.example` e replicate negli altri profili. Tabella riepilogativa:

| Variabile | Default (dev) | Scope | Descrizione |
| --- | --- | --- | --- |
| `LOG_LEVEL` | `info` (`debug` in dev) | Desktop, Backend, Webapp | Filtra l’output (`debug`, `info`, `warn`, `error`) |
| `LOG_STORAGE_PATH` | vuoto | Tutti | Se valorizzato, persiste i log su file (path assoluto o relativo) |
| `ENABLE_DEVTOOLS` | `false` (desktop prod), `true` (dev) | Desktop/Webapp | Permette di aprire DevTools (usato anche dal preload) |
| `APP_VERSION` | `0.60.17` | Tutti | Versione mostrata nell’app, usata da updater e badge |
| `APP_RUNTIME` / `VITE_APP_RUNTIME` | `desktop` o `webapp` | Renderer, Electron, Vite | Seleziona modalità desktop o SPA standalone |
| `API_PROXY_TARGET` | `http://localhost:3333` | Electron renderer & Vite dev server | Proxy di sviluppo per `/api` |
| `VITE_API_BASE_URL` / `PUBLIC_BASE` | `/api` e `/` | Webapp | Base URL pubblico/privato per build Vite |
| `API_PORT` | `3333` (desktop), `4000` (backend dev), `3000` (prod) | Backend, Docker | Porta di ascolto Express |
| `HOST_API_PORT` | `3333` | Docker compose | Bind host per servizio API |
| `DB_STORAGE_PATH` | `out/storage/backend/app.sqlite` (dev) | Backend, CLI | Posizione alternativa del file SQLite |
| `SEED_BACKEND_PORT` | `4001` (dev) / `3001` (prod) | Seeder | Porta per il trigger remoto `POST /seed` |
| `SEED_BACKEND_HOST` | `localhost` | Seeder | Host per trigger remoto |
| `SESSION_TIMEOUT_MINUTES` | `30` (fallback) | Main process | Override del timeout sessioni se non presente in DB |

> Suggerimento: esporta `DOTENV_CONFIG_PATH` quando esegui script Node standalone per forzare un profilo specifico (es. `env/.env.backend.dev`).

## Esecuzione locale (comandi + hot-reload)

- **Desktop offline-first (Electron + backend embedded)**
  ```bash
  npm run dev:electron
  ```
  Usa `electron-vite` con hot reload su main/preload/renderer e carica automaticamente i profili `.env.desktop.*`.

- **Backend API standalone**
  ```bash
  npm run dev:backend
  # server su http://localhost:4000 con Swagger su /docs
  ```
  Esegue `ts-node` con routing-controllers, log dettagliati e storage `out/storage/backend`.

- **Frontend web SPA**
  ```bash
  npm run dev:frontend
  # Vite su http://localhost:5173 con proxy /api -> API_PROXY_TARGET
  ```
  In modalità webapp l’HTTP bridge (`platform/httpBridge.ts`) sostituisce l’API IPC e tutte le chiamate passano via fetch.

- **Seeding dati di sviluppo**
  ```bash
  npm run db:seed           # locale, usa storage Electron
  npm run db:seed:backend   # trigger remoto (default http://localhost:3000/seed)
  ```

## Test (unit/e2e) e coverage

- **Suite completa**: `npm run test` esegue Jest su 5 progetti (`frontend`, `backend`, `shared`, `seeding`, `electron`). I test jsdom usano `packages/frontend/test/setupEnv.ts`.
- **Runner mirati**: `npm run test:frontend`, `npm run test:backend`, ecc. supportano `--watch`.
- **Coverage**: report V8 per ciascun pacchetto sotto `coverage/<package>/`. Il progetto Electron applica `coverageThreshold` globale (0.8 statements/funzioni/linee, 0.7 branches).
- **Testing libraries**: @testing-library/react per componenti, test unitari su servizi (`packages/shared/src/services/**.test.ts`), mock di stile/file in `packages/frontend/test/__mocks__`.
- **E2E**: non presenti. TODO solo se servirà coverage end-to-end.

## Lint/format, quality gates

- **ESLint (flat config)**: `npm run lint` esegue i profili per Electron, frontend, backend, shared e seeding; `npm run lint:fix` applica fix mirati.
- **Prettier**: `npm run format` o script per singolo pacchetto (`format:frontend`, ecc.).
- **Typecheck**: `npm run typecheck` ➜ `tsc --noEmit` per configurazioni node/web di Electron.
- **Commit policy**: Husky (`.husky/`) e commitlint (`commitlint.config.cjs`) impongono Conventional Commits. Hook `prepare` installa gli hook dopo ogni install.
- **Branch policy**: workflow `.github/workflows/branch-policy.yml` vieta merge verso `main` senza branch `release/*` o `hotfix/*` e verso `develop` senza `feature/*`, `bugfix/*`, `fix/*`.

## Build & Deploy (Docker/K8s/CI)

- **Desktop portable Windows**
  ```bash
  npm run build:win
  ```
  Esegue `npm run typecheck`, `electron-vite build` e `electron-builder` usando `packages/electron/electron-builder.yml` (target portable x64, artefatto `dist/DSK Project Manager-<version>-portable-win.exe`).

- **Build web & backend separati**
  ```bash
  npm run build:frontend   # out/renderer-web
  npm run build:backend    # out/backend
  ```
  I Dockerfile (`docker/backend.Dockerfile`, `docker/frontend.Dockerfile`) usano package.json minimali per installare solo le dipendenze necessarie, poi copiano l’`out/` del builder.

- **Docker compose**
  ```bash
  docker compose up --build
  ```
  Alza `backend` (Node 22-alpine, SQLite in volume `backend-data`) e `frontend` (nginx che proxy `/api/` verso backend:3000).

- **CI/CD**
  - Workflow `release.yml`: 3 job (`prepare`, `build`, `release`). Genera release info (`scripts/release/generate-release-info.mjs`), builda su Windows, carica artefatti e pubblica tag `vX.Y.Z`.
  - Script `npm run version:bump` mantiene allineati `package*.json`, README, `.env.*` e crea commit `chore: bump version to X.Y.Z`.

## API (endpoint principali con esempi curl)

L’API Express gira su `/` (porta configurabile) ed esporta Swagger UI su `/docs` e lo schema JSON su `/docs.json`. Tutte le rotte principali sono protette da bearer token ottenuto via `/auth/login`.

| Risorsa | Endpoint | Metodo | Descrizione |
| --- | --- | --- | --- |
| Health | `/health` | GET | Stato DB e versione app |
| Auth | `/auth/login`, `/auth/logout`, `/auth/register`, `/auth/session`, `/auth/users` | POST/GET/PUT/DELETE | Login, sessione, gestione utenti |
| Projects | `/projects`, `/projects/:projectId` | GET/POST/PUT/DELETE | CRUD progetti + membri (`/members`) |
| Tasks | `/projects/:projectId/tasks`, `/tasks/:taskId` | GET/POST/PUT/DELETE | Task board, commenti (`/comments`), ricerca (`/tasks/search`) |
| Task Status | `/projects/:projectId/statuses`, `/statuses/:statusId` | GET/POST/PUT/DELETE | Fasi Kanban + reorder (`/statuses/reorder`) |
| Notes | `/notes`, `/notes/:id`, `/notes/search` | POST/GET/PUT/DELETE | Knowledge base con full-text |
| Wiki | `/projects/:projectId/wiki`, `/wiki/:pageId/revisions` | CRUD pagine wiki e gestione revisioni |
| Views | `/projects/:projectId/views`, `/views/:id` | Layout salvati |
| Roles | `/roles`, `/roles/:id`, `/roles/permissions`, `/roles/sync-defaults` | RBAC |
| Sprints | `/projects/:projectId/sprints`, `/sprints/:id` | Pianificazione iterazioni |
| Seed | `/seed` | POST | Trigger remoto del seeding CLI |

Esempi `curl` (testati a secco):

```bash
# Login (restituisce token bearer)
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"changeme"}'

# Creazione progetto
curl -X POST http://localhost:4000/projects \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Integrazione air-gapped","code":"AGP-001","description":"Pilot interno"}'

# Consultazione health & swagger
curl http://localhost:4000/health
curl http://localhost:4000/docs.json | jq '.info'

# Trigger remoto seeding sul backend containerizzato
curl -X POST http://localhost:3001/seed
```

## CLI (comandi principali)

| Comando | Descrizione |
| --- | --- |
| `npm run db:seed` | Esegue `packages/seeding/src/run.ts`, risolve lo storage path come farebbe Electron (`resolveAppStoragePath`) e popola ruoli, utenti e dati demo. |
| `npm run db:seed:backend -- --host <HOST> --port <PORT>` | Triggera `POST /seed` su un backend remoto; legge fallback da `SEED_BACKEND_HOST/PORT`. |
| `npm run reset:build` | Rimuove `dist/`, `out/`, `preview/dist` per ripartire da zero. |
| `npm run dev:*` | Avvio selettivo di electron/frontend/backend con `dotenv-cli` che carica l’`env` adeguato. |
| `npm run typecheck`, `npm run lint`, `npm run format` | Quality gates locali prima della PR. |

## Roadmap / Limiti noti

- Distribuzione ufficiale solo come portable Windows x64; per macOS/Linux bisogna eseguire in modalità sviluppatore.
- Persistenza su SQLite single-file ➜ non pensata per multi-tenant o DB centralizzati; migrazioni automatiche limitate.
- Mancano test end-to-end e smoke automatizzati; la validazione è affidata a Jest + manual QA.
- HTTP bridge (modalità webapp) non supporta ancora le funzioni `database.export/import` offerte via IPC desktop (risponde con `ERR_UNSUPPORTED`).
- Il repository `preview/` è solo un microsito vetrina e non parte della pipeline di build.

## Contribuire (branching, commit style, PR)

1. **Fork & branch naming**: crea branch `feature/<descrizione>` (o `bugfix/`, `fix/`) se punti a `develop`; usa `release/*` o `hotfix/*` per PR verso `main` (il workflow `branch-policy` blocca prefissi errati).
2. **Linee guida commit**: adotta Conventional Commits (`feat: ...`, `fix: ...`, `chore:`). Husky esegue lint-staged/commitlint automaticamente.
3. **Checklist PR**:
   - esegui `npm run lint` e `npm run test`
   - aggiorna eventuali `.env` o documentazione se tocchi configurazioni
   - allega screenshot se modifichi UI (utilizza `docs/preview.png` come riferimento)
4. **Rilascio**: bumpa la versione con `npm run version:bump` e lascia che GitHub Actions `release.yml` costruisca gli artefatti portabili.

## Licenza

Software distribuito con licenza [MIT](LICENSE).

## Riferimenti/Créditi

- Documentazione interna: `docs/features/roles.md`, `docs/.prompts/auto-readme.prompt.md`
- UI: [Ant Design](https://ant.design/), [@ant-design/plots](https://charts.ant.design/)
- Runtime: [Electron](https://www.electronjs.org/), [Vite](https://vitejs.dev/), [Electron Vite](https://electron-vite.org/)
- Dominio: [routing-controllers](https://github.com/typestack/routing-controllers), [Sequelize](https://sequelize.org/)
- Preview marketing: sorgente in `preview/` (non incluso nel build desktop)
