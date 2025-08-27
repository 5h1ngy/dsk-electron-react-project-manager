import 'reflect-metadata';
import { Container } from 'typedi';
import { Application } from './Application';

if (process.env.NODE_ENV === 'development') {
  try {
    require('electron-reload')(__dirname, {
      hardResetMethod: 'exit',
      ignored: /node_modules|[\/\\]\.|.git|out|dist/
    });

    console.warn(' Electron auto-reload attivato in modalità development');
  } catch (error) {
    console.error(' Errore nell\'attivazione dell\'auto-reload:', error);
  }
}

Promise.resolve().then(async function () {
  try {
    const application = Container.get(Application);
    await application.init();

    console.log('Application fully initialized');
  } catch (error) {
    console.error(`Error initializing application: ${error instanceof Error ? error.message : 'Unknown error'}`)
    console.error(error)
  }
});

process.on('uncaughtException', function (error) {
  console.error(`Uncaught exception: ${error?.message || 'Unknown error'}`);
});

process.on('unhandledRejection', function (reason) {
  console.error(`Unhandled rejection: ${reason || 'Unknown reason'}`);
});

console.log('Application started successfully');