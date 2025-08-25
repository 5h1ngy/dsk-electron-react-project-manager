const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Percorsi importanti
const cwd = process.cwd();
const outputDir = path.join(cwd, 'dist', 'electron', 'main');

// Assicuriamoci che la directory di output esista
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Invece di compilare TypeScript, copiamo i file originali
// e convertiamoli in JavaScript in modo semplice

const electronMainDir = path.join(cwd, 'electron', 'main');
console.log(`Copiando e convertendo i file da ${electronMainDir} a ${outputDir}`);

// Funzione ricorsiva per copiare tutti i file
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.name.endsWith('.ts')) {
      // Converti .ts in .js
      const jsContent = fs.readFileSync(srcPath, 'utf8')
        .replace(/import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g, 'const {$1} = require("$2")')
        .replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g, 'const $1 = require("$2")')
        .replace(/export\s+const/g, 'exports.')
        .replace(/export\s+function/g, 'exports.')
        .replace(/export\s+default/g, 'module.exports =')
        .replace(/export\s+{([^}]+)}/g, 'module.exports = {$1}')
        .replace(/\.\.\//g, '../') // Mantieni le importazioni relative
        .replace(/\.ts/g, '.js'); // Cambia estensioni da .ts a .js
      
      // Scrivi il file .js con estensione .js invece di .ts
      fs.writeFileSync(destPath.replace('.ts', '.js'), jsContent);
    } else {
      // Copia semplicemente i file non-TypeScript
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  // Copia e converti i file TS in JS
  copyDir(electronMainDir, outputDir);
  
  // Crea un file preload di base
  const preloadDir = path.join(cwd, 'dist', 'electron', 'preload');
  if (!fs.existsSync(preloadDir)) {
    fs.mkdirSync(preloadDir, { recursive: true });
  }
  
  const preloadContent = `
// preload.js semplificato
const { contextBridge, ipcRenderer } = require('electron');

// API esposte al renderer
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: ipcRenderer,
});

// Esporre le API specifiche dell'app
contextBridge.exposeInMainWorld('api', {
  // Auth
  register: (userData) => ipcRenderer.invoke('auth:register', userData),
  login: (loginData) => ipcRenderer.invoke('auth:login', loginData),
  // Projects
  getProjects: (userId) => ipcRenderer.invoke('projects:getAll', userId),
  createProject: (projectData) => ipcRenderer.invoke('projects:create', projectData),
  updateProject: (projectData) => ipcRenderer.invoke('projects:update', projectData),
  deleteProject: (projectId) => ipcRenderer.invoke('projects:delete', projectId),
  // Tasks
  getTasks: (projectId) => ipcRenderer.invoke('tasks:getAll', projectId),
  createTask: (taskData) => ipcRenderer.invoke('tasks:create', taskData),
  updateTask: (taskData) => ipcRenderer.invoke('tasks:update', taskData),
  deleteTask: (taskId) => ipcRenderer.invoke('tasks:delete', taskId),
  // Notes
  getFolders: (userId) => ipcRenderer.invoke('folders:getAll', userId),
  createFolder: (folderData) => ipcRenderer.invoke('folders:create', folderData),
  updateFolder: (folderData) => ipcRenderer.invoke('folders:update', folderData),
  deleteFolder: (folderId) => ipcRenderer.invoke('folders:delete', folderId),
  getNotes: (folderId) => ipcRenderer.invoke('notes:getAll', folderId),
  createNote: (noteData) => ipcRenderer.invoke('notes:create', noteData),
  updateNote: (noteData) => ipcRenderer.invoke('notes:update', noteData),
  deleteNote: (noteId) => ipcRenderer.invoke('notes:delete', noteId),
});
  `;
  
  fs.writeFileSync(path.join(preloadDir, 'index.js'), preloadContent);
  
  console.log('Build Electron completata con successo!');
} catch (error) {
  console.error('Errore durante la build di Electron:', error);
  process.exit(1);
}
