import { User } from './User';
import { Project } from './Project';
import { Tag } from './Tag';
import { ProjectTag } from './ProjectTag';
import { Task } from './Task';
import { TaskTag } from './TaskTag';
import { Attachment } from './Attachment';
import { Note } from './Note';
import { Folder } from './Folder';
import { File } from './File';

export const models = [
  User,
  Project,
  Tag,
  ProjectTag,
  Task,
  TaskTag,
  Attachment,
  Note,
  Folder,
  File
]

export const bindRelationships = (): void => {

  // user <-> project
  User.hasMany(Project, { foreignKey: 'userId', as: 'projects' });
  Project.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // user <-> note
  User.hasMany(Note, { foreignKey: 'userId', as: 'notes' });
  Note.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // user <-> folder
  User.hasMany(Folder, { foreignKey: 'userId', as: 'folders' });
  Folder.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // user <-> file
  User.hasMany(File, { foreignKey: 'userId', as: 'files' });
  File.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // project <-> task
  Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });
  Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

  // project <-> note
  Project.hasMany(Note, { foreignKey: 'projectId', as: 'notes' });
  Note.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

  // project <-> tag
  Project.belongsToMany(Tag, { through: ProjectTag, foreignKey: 'projectId', otherKey: 'tagId', as: 'tags' });
  Tag.belongsToMany(Project, { through: ProjectTag, foreignKey: 'tagId', otherKey: 'projectId', as: 'projects' });

  // task <-> tag
  Task.belongsToMany(Tag, { through: TaskTag, foreignKey: 'taskId', otherKey: 'tagId', as: 'tags' });
  Tag.belongsToMany(Task, { through: TaskTag, foreignKey: 'tagId', otherKey: 'taskId', as: 'tasks' });

  // task <-> attachment
  Task.hasMany(Attachment, { foreignKey: 'taskId', as: 'attachments' });
  Attachment.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

  // folder <-> subfolders
  Folder.hasMany(Folder, { foreignKey: 'parentId', as: 'subfolders' });
  Folder.belongsTo(Folder, { foreignKey: 'parentId', as: 'parent' });

  // folder <-> file
  Folder.hasMany(File, { foreignKey: 'folderId', as: 'files' });
  File.belongsTo(Folder, { foreignKey: 'folderId', as: 'folder' });

  // folder <-> note
  Folder.hasMany(Note, { foreignKey: 'folderId', as: 'notes' });
  Note.belongsTo(Folder, { foreignKey: 'folderId', as: 'folder' });

  // task <-> note
  Task.hasMany(Note, { foreignKey: 'taskId', as: 'notes' });
  Note.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });
};