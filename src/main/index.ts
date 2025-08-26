import 'reflect-metadata';
import { Container } from 'typedi';

import { logger } from './shared/logger';
import { DatabaseConfig } from './config/database.config';
import { Application } from './Application';
import { ControllerRegistry } from './controllers';

logger.info('Starting application...');
Container.set('logger', logger);
logger.info('Modules imported successfully');

if (process.env.NODE_ENV === 'development') {
  try {
    require('electron-reload')(__dirname, {
      hardResetMethod: 'exit',
      ignored: /node_modules|[\/\\]\.|.git|out|dist/
    });
    console.log(' Electron auto-reload attivato in modalità development');
  } catch (error) {
    console.error(' Errore nell\'attivazione dell\'auto-reload:', error);
  }
}

Container.set('logger', logger);
logger.info('Logger registered in TypeDI container');

Container.set('databaseConfig', new DatabaseConfig());
logger.info('DatabaseConfig registered in TypeDI container');

let application;
try {

  const controllerRegistry = ControllerRegistry.getInstance();
  logger.info('ControllerRegistry instance retrieved');


  application = new Application(controllerRegistry);
  logger.info('Application instance created manually');
} catch (error) {
  logger.error(`Error creating Application instance: ${error instanceof Error ? error.message : 'Unknown error'}`);
  process.exit(1);
}

Promise.resolve().then(async function () {
  try {
    await application.init();
    logger.info('Application fully initialized');
  } catch (error) {
    logger.error(`Error initializing application: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught exception: ${error?.message || 'Unknown error'}`);
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled rejection: ${reason || 'Unknown reason'}`);
  console.error('Unhandled rejection:', reason);
});

logger.info('Application started successfully');