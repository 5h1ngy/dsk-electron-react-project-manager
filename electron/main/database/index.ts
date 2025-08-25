import { Sequelize } from 'sequelize';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import { initializeModels } from './models';
import { encrypt, decrypt } from '../utils/encryption';

let sequelize: Sequelize;
// Defer getting the path until the app is ready
let dbPath: string;

export const initialize = async () => {
  // Wait for app to be ready before accessing paths
  if (!app.isReady()) {
    await new Promise<void>((resolve) => app.on('ready', () => resolve()));
  }
  
  // Now that app is ready, get the paths
  dbPath = path.join(app.getPath('userData'), 'database.sqlite');
  const userDataPath = app.getPath('userData');
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  });

  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Initialize all models
    initializeModels(sequelize);
    
    // Sync all models with database
    await sequelize.sync();
    
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};

export const getSequelize = () => sequelize;

// Database export functionality (returns a Base64 encrypted string)
export const exportDatabase = async (): Promise<string> => {
  if (!fs.existsSync(dbPath)) {
    throw new Error('Database file does not exist');
  }
  
  const dbContent = fs.readFileSync(dbPath);
  return encrypt(dbContent.toString('base64'));
};

// Database import functionality (takes a Base64 encrypted string)
export const importDatabase = async (encryptedData: string): Promise<boolean> => {
  try {
    const decodedData = decrypt(encryptedData);
    const buffer = Buffer.from(decodedData, 'base64');
    
    // Close current connection
    await sequelize.close();
    
    // Write new database file
    fs.writeFileSync(dbPath, buffer);
    
    // Reinitialize database
    await initialize();
    
    return true;
  } catch (error) {
    console.error('Error importing database:', error);
    return false;
  }
};
