import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';
import { Service } from 'typedi';

@Service()
export class Logger {

    private winstonLogger: WinstonLogger

    constructor() {

        this.winstonLogger = createLogger({
            level: 'info',
            format: format.combine(
                format.timestamp(),
                format.colorize(),
                format.printf(({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`)
            ),
            transports: [new transports.Console()]
        });

        app.whenReady().then(() => {
            const userDataPath = app.getPath('userData');
            const logsPath = path.join(userDataPath, 'logs');

            if (!fs.existsSync(logsPath)) {
                fs.mkdirSync(logsPath, { recursive: true });
            }

            this.winstonLogger.add(new transports.File({
                filename: path.join(logsPath, 'error.log'),
                level: 'error'
            }));

            this.winstonLogger.add(new transports.File({
                filename: path.join(logsPath, 'combined.log')
            }));
        }).catch(error => {
            console.error('Error setting up file logging:', error);
        })
    }

    public get info() {
        return this.winstonLogger.info;
    }
    public get warn() {
        return this.winstonLogger.warn;
    }
    public get error() {
        return this.winstonLogger.error;
    }
    public get debug() {
        return this.winstonLogger.debug;
    }
    public get verbose() {
        return this.winstonLogger.verbose;
    }
}