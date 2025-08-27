import { Service } from 'typedi';
import * as _logger from '../shared/logger';

@Service()
export abstract class BaseController {

    constructor() {
        _logger.info(`Controller ${this.constructor.name} instantiated via DI`);
    }

    public abstract registerHandlers(): void;
}
