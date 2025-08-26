import { Service } from 'typedi';
import { logger } from '../shared/logger';

/**
 * Base controller class that implements common functionality using dependency injection
 */
@Service()
export abstract class BaseController {
    /**
     * Constructor with logger injection
     */
    constructor() {
        logger.info(`Controller ${this.constructor.name} instantiated via DI`);
    }

    /**
     * Register all IPC handlers for this controller
     * Each controller must implement this method
     */
    public abstract registerHandlers(): void;
}
