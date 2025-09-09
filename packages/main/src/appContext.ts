import type { Sequelize } from 'sequelize-typescript'
import { SessionManager } from './services/auth/sessionManager'
import { AuditService } from './services/audit/auditService'
import { AuthService } from './services/auth/authService'
import { ProjectService } from './services/projectService'
import { TaskService } from './services/taskService'

class AppContext {
  readonly sessionManager = new SessionManager()
  readonly auditService = new AuditService()
  readonly authService = new AuthService(this.sessionManager, this.auditService)

  sequelize?: Sequelize
  projectService?: ProjectService
  taskService?: TaskService

  setDatabase(sequelize: Sequelize): void {
    this.sequelize = sequelize
    this.projectService = new ProjectService(sequelize, this.auditService)
    this.taskService = new TaskService(sequelize, this.auditService)
  }
}

export const appContext = new AppContext()
