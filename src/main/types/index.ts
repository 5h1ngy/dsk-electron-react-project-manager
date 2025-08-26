/**
 * Definizioni dei tipi globali per l'applicazione
 */

/**
 * Interfaccia per le configurazioni di base
 */
export interface BaseConfig {
  initialize(): Promise<void>;
}

/**
 * Interfaccia per i controller
 */
export interface Controller {
  registerHandlers(): void;
}

/**
 * Interfaccia per i servizi con inizializzazione
 */
export interface InitializableService {
  initialize(): Promise<boolean>;
}

/**
 * Interfaccia per response generiche
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * Stati possibili per le attività
 */
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  DONE = 'done'
}

/**
 * Priorità possibili per le attività
 */
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}
