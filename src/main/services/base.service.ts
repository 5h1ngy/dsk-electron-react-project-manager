import { Service, Inject } from 'typedi';
import type { ILogger } from '../shared/logger';

/**
 * Base service class that implements common functionality using dependency injection
 */
@Service()
export abstract class BaseService {
    /**
     * Constructor with logger injection
     */
    constructor(
        @Inject('logger') protected logger: ILogger
    ) {
        this.logger.info(`Service ${this.constructor.name} instantiated via DI`);
    }

    /**
     * Log error and optionally rethrow it
     * @param message Error message prefix
     * @param error Error object
     * @param rethrow Whether to rethrow the error
     */
    protected handleError(message: string, error: any, rethrow: boolean = false): void {
        const errorMessage = `${message}: ${error?.message || 'Unknown error'}`;
        this.logger.error(errorMessage);
        console.error(errorMessage, error);

        if (rethrow) {
            throw error;
        }
    }
}
