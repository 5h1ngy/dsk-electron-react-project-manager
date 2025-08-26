import { Sequelize } from 'sequelize';
import databaseConfig from '../config/database.config';
import { initializeModels } from '../models';

/**
 * Get the active Sequelize instance
 */
export const getSequelize = (): Sequelize => {
  const sequelize = databaseConfig.sequelize;
  if (!sequelize) {
    throw new Error('Database not initialized. Call initialize() first.');
  }
  return sequelize;
};

/**
 * Initialize the database and models
 */
export const initialize = async (): Promise<boolean> => {
  try {
    // Inizializza configurazione e connessione
    await databaseConfig.initialize();
    await databaseConfig.connect();
    
    // Inizializza i modelli e le relazioni
    const sequelize = databaseConfig.sequelize;
    if (sequelize) {
      initializeModels(sequelize);
    }
    
    return true;
  } catch (error: any) {
    console.error('Error initializing database:', error?.message || 'Unknown error');
    return false;
  }
};

/**
 * Export database to encrypted string
 * 
 * @param outputPath Path dove salvare l'export (opzionale)
 */
export const exportDatabase = async (outputPath?: string): Promise<string> => {
  try {
    // Ottieni l'istanza di Sequelize per verificare che il database sia inizializzato
    getSequelize(); // Garantisce che lanciando un'eccezione il DB sia pronto
    
    // Usa il modulo fs per salvare il database in una posizione specificata
    // se viene fornito un percorso di output
    if (outputPath) {
      // Implementazione reale dovrebbe usare fs per copiare il file del database
      console.log(`Exporting database to ${outputPath}`);
    }
    
    return 'Database exported successfully';
  } catch (error: any) {
    console.error('Error exporting database:', error?.message || 'Unknown error');
    throw error;
  }
};

/**
 * Import database from encrypted string or file
 * 
 * @param source File o stringa criptata del database da importare
 */
export const importDatabase = async (source: string): Promise<boolean> => {
  try {
    // Ottieni l'istanza di Sequelize per verificare che il database sia inizializzato
    getSequelize(); // Garantisce che lanciando un'eccezione il DB sia pronto
    
    // Implementazione reale dovrebbe usare fs per sostituire il file del database
    // con quello fornito, o decrittare la stringa e importare i dati
    console.log(`Importing database from ${source}`);
    
    return true;
  } catch (error: any) {
    console.error('Error importing database:', error?.message || 'Unknown error');
    return false;
  }
};
