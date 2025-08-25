import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // Auth
  register: (userData: { username: string; email: string; password: string }) => 
    ipcRenderer.invoke('auth:register', userData),
  login: (loginData: { username: string; password: string }) => 
    ipcRenderer.invoke('auth:login', loginData),
  
  // Projects
  getProjects: (userId: number) => 
    ipcRenderer.invoke('projects:getAll', userId),
  createProject: (projectData: { name: string; description?: string; userId: number; tags?: number[] }) => 
    ipcRenderer.invoke('projects:create', projectData),
  updateProject: (projectData: { id: number; name?: string; description?: string; tags?: number[] }) => 
    ipcRenderer.invoke('projects:update', projectData),
  deleteProject: (projectId: number) => 
    ipcRenderer.invoke('projects:delete', projectId),
  getProjectStats: (projectId: number) => 
    ipcRenderer.invoke('projects:getStats', projectId),
  
  // Tasks
  getTasks: (projectId: number) => 
    ipcRenderer.invoke('tasks:getByProject', projectId),
  createTask: (taskData: any) => 
    ipcRenderer.invoke('tasks:create', taskData),
  updateTask: (taskData: any) => 
    ipcRenderer.invoke('tasks:update', taskData),
  deleteTask: (taskId: number) => 
    ipcRenderer.invoke('tasks:delete', taskId),
  uploadAttachment: (attachmentData: any) => 
    ipcRenderer.invoke('tasks:uploadAttachment', attachmentData),
  deleteAttachment: (attachmentId: number) => 
    ipcRenderer.invoke('tasks:deleteAttachment', attachmentId),
  getAttachment: (attachmentId: number) => 
    ipcRenderer.invoke('tasks:getAttachment', attachmentId),
  
  // Notes
  getFolders: (userId: number, parentId?: number) => 
    ipcRenderer.invoke('notes:getFolders', userId, parentId),
  createFolder: (folderData: any) => 
    ipcRenderer.invoke('notes:createFolder', folderData),
  updateFolder: (folderData: any) => 
    ipcRenderer.invoke('notes:updateFolder', folderData),
  deleteFolder: (folderId: number) => 
    ipcRenderer.invoke('notes:deleteFolder', folderId),
  getFiles: (folderId: number) => 
    ipcRenderer.invoke('notes:getFiles', folderId),
  uploadFile: (fileData: any) => 
    ipcRenderer.invoke('notes:uploadFile', fileData),
  deleteFile: (fileId: number) => 
    ipcRenderer.invoke('notes:deleteFile', fileId),
  getFileData: (fileId: number) => 
    ipcRenderer.invoke('notes:getFileData', fileId),
  getNotes: (folderId: number) => 
    ipcRenderer.invoke('notes:getNotes', folderId),
  createNote: (noteData: any) => 
    ipcRenderer.invoke('notes:createNote', noteData),
  updateNote: (noteData: any) => 
    ipcRenderer.invoke('notes:updateNote', noteData),
  deleteNote: (noteId: number) => 
    ipcRenderer.invoke('notes:deleteNote', noteId),
  
  // Database
  exportDatabase: () => 
    ipcRenderer.invoke('database:export'),
  importDatabase: () => 
    ipcRenderer.invoke('database:import'),
  cleanupDatabase: () => 
    ipcRenderer.invoke('database:cleanup'),
  
  // File dialogs
  selectFile: async (options: any) => {
    return ipcRenderer.invoke('dialog:selectFile', options);
  },
});
