import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize-typescript';
import { Inject, Service } from 'typedi';

import { DatabaseConfig } from '../config/database.config';
import { encrypt, decrypt } from '../utils/encryption';
import * as _logger from '../shared/logger';
import { BaseService } from './base.service';

@Service()
export class DatabaseService extends BaseService {
  private _sequelize: Sequelize | null = null;

  constructor(
    @Inject() private _config: DatabaseConfig,
  ) {
    super();

    this.initialize()
  }

  public async initialize(): Promise<boolean> {
    try {
      if (this._sequelize) {
        return true; // Already initialized
      }

      // Get database path and ensure directory exists
      const dbPath = this._config.getDatabasePath();
      const dbDir = path.dirname(dbPath);

      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Create Sequelize instance with the database configuration
      this._sequelize = await this._config.createSequelizeInstance();

      if (!this._sequelize) {
        throw new Error('Sequelize instance is null');
      }

      // Authenticate connection
      await this._sequelize.authenticate();
      _logger.info('Database initialized successfully');

      // L'inizializzazione dei modelli viene gestita in database/index.ts
      // quando viene chiamato databaseConfig.initialize()

      // Sync all models with database
      await this._sequelize.sync();

      return true;
    } catch (error: any) {
      _logger.error(`Database initialization error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  public async exportDatabase(): Promise<string> {
    const dbPath = this._config.getDatabasePath();

    if (!fs.existsSync(dbPath)) {
      throw new Error('Database file does not exist');
    }

    const dbContent = fs.readFileSync(dbPath);
    return encrypt(dbContent.toString('base64'));
  }

  public async importDatabase(encryptedData: string): Promise<boolean> {
    try {
      const dbPath = this._config.getDatabasePath();
      const decodedData = decrypt(encryptedData);
      const buffer = Buffer.from(decodedData, 'base64');

      // Close current connection
      if (this._sequelize) {
        await this._sequelize.close();
        this._sequelize = null;
      }

      // Write new database file
      fs.writeFileSync(dbPath, buffer);

      // Reinitialize database
      await this.initialize();

      return true;
    } catch (error) {
      _logger.error(`Error importing database: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  public get sequelize(): Sequelize | null {
    return this._sequelize;
  }
}