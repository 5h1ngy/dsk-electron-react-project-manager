import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';

// Implementazione semplice e diretta per il logger
let winstonLogger: WinstonLogger;

// Funzione di inizializzazione che può essere chiamata in qualsiasi momento
function createLoggerInstance() {
    if (winstonLogger) return winstonLogger;
    
    // Creazione del logger di base con output su console
    winstonLogger = createLogger({
        level: 'info',
        format: format.combine(
            format.timestamp(),
            format.colorize(),
            format.printf(({ level, message, timestamp }) => {
                return `${timestamp} ${level}: ${message}`;
            })
        ),
        transports: [new transports.Console()]
    });
    
    // Se l'app è pronta aggiungiamo anche i file di log
    if (app.isReady()) {
        try {
            const userDataPath = app.getPath('userData');
            const logsPath = path.join(userDataPath, 'logs');
            
            if (!fs.existsSync(logsPath)) {
                fs.mkdirSync(logsPath, { recursive: true });
            }
            
            // Aggiungiamo i log su file
            winstonLogger.add(new transports.File({ 
                filename: path.join(logsPath, 'error.log'), 
                level: 'error'
            }));
            
            winstonLogger.add(new transports.File({ 
                filename: path.join(logsPath, 'combined.log')
            }));
        } catch (error) {
            console.error('Error setting up file logging:', error);
        }
    }
    
    return winstonLogger;
}

// Crea un oggetto che può essere esportato come singleton
const logger = {
    info: (message: string) => {
        createLoggerInstance().info(message);
    },
    warn: (message: string) => {
        createLoggerInstance().warn(message);
    },
    error: (message: string) => {
        createLoggerInstance().error(message);
    },
    debug: (message: string) => {
        createLoggerInstance().debug(message);
    },
    verbose: (message: string) => {
        createLoggerInstance().verbose(message);
    }
};

// Esporta singleton
export { logger };

// Esporta l'interfaccia per TypeDI
export interface ILogger {
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
    debug(message: string): void;
    verbose(message: string): void;
}

