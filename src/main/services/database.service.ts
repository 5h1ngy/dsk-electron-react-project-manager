import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize-typescript';
import { Service } from 'typedi';
import { DatabaseConfig } from '../config/database.config';
import { encrypt, decrypt } from '../utils/encryption';
import { logger } from '../shared/logger';

/**
 * Service responsible for database operations
 */
@Service()
export class DatabaseService {
  private static instance: DatabaseService;
  private _sequelize: Sequelize | null = null;
  private databaseConfig: DatabaseConfig;

  private constructor() {
    this.databaseConfig = new DatabaseConfig();
    logger.info('DatabaseService instantiated');
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize the database connection and models
   */
  public async initialize(): Promise<boolean> {
    try {
      if (this._sequelize) {
        return true; // Already initialized
      }

      // Get database path and ensure directory exists
      const dbPath = this.databaseConfig.getDatabasePath();
      const dbDir = path.dirname(dbPath);

      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Create Sequelize instance with the database configuration
      this._sequelize = await this.databaseConfig.createSequelizeInstance();
      
      if (!this._sequelize) {
        throw new Error('Sequelize instance is null');
      }
      
      // Authenticate connection
      await this._sequelize.authenticate();
      logger.info('Database initialized successfully');
      
      // L'inizializzazione dei modelli viene gestita in database/index.ts
      // quando viene chiamato databaseConfig.initialize()
      
      // Sync all models with database
      await this._sequelize.sync();
      
      return true;
    } catch (error: any) {
      logger.error(`Database initialization error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  /**
   * Get the Sequelize instance
   */
  public get sequelize(): Sequelize | null {
    return this._sequelize;
  }

  /**
   * Export database as encrypted base64 string
   */
  public async exportDatabase(): Promise<string> {
    const dbPath = this.databaseConfig.getDatabasePath();
    
    if (!fs.existsSync(dbPath)) {
      throw new Error('Database file does not exist');
    }
    
    const dbContent = fs.readFileSync(dbPath);
    return encrypt(dbContent.toString('base64'));
  }

  /**
   * Import database from encrypted base64 string
   */
  public async importDatabase(encryptedData: string): Promise<boolean> {
    try {
      const dbPath = this.databaseConfig.getDatabasePath();
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
      logger.error(`Error importing database: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }
}

// Implementazione singleton per evitare problemi di dipendenze circolari
