import { SessionManager } from './auth/sessionManager'
import { AuditService } from './audit/auditService'
import { AuthService } from './auth/authService'

class AppContext {
  readonly sessionManager = new SessionManager()
  readonly auditService = new AuditService()
  readonly authService = new AuthService(this.sessionManager, this.auditService)
}

export const appContext = new AppContext()
