import type { Sequelize } from 'sequelize-typescript'

import { AuditService } from '@services/services/audit'
import { AuthService } from '@services/services/auth'
import { SessionManager } from '@services/services/auth/sessionManager'
import { NoteService } from '@services/services/note'
import { ProjectService } from '@services/services/project'
import { RoleService } from '@services/services/roles'
import { SprintService } from '@services/services/sprint'
import { TaskService } from '@services/services/task'
import { TaskStatusService } from '@services/services/taskStatus'
import { ViewService } from '@services/services/view'
import { WikiService } from '@services/services/wiki'

export interface DomainContextOptions {
  sequelize: Sequelize
  auditService?: AuditService
  sessionManager?: SessionManager
  authService?: AuthService
}

export interface DomainContext {
  sequelize: Sequelize
  auditService: AuditService
  sessionManager: SessionManager
  authService: AuthService
  projectService: ProjectService
  taskService: TaskService
  taskStatusService: TaskStatusService
  noteService: NoteService
  viewService: ViewService
  roleService: RoleService
  wikiService: WikiService
  sprintService: SprintService
}

export const createDomainContext = (options: DomainContextOptions): DomainContext => {
  const auditService = options.auditService ?? new AuditService()
  const sessionManager = options.sessionManager ?? new SessionManager()
  const authService = options.authService ?? new AuthService(sessionManager, auditService)
  const projectService = new ProjectService(options.sequelize, auditService)
  const taskStatusService = new TaskStatusService(options.sequelize, auditService)
  const taskService = new TaskService(options.sequelize, auditService)
  const noteService = new NoteService(options.sequelize, auditService)
  const viewService = new ViewService(options.sequelize, auditService)
  const roleService = new RoleService(options.sequelize, auditService)
  const wikiService = new WikiService(options.sequelize, auditService)
  const sprintService = new SprintService(options.sequelize, auditService)

  return {
    sequelize: options.sequelize,
    auditService,
    sessionManager,
    authService,
    projectService,
    taskService,
    taskStatusService,
    noteService,
    viewService,
    roleService,
    wikiService,
    sprintService
  }
}

export const teardownDomainContext = async (context: DomainContext): Promise<void> => {
  await context.sequelize.close()
}
