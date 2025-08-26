/**
 * Classe base per gli errori dell'applicazione
 */
export class ApplicationError extends Error {
  public readonly code: string;
  public readonly httpStatus: number;
  public readonly details?: Record<string, any>;

  constructor(message: string, code: string, httpStatus: number = 500, details?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.httpStatus = httpStatus;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Errore per risorsa non trovata
 */
export class NotFoundError extends ApplicationError {
  constructor(resource: string, resourceId?: string | number) {
    const message = resourceId 
      ? `${resource} with id ${resourceId} not found` 
      : `${resource} not found`;
    super(message, 'NOT_FOUND', 404);
  }
}

/**
 * Errore per validazione fallita
 */
export class ValidationError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

/**
 * Errore per autenticazione fallita
 */
export class AuthenticationError extends ApplicationError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

/**
 * Errore per autorizzazione fallita
 */
export class AuthorizationError extends ApplicationError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}

/**
 * Errore per database
 */
export class DatabaseError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'DATABASE_ERROR', 500, details);
  }
}
