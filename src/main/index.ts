import 'reflect-metadata';
import { Container } from 'typedi';

import { Logger } from './shared/logger';
import { Application } from './Application';

const logger = Container.get(Logger);
logger.info('Starting application...');
logger.info('Modules imported successfully');

if (process.env.NODE_ENV === 'development') {
  try {
    require('electron-reload')(__dirname, {
      hardResetMethod: 'exit',
      ignored: /node_modules|[\/\\]\.|.git|out|dist/
    });
    logger.warn(' Electron auto-reload attivato in modalità development');
  } catch (error) {
    logger.error(' Errore nell\'attivazione dell\'auto-reload:', error);
  }
}

Promise.resolve().then(async function () {
  try {
    const application = Container.get(Application);
    await application.init();
    logger.info('Application fully initialized');
  } catch (error) {
    logger.error(`Error initializing application: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

process.on('uncaughtException', function (error) {
  logger.error(`Uncaught exception: ${error?.message || 'Unknown error'}`);
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', function (reason) {
  logger.error(`Unhandled rejection: ${reason || 'Unknown reason'}`);
  console.error('Unhandled rejection:', reason);
});

logger.info('Application started successfully');