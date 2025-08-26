/**
 * Entry point dell'applicazione Electron
 */

// Implementazione dell'auto-reload in modalità development
// process.env.NODE_ENV è impostato a 'development' quando esegui 'electron-vite dev'
if (process.env.NODE_ENV === 'development') {
  try {
    // Utilizzo di electron-reload per ricaricare l'app quando i file cambiano
    // Non specifichiamo il percorso dell'eseguibile electron per evitare errori
    require('electron-reload')(__dirname, {
      // Forza un riavvio completo dell'app
      hardResetMethod: 'exit',
      // Cartelle da monitorare (potrebbero essere modificate in base alle tue esigenze)
      // Escludiamo node_modules e altri file temporanei
      ignored: /node_modules|[\/\\]\.|.git|out|dist/
    });
    console.log(' Electron auto-reload attivato in modalità development');
  } catch (error) {
    console.error(' Errore nell\'attivazione dell\'auto-reload:', error);
  }
}

// Avvia l'applicazione utilizzando la classe Application
import './Application';

// Nessun altro codice è necessario qui perché tutto è gestito dalla classe Application
