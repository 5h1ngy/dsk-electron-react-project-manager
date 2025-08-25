const { spawn } = require('child_process');
const path = require('path');
const electron = require('electron');

// Start Electron with our main file
const electronProcess = spawn(electron, [path.join(__dirname, 'dist/electron/main/index.js')], {
  stdio: 'inherit',
  env: { ...process.env, ELECTRON_IS_DEV: '0' },
});

electronProcess.on('close', (code) => {
  console.log(`Electron process exited with code ${code}`);
  process.exit(code);
});
