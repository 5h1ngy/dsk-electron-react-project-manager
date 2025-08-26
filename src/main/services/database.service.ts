import fs from 'fs';
import { Sequelize } from 'sequelize';
import databaseConfig from '../config/database.config';
import { encrypt, decrypt } from '../utils/encryption';
import { initializeModels } from '../database/models';

/**
 * Service responsible for database operations
 */
export class DatabaseService {
  private static instance: DatabaseService;
  private _sequelize: Sequelize | null = null;

  private constructor() {
    // Private constructor for singleton pattern
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
      // Initialize database config
      await databaseConfig.initialize();
      
      // Create directory if it doesn't exist
      const userDataPath = databaseConfig.dbPath.split('/').slice(0, -1).join('/');
      if (!fs.existsSync(userDataPath)) {
        fs.mkdirSync(userDataPath, { recursive: true });
      }

      // Create and store sequelize instance
      this._sequelize = databaseConfig.createSequelizeInstance();
      
      // Authenticate connection
      await this._sequelize.authenticate();
      console.log('Database connection has been established successfully.');
      
      // Initialize all models
      initializeModels(this._sequelize);
      
      // Sync all models with database
      await this._sequelize.sync();
      
      return true;
    } catch (error) {
      console.error('Unable to connect to the database:', error);
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
    const dbPath = databaseConfig.dbPath;
    
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
      const dbPath = databaseConfig.dbPath;
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
      console.error('Error importing database:', error);
      return false;
    }
  }
}

export default DatabaseService.getInstance();
