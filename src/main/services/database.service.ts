import fs from 'fs';
import { Inject, Service } from 'typedi';

import { DatabaseConfig } from '../config/database.config';
import { encrypt, decrypt } from '../utils/encryption';
import * as _logger from '../shared/logger';
import { BaseService } from './base.service';

@Service()
export class DatabaseService extends BaseService {

  constructor(
    @Inject() private _config: DatabaseConfig,
  ) {
    super();
  }

  public async exportDatabase(): Promise<string> {
    if (!fs.existsSync(this._config.dbPath)) throw new Error('Database file does not exist');

    const dbContent = fs.readFileSync(this._config.dbPath);
    return encrypt(dbContent.toString('base64'));
  }

  public async importDatabase(encryptedData: string): Promise<boolean> {
    try {
      const decodedData = decrypt(encryptedData);
      const buffer = Buffer.from(decodedData, 'base64');

      if (this._config.isInitialized) await this._config.disconnect();
      fs.writeFileSync(this._config.dbPath, buffer);
      await this._config.connect();

      return true;
    } catch (error) {
      _logger.error(`Error importing database: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }
}