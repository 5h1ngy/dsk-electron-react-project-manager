import { Sequelize } from 'sequelize';
import { initUser } from './User';
import { initProject } from './Project';
import { initTask } from './Task';
import { initTag } from './Tag';
import { initNote } from './Note';
import { initFolder } from './Folder';
import { initFile } from './File';
import { initAttachment } from './Attachment';

export const initializeModels = (sequelize: Sequelize) => {
  // Initialize all models
  const User = initUser(sequelize);
  const Project = initProject(sequelize);
  const Task = initTask(sequelize);
  const Tag = initTag(sequelize);
  const Note = initNote(sequelize);
  const Folder = initFolder(sequelize);
  const File = initFile(sequelize);
  const Attachment = initAttachment(sequelize);

  // Define relationships
  
  // User relationships
  User.hasMany(Project, { foreignKey: 'userId', as: 'projects' });
  Project.belongsTo(User, { foreignKey: 'userId' });
  
  // Project relationships
  Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });
  Task.belongsTo(Project, { foreignKey: 'projectId' });
  
  // Project-Tag relationships (many-to-many)
  Project.belongsToMany(Tag, { through: 'ProjectTags', as: 'tags' });
  Tag.belongsToMany(Project, { through: 'ProjectTags', as: 'projects' });
  
  // Task relationships
  Task.belongsToMany(Tag, { through: 'TaskTags', as: 'tags' });
  Tag.belongsToMany(Task, { through: 'TaskTags', as: 'tasks' });
  
  Task.hasMany(Attachment, { foreignKey: 'taskId', as: 'attachments' });
  Attachment.belongsTo(Task, { foreignKey: 'taskId' });
  
  // Notes and folders relationships
  User.hasMany(Folder, { foreignKey: 'userId', as: 'rootFolders' });
  Folder.belongsTo(User, { foreignKey: 'userId' });
  
  Folder.hasMany(Folder, { foreignKey: 'parentId', as: 'subfolders' });
  Folder.belongsTo(Folder, { foreignKey: 'parentId', as: 'parent' });
  
  Folder.hasMany(File, { foreignKey: 'folderId', as: 'files' });
  File.belongsTo(Folder, { foreignKey: 'folderId' });
  
  Folder.belongsToMany(Tag, { through: 'FolderTags', as: 'tags' });
  Tag.belongsToMany(Folder, { through: 'FolderTags', as: 'folders' });
  
  File.belongsToMany(Tag, { through: 'FileTags', as: 'tags' });
  Tag.belongsToMany(File, { through: 'FileTags', as: 'files' });
  
  // Return all models
  return {
    User,
    Project,
    Task,
    Tag,
    Note,
    Folder,
    File,
    Attachment
  };
};
