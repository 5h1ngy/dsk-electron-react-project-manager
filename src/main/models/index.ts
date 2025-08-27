// Importazioni per sequelize-typescript
import { Sequelize } from 'sequelize-typescript';

// Importiamo ancora i modelli per l'esportazione, ma non per l'inizializzazione
import { User } from './User';
import { Task } from './Task';
import { Tag } from './Tag';
import { Attachment } from './Attachment';
import { ProjectTag } from './ProjectTag';
import { Project } from './Project';
import { Note } from './Note';
import { Folder } from './Folder';
import { File } from './File';


export const initializeModels = (sequelize: Sequelize): void => {

  sequelize.addModels([
    User, Task, Tag,
    Attachment, ProjectTag, Project,
    Note, Folder, File
  ]);

  // Esempi di relazioni user <-> project
  User.hasMany(Project, { foreignKey: 'userId', as: 'projects' })
  Project.belongsTo(User, { foreignKey: 'userId', as: 'user' })

  // user <-> note
  User.hasMany(Note, { foreignKey: 'userId', as: 'notes' })
  Note.belongsTo(User, { foreignKey: 'userId', as: 'user' })

  // project <-> task
  Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' })
  Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' })

  // project <-> note
  Project.hasMany(Note, { foreignKey: 'projectId', as: 'notes' })
  Note.belongsTo(Project, { foreignKey: 'projectId', as: 'project' })

  // project <-> tag (relazione N:N via ProjectTag)
  Project.belongsToMany(Tag, { through: ProjectTag, foreignKey: 'projectId', as: 'tags', })
  Tag.belongsToMany(Project, { through: ProjectTag, foreignKey: 'tagId', as: 'projects', })

  // task <-> tag (relazione N:N con tabella intermedia "TaskTags")
  Task.belongsToMany(Tag, { through: 'TaskTags', foreignKey: 'taskId', as: 'tags', })
  Tag.belongsToMany(Task, { through: 'TaskTags', foreignKey: 'tagId', as: 'tasks', })

  // task <-> attachment (1:N)
  Task.hasMany(Attachment, { foreignKey: 'taskId', as: 'attachments' })
  Attachment.belongsTo(Task, { foreignKey: 'taskId', as: 'task' })

  // folder <-> subfolders (auto-relazione 1:N)
  Folder.hasMany(Folder, { foreignKey: 'parentId', as: 'subfolders' })
  Folder.belongsTo(Folder, { foreignKey: 'parentId', as: 'parent' })

  // folder <-> file (1:N)
  Folder.hasMany(File, { foreignKey: 'folderId', as: 'files' })
  File.belongsTo(Folder, { foreignKey: 'folderId', as: 'folder' })

  // user <-> folder
  User.hasMany(Folder, { foreignKey: 'userId', as: 'folders' })
  Folder.belongsTo(User, { foreignKey: 'userId', as: 'user' })

  // user <-> file
  User.hasMany(File, { foreignKey: 'userId', as: 'files' })
  File.belongsTo(User, { foreignKey: 'userId', as: 'user' })

  // note <-> folder
  Folder.hasMany(Note, { foreignKey: 'folderId', as: 'notes' })
  Note.belongsTo(Folder, { foreignKey: 'folderId', as: 'folder' })

  // note <-> task
  Task.hasMany(Note, { foreignKey: 'taskId', as: 'notes' })
  Note.belongsTo(Task, { foreignKey: 'taskId', as: 'task' })
};

export {
  User,
  Task,
  Tag,
  Attachment,
  ProjectTag,
  Project,
  Note,
  Folder,
  File,
};
