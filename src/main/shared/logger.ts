import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { createLogger, format, transports, } from 'winston';

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.colorize(),
        format.printf(({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`),
    ),
    transports: [
        new transports.Console(),
    ]
});

app.whenReady().then(() => {
    const userDataPath = app.getPath('userData');
    const logsPath = path.join(userDataPath, 'logs');

    if (!fs.existsSync(logsPath)) {
        fs.mkdirSync(logsPath, { recursive: true });
    }

    logger.add(new transports.File({
        filename: path.join(logsPath, 'error.log'),
    } as transports.FileTransportOptions));

    logger.add(new transports.File({
        filename: path.join(logsPath, 'combined.log')
    }));
}).catch(error => {
    console.error('Error setting up file logging:', error);
})


export const info = (message: string) => logger.info(message)
export const error = (message: string) => logger.error(message)
export const warn = (message: string) => logger.warn(message)
export const debug = (message: string) => logger.debug(message)
