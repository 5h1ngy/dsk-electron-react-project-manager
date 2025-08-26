import { Inject, Service } from 'typedi';

import { Logger } from '../shared/logger';

@Service()
export abstract class BaseController {

    constructor(
        @Inject()
        protected _logger: Logger
    ) {
        this._logger.info(`Controller ${this.constructor.name} instantiated via DI`);
    }

    public abstract registerHandlers(): void;
}
