import { Inject, Service } from 'typedi';
import { Logger } from '../shared/logger';

/**
 * Base service class that implements common functionality using dependency injection
 */
@Service()
export abstract class BaseService {

    constructor(
        @Inject()
        protected _logger: Logger
    ) {
        this._logger.info(`Service ${this.constructor.name} instantiated via DI`);
    }

    /**
     * Log error and optionally rethrow it
     * @param message Error message prefix
     * @param error Error object
     * @param rethrow Whether to rethrow the error
     */
    protected handleError(message: string, error: any, rethrow: boolean = false): void {
        const errorMessage = `${message}: ${error?.message || 'Unknown error'}`;
        this._logger.error(errorMessage);
        
        if (error instanceof Error && error.stack) {
            this._logger.debug(error.stack);
        }
        
        if (rethrow) {
            throw error;
        }
    }
}
