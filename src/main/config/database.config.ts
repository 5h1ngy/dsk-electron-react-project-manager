import path from 'path';
import { app } from 'electron';
import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { Inject, Service } from 'typedi';
import * as _logger from '../shared/logger';
import { initializeModels } from '../models';

@Service()
export class DatabaseConfig {
    private _sequelize: Sequelize | null = null;
    private _dbPath: string = '';
    private _initialized: boolean = false;

    constructor() {
        _logger.info('DatabaseConfig instantiated via DI');

        this.initialize()
    }

    public getDatabasePath(): string {
        const userDataPath = app.getPath('userData');
        const dbPath = path.join(userDataPath, 'database.sqlite');
        _logger.info(`Using local database path: ${dbPath}`);
        return dbPath;
    }

    public async initialize(): Promise<void> {
        if (this._initialized) {
            return;
        }

        this._dbPath = this.getDatabasePath();
        _logger.info('Database initialized successfully');
        this._initialized = true;
    }

    public getSequelize(): Sequelize {
        if (!this._sequelize) {
            throw new Error('Sequelize instance not created yet. Please call connect() first.');
        }
        return this._sequelize;
    }

    public get isInitialized(): boolean {
        return this._initialized;
    }

    public get dbPath(): string {
        return this._dbPath;
    }

    public async createSequelizeInstance(): Promise<Sequelize> {
        if (this._sequelize) {
            return this._sequelize;
        }

        const dbPath = this.getDatabasePath();

        const options: SequelizeOptions = {
            dialect: 'sqlite',
            storage: dbPath,
            logging: (msg) => _logger.info(msg),
            define: {
                timestamps: true, // Abilita createdAt e updatedAt di default
                underscored: false // Non usare snake_case per i nomi delle colonne
            },
            // Opzioni specifiche per sequelize-typescript
            repositoryMode: true,        // Abilita la modalità repository
            validateOnly: false          // Esegue le validazioni durante le operazioni
        };

        _logger.info(`Creating Sequelize instance for ${this._dbPath}`);
        this._sequelize = new Sequelize(options);

        initializeModels(this._sequelize);

        return this._sequelize;
    }

    public async connect(): Promise<void> {
        if (!this._initialized) {
            await this.initialize();
        }

        try {
            const options: SequelizeOptions = {
                dialect: 'sqlite',
                storage: this._dbPath,
                logging: (msg) => _logger.info(msg),
                define: {
                    timestamps: true, // Abilita createdAt e updatedAt di default
                    underscored: false // Non usare snake_case per i nomi delle colonne
                },
                // Opzioni specifiche per sequelize-typescript
                repositoryMode: true,        // Abilita la modalità repository
                validateOnly: false          // Esegue le validazioni durante le operazioni
            };

            // Create Sequelize instance
            this._sequelize = new Sequelize(options);

            // Authenticate connection
            await this._sequelize.authenticate();
            _logger.info('Database connection has been established successfully.');

            // Inizializzazione dei modelli tramite sequelize-typescript
            initializeModels(this._sequelize);

            // Sync all models with database
            await this._sequelize.sync();
            _logger.info('Database synchronized successfully!');

            this._initialized = true;
        } catch (error: any) {
            _logger.error(`Error creating Sequelize instance: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        if (this._sequelize) {
            await this._sequelize.close();
            _logger.info(`Database connection closed successfully to ${this._dbPath}`);
            this._sequelize = null;
            this._initialized = false;
        }
    }

    public get sequelize(): Sequelize | null {
        return this._sequelize;
    }
}