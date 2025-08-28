import path from 'path';
import { app } from 'electron';
import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { Service } from 'typedi';
import * as _logger from '../shared/logger';
import { models } from '../models';

@Service()
export class DatabaseConfig {
    private _sequelize: Sequelize | null = null;

    public get dbPath(): string {
        const dbPath = path.join(app.getPath('userData'), 'database.sqlite');
        _logger.info(`Using local database path: ${dbPath}`);

        return dbPath;
    }

    public get sequelize(): Sequelize {
        if (!this._sequelize) throw new Error('Sequelize instance not created yet. Please call connect() first.');

        return this._sequelize;
    }

    public get isInitialized(): boolean {
        return this._sequelize !== null;
    }

    constructor() {
        _logger.info('DatabaseConfig instantiated via DI');
    }

    public async connect(): Promise<void> {
        if (this.isInitialized) return;

        try {
            const options: SequelizeOptions = {
                dialect: 'sqlite',
                storage: this.dbPath,
                models,
                logging: (msg) => _logger.info(msg),
                define: { timestamps: true, underscored: false },
                repositoryMode: true,
                validateOnly: false
            };

            this._sequelize = new Sequelize(options);
            await this._sequelize.authenticate();

            _logger.info('Database connection has been established successfully.');

            await this._sequelize.sync();
            _logger.info('Database synchronized successfully!');

        } catch (error: any) {
            _logger.error(`Error creating Sequelize instance: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        if (this._sequelize) {
            await this._sequelize.close();
            _logger.info(`Database connection closed successfully to ${this.dbPath}`);
            
            this._sequelize = null;
        }
    }
}