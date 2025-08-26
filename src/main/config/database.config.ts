import path from 'path';
import { app } from 'electron';
import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { Service } from 'typedi';
import { logger } from '../shared/logger';
import { initializeModels } from '../models';

// Nessuna importazione di modelli qui, le associazioni sono gestite in models/index.ts

// Non importare database/index qui per evitare import circolari
// La corretta inizializzazione deve avvenire dal punto di ingresso dell'app

/**
 * Database configuration class for managing Sequelize connection
 * Implements dependency injection using TypeDI
 */
@Service()
export class DatabaseConfig {
    private _sequelize: Sequelize | null = null;
    private _dbPath: string = '';
    private _initialized: boolean = false;

    constructor() {
        logger.info('DatabaseConfig instantiated via DI');
    }

    /**
     * Get database path from app data directory
     */
    public getDatabasePath(): string {
        // Ottieni il percorso della directory dei dati dell'utente
        const userDataPath = app.getPath('userData');
        // Unisci il percorso con il nome del file del database
        const dbPath = path.join(userDataPath, 'database.sqlite');
        logger.info(`Using local database path: ${dbPath}`);
        return dbPath;
    }

    /**
     * Initialize database configuration
     */
    public async initialize(): Promise<void> {
        if (this._initialized) {
            return;
        }

        this._dbPath = this.getDatabasePath();
        logger.info('Database initialized successfully');
        this._initialized = true;
    }

    /**
     * Get Sequelize instance
     */
    public getSequelize(): Sequelize {
        if (!this._sequelize) {
            throw new Error('Sequelize instance not created yet. Please call connect() first.');
        }
        return this._sequelize;
    }

    /**
     * Check if database is initialized
     */
    public get isInitialized(): boolean {
        return this._initialized;
    }

    /**
     * Get database path
     */
    public get dbPath(): string {
        return this._dbPath;
    }

    /**
     * Create and return a Sequelize instance
     */
    public async createSequelizeInstance(): Promise<Sequelize> {
        if (this._sequelize) {
            return this._sequelize;
        }

        const dbPath = this.getDatabasePath();
        
        // Configurazione per sequelize-typescript
        const options: SequelizeOptions = {
            dialect: 'sqlite',
            storage: dbPath,
            logging: (msg) => logger.info(msg),
            define: {
                timestamps: true, // Abilita createdAt e updatedAt di default
                underscored: false // Non usare snake_case per i nomi delle colonne
            },
            // Opzioni specifiche per sequelize-typescript
            repositoryMode: true,        // Abilita la modalità repository
            validateOnly: false          // Esegue le validazioni durante le operazioni
        };

        logger.info(`Creating Sequelize instance for ${this._dbPath}`);
        this._sequelize = new Sequelize(options);
        
        // Inizializzazione dei modelli tramite sequelize-typescript
        initializeModels(this._sequelize);
        
        return this._sequelize;
    }

    /**
     * Create connection to the database
     */
    public async connect(): Promise<void> {
        if (!this._initialized) {
            await this.initialize();
        }

        try {
            // Configurazione per sequelize-typescript
            const options: SequelizeOptions = {
                dialect: 'sqlite',
                storage: this._dbPath,
                logging: (msg) => logger.info(msg),
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
            logger.info('Database connection has been established successfully.');
            
            // Inizializzazione dei modelli tramite sequelize-typescript
            initializeModels(this._sequelize);
            
            // Sync all models with database
            await this._sequelize.sync();
            logger.info('Database synchronized successfully!');
            
            this._initialized = true;
        } catch (error: any) {
            logger.error(`Error creating Sequelize instance: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }

    /**
     * Close database connection
     */
    public async disconnect(): Promise<void> {
        if (this._sequelize) {
            await this._sequelize.close();
            logger.info(`Database connection closed successfully to ${this._dbPath}`);
            this._sequelize = null;
            this._initialized = false;
        }
    }

    /**
     * Get the Sequelize instance
     */
    public get sequelize(): Sequelize | null {
        return this._sequelize;
    }
}

// Non esportare un'istanza singleton, verrà gestita da TypeDI
