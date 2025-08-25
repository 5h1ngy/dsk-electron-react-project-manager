// Script per avviare l'app Electron direttamente dai file TypeScript
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const electron = require('electron');

// Installa ts-node se necessario in modo automatico
try {
  require.resolve('ts-node');
} catch (e) {
  console.log('Installazione di ts-node necessaria per lo sviluppo...');
  require('child_process').execSync('npm install -D ts-node', { stdio: 'inherit' });
}

// Registra ts-node per gestire i file .ts
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    target: 'es2021',
  }
});

// Avvia Electron con il file TypeScript direttamente
const electronProcess = spawn(electron, [path.join(__dirname, 'electron/main/index.ts')], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    TS_NODE_PROJECT: path.join(__dirname, 'electron/tsconfig.json')
  }
});

electronProcess.on('close', (code) => {
  console.log(`Electron process exited with code ${code}`);
  process.exit(code);
});
