# Role Management Overview

This document describes how the DSK Project Manager models workspace roles, which permissions are available, and where they are enforced across the stack. Use it as the authoritative reference when you need to audit access control or extend the permission model.

## Concepts

- **Role** - Global workspace role assigned to a user (e.g. `Admin`). Stored in the `roles` table with a normalized description and a JSON list of permission keys.
- **Permission** - A symbolic capability (e.g. `manageProjects`). The allowed keys are enumerated in code and sanitised before persistence.
- **UserRole** - Join table (`user_roles`) linking users to one or more roles.
- **Project membership role** - Separate from global roles; governs per-project actions (`view`, `edit`, `admin`). These appear in the `project_members` table and are combined with global roles when authorising project services.
- **Service actor** - In-process representation of the authenticated user (`ServiceActor`) that carries `userId` and the list of role names.

## Permission Catalogue

| Key                 | Label             | Grants                                                                 |
| ------------------- | ----------------- | ---------------------------------------------------------------------- |
| `manageUsers`       | Manage users      | Create, update, deactivate, and reset accounts.                        |
| `manageRoles`       | Manage roles      | Create roles and modify available permission sets.                     |
| `manageProjects`    | Manage projects   | Create, update, archive projects and manage project membership.        |
| `manageTasks`       | Manage tasks      | Create, update, delete project tasks and their comments.               |
| `manageTaskStatuses`| Manage task statuses | Configure workflow columns and ordering for projects.               |
| `manageNotes`       | Manage notes      | Create, update, delete notes and notebooks.                            |
| `manageViews`       | Manage saved views| Create, update, share saved filters/workspace views.                   |
| `viewAnalytics`     | View analytics    | Access dashboards, reports, and aggregated workspace metrics.          |

> Permission definitions live in `packages/shared/src/services/roles/constants.ts` (`ROLE_PERMISSION_DEFINITIONS`). The `sanitizePermissions` helper filters any payload to this allow-list before saving.

## Default Roles

These roles are created automatically at startup (`DatabaseManager.ensureRoles`) and treated as **system roles** (`DEFAULT_ROLE_PERMISSIONS` and `DEFAULT_ROLE_DESCRIPTIONS`). Their names are reserved and cannot be deleted.

| Role name  | Default permissions                                                                                 | Description                                                                                             | Notes |
| ---------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----- |
| `Admin`    | All permission keys (`manageUsers`, `manageRoles`, `manageProjects`, `manageTasks`, `manageTaskStatuses`, `manageNotes`, `manageViews`, `viewAnalytics`) | Full workspace administration, including users, roles, projects, and settings.                         | Only actors with this role may call role or user management services. |
| `Maintainer` | `manageProjects`, `manageTasks`, `manageTaskStatuses`, `manageNotes`, `manageViews`, `viewAnalytics` | Manages projects and workflows without touching workspace-wide user or role settings.                   | Treated as "system admin" for project-level checks (see `isSystemAdmin`). |
| `Contributor` | `manageTasks`, `manageNotes`, `manageViews`                                                       | Collaborates on tasks, notes, and shared views in assigned projects.                                   | Cannot configure projects or statuses. |
| `Viewer`   | `viewAnalytics`                                                                                      | Read-only access to reports and project data.                                                            | Assigned automatically to newly registered users. |

### System-role safeguards

- System roles are defined by `ROLE_NAMES` (auth constants) and flagged by `isSystemRole`.
- `RoleService.deleteRole` rejects deletion of any system role and of roles still assigned to users.
- `RoleService.ensureDefaults` normalises descriptions and fills in missing default permissions/descriptions for already-seeded roles.
- During database migrations `ensureRoles` backfills missing system roles if the table is incomplete.

## Service Enforcement

### Global operations

- `AuthService.requireAdmin` gatekeeps all user-management operations (list, create, update, delete). Only `Admin` can perform workspace-level account actions.
- `RoleService` methods (`listRoles`, `listPermissions`, `createRole`, `updateRole`, `deleteRole`) call `requireAdmin` internally, restricting role management to Admins.

### Project operations

- `isSystemAdmin` (in `project/roles.ts`) treats both `Admin` and `Maintainer` as superusers inside project services, bypassing membership checks where necessary.
- `requireSystemRole(actor, ['Admin', 'Maintainer'])` is used for project creation and other global project actions (`ProjectService`).
- `assertProjectRole` combines membership records with `isSystemAdmin` to enforce per-project permissions on tasks, notes, etc.
- Task, sprint, note services begin their handlers with `resolveProjectAccess`, guaranteeing that the actor either belongs to the project or holds a system-admin role.

### Preload & Renderer

- `roleApi` (preload) exposes IPC wrappers for listing, creating, updating, deleting roles. All calls require a valid token and rely on `AuthService.resolveActor` to provide the role list to backend services.
- Localised permission descriptions are mirrored in `packages/frontend/src/i18n/locales/*/roles.json` for consistent UI messaging.

## Lifecycle & Management Flow

1. **Bootstrap**: When the app starts, `DatabaseManager.initialize` calls `ensureRoles` to seed the four system roles and `ensureAdminUser` to create a default admin account if missing.
2. **User Registration**: `AuthService.register` ensures the Viewer role exists and assigns it to the new account. Future promotions are handled via `AuthService.updateUser`, which replaces entries in `user_roles` after validating requested roles.
3. **Session Handling**: On each request the IPC layer resolves the token to a `ServiceActor`. This ensures real-time role evaluation (role changes apply to the next authenticated call).
4. **Role Maintenance**: Admins may use `RoleService.createRole`/`updateRole` to define custom roles (or adjust descriptions/permissions). `sanitizePermissions` guarantees only recognised permission keys are persisted.
5. **Audit Trail**: Any mutation (`create`, `update`, `delete`) on roles is recorded via `AuditService.record`, capturing before/after snapshots for compliance.

## Custom Role Best Practices

- Always prefer `sanitizePermissions` when constructing role payloads programmatically to avoid invalid keys.
- Respect system-role constraints: treat `Admin`, `Maintainer`, `Contributor`, `Viewer` as immutable names; create new roles under different names if you need variants.
- Review service checks before introducing new permission keys—front-end/UI enforcement should match server-side expectations.
- When adding a permission, update:
  - `ROLE_PERMISSION_DEFINITIONS` (backend canonical list),
  - `DEFAULT_ROLE_PERMISSIONS` to define defaults,
  - Localisation files (`i18n/locales/*/roles.json`) so the UI can display the new capability,
  - Any service that should check for the new permission (beyond the base role name).

## Key Source Locations

- `packages/shared/src/services/roles/constants.ts` – Role and permission definitions.
- `packages/shared/src/services/roles/index.ts` – RoleService logic and guards.
- `packages/shared/src/services/project/roles.ts` – Project membership role logic and `isSystemAdmin` helper.
- `packages/shared/src/services/auth/index.ts` – User provisioning, role assignment, session resolution.
- `packages/shared/src/config/database.ts` – Bootstrap seeding of system roles and admin account.
- `packages/electron/src/preload/src/api/role.ts` – IPC bindings for role management operations.
- `packages/frontend/src/i18n/locales/*/roles.json` – UI copy for permission descriptions.

Refer back to this document before modifying access control to ensure consistency across the codebase and UI. Always audit both service-level guards and UI affordances when introducing new capabilities or roles.
