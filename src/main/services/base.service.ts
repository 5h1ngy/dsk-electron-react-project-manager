import { Service } from 'typedi';
import * as _logger from '../shared/logger';

@Service()
export abstract class BaseService {

    constructor() {
        _logger.info(`Service ${this.constructor.name} instantiated via DI`);
    }

    protected handleError(message: string, error: any, rethrow: boolean = false): void {
        const errorMessage = `${message}: ${error?.message || 'Unknown error'}`;
        _logger.error(errorMessage);

        if (error instanceof Error && error.stack) {
            _logger.debug(error.stack);
        }

        if (rethrow) {
            throw error;
        }
    }
}
