import { ipcMain } from 'electron';
import { Note } from '../database/models/Note';
import { Folder } from '../database/models/Folder';
import { File } from '../database/models/File';
import { Tag } from '../database/models/Tag';
import { Op } from 'sequelize';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

export const registerNotesHandlers = () => {
  // Get all folders for a user (including root folders)
  ipcMain.handle('notes:getFolders', async (_, userId: number, parentId?: number) => {
    try {
      const where: any = { userId };
      if (parentId !== undefined) {
        where.parentId = parentId;
      }
      
      const folders = await Folder.findAll({
        where,
        include: [
          {
            model: Tag,
            as: 'tags',
            through: { attributes: [] }
          }
        ],
        order: [['name', 'ASC']]
      });
      
      return {
        success: true,
        folders
      };
    } catch (error) {
      console.error('Error fetching folders:', error);
      return {
        success: false,
        message: 'Failed to fetch folders'
      };
    }
  });
  
  // Create a new folder
  ipcMain.handle('notes:createFolder', async (_, folderData: {
    name: string;
    userId: number;
    parentId?: number;
    tags?: number[];
  }) => {
    try {
      const { name, userId, parentId, tags } = folderData;
      
      // Create the folder
      const folder = await Folder.create({
        name,
        userId,
        parentId: parentId || null
      });
      
      // Add tags if provided
      if (tags && tags.length > 0) {
        const tagInstances = await Tag.findAll({
          where: {
            id: {
              [Op.in]: tags
            }
          }
        });
        
        await folder.$set('tags', tagInstances);
      }
      
      // Fetch the folder with its tags
      const createdFolder = await Folder.findByPk(folder.id, {
        include: [
          {
            model: Tag,
            as: 'tags',
            through: { attributes: [] }
          }
        ]
      });
      
      return {
        success: true,
        folder: createdFolder
      };
    } catch (error) {
      console.error('Error creating folder:', error);
      return {
        success: false,
        message: 'Failed to create folder'
      };
    }
  });
  
  // Update a folder
  ipcMain.handle('notes:updateFolder', async (_, folderData: {
    id: number;
    name?: string;
    parentId?: number | null;
    tags?: number[];
  }) => {
    try {
      const { id, name, parentId, tags } = folderData;
      
      const folder = await Folder.findByPk(id);
      
      if (!folder) {
        return {
          success: false,
          message: 'Folder not found'
        };
      }
      
      // Update basic info
      if (name) folder.name = name;
      if (parentId !== undefined) folder.parentId = parentId;
      
      await folder.save();
      
      // Update tags if provided
      if (tags) {
        const tagInstances = await Tag.findAll({
          where: {
            id: {
              [Op.in]: tags
            }
          }
        });
        
        await folder.$set('tags', tagInstances);
      }
      
      // Fetch the updated folder with its tags
      const updatedFolder = await Folder.findByPk(id, {
        include: [
          {
            model: Tag,
            as: 'tags',
            through: { attributes: [] }
          }
        ]
      });
      
      return {
        success: true,
        folder: updatedFolder
      };
    } catch (error) {
      console.error('Error updating folder:', error);
      return {
        success: false,
        message: 'Failed to update folder'
      };
    }
  });
  
  // Delete a folder and its contents
  ipcMain.handle('notes:deleteFolder', async (_, folderId: number) => {
    try {
      const folder = await Folder.findByPk(folderId);
      
      if (!folder) {
        return {
          success: false,
          message: 'Folder not found'
        };
      }
      
      // Recursively delete all subfolders and their files
      const deleteFolder = async (id: number) => {
        // Get all subfolders
        const subfolders = await Folder.findAll({ where: { parentId: id } });
        
        // Recursively delete each subfolder
        for (const subfolder of subfolders) {
          await deleteFolder(subfolder.id);
        }
        
        // Delete files in this folder
        const files = await File.findAll({ where: { folderId: id } });
        
        // Delete file data
        for (const file of files) {
          try {
            fs.unlinkSync(file.path);
          } catch (err) {
            console.error(`Error deleting file: ${file.path}`, err);
          }
        }
        
        // Delete file records
        await File.destroy({ where: { folderId: id } });
        
        // Delete notes in this folder
        await Note.destroy({ where: { folderId: id } });
        
        // Delete the folder itself
        await Folder.destroy({ where: { id } });
      };
      
      await deleteFolder(folderId);
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting folder:', error);
      return {
        success: false,
        message: 'Failed to delete folder'
      };
    }
  });
  
  // Get files in a folder
  ipcMain.handle('notes:getFiles', async (_, folderId: number) => {
    try {
      const files = await File.findAll({
        where: { folderId },
        include: [
          {
            model: Tag,
            as: 'tags',
            through: { attributes: [] }
          }
        ],
        order: [['name', 'ASC']]
      });
      
      return {
        success: true,
        files
      };
    } catch (error) {
      console.error('Error fetching files:', error);
      return {
        success: false,
        message: 'Failed to fetch files'
      };
    }
  });
  
  // Upload a file
  ipcMain.handle('notes:uploadFile', async (_, fileData: {
    filePath: string;
    fileName: string;
    mimeType: string;
    userId: number;
    folderId: number;
    tags?: number[];
  }) => {
    try {
      const { filePath, fileName, mimeType, userId, folderId, tags } = fileData;
      
      // Create files directory if it doesn't exist
      const filesDir = path.join(app.getPath('userData'), 'files');
      if (!fs.existsSync(filesDir)) {
        fs.mkdirSync(filesDir, { recursive: true });
      }
      
      // Copy file with unique name
      const uniqueFileName = `${Date.now()}-${fileName}`;
      const targetPath = path.join(filesDir, uniqueFileName);
      
      fs.copyFileSync(filePath, targetPath);
      
      // Get file size
      const stats = fs.statSync(targetPath);
      
      // Create file record
      const file = await File.create({
        name: fileName,
        path: targetPath,
        mimeType,
        size: stats.size,
        userId,
        folderId
      });
      
      // Add tags if provided
      if (tags && tags.length > 0) {
        const tagInstances = await Tag.findAll({
          where: {
            id: {
              [Op.in]: tags
            }
          }
        });
        
        await file.$set('tags', tagInstances);
      }
      
      // Fetch the file with its tags
      const uploadedFile = await File.findByPk(file.id, {
        include: [
          {
            model: Tag,
            as: 'tags',
            through: { attributes: [] }
          }
        ]
      });
      
      return {
        success: true,
        file: uploadedFile
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        message: 'Failed to upload file'
      };
    }
  });
  
  // Delete a file
  ipcMain.handle('notes:deleteFile', async (_, fileId: number) => {
    try {
      const file = await File.findByPk(fileId);
      
      if (!file) {
        return {
          success: false,
          message: 'File not found'
        };
      }
      
      // Delete file data
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error(`Error deleting file: ${file.path}`, err);
      }
      
      // Delete file record
      await file.destroy();
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting file:', error);
      return {
        success: false,
        message: 'Failed to delete file'
      };
    }
  });
  
  // Get file data
  ipcMain.handle('notes:getFileData', async (_, fileId: number) => {
    try {
      const file = await File.findByPk(fileId);
      
      if (!file) {
        return {
          success: false,
          message: 'File not found'
        };
      }
      
      // Read file data
      const fileData = fs.readFileSync(file.path);
      
      return {
        success: true,
        file: {
          id: file.id,
          name: file.name,
          mimeType: file.mimeType,
          size: file.size,
          data: fileData.toString('base64')
        }
      };
    } catch (error) {
      console.error('Error getting file data:', error);
      return {
        success: false,
        message: 'Failed to get file data'
      };
    }
  });
  
  // Get notes in a folder
  ipcMain.handle('notes:getNotes', async (_, folderId: number) => {
    try {
      const notes = await Note.findAll({
        where: { folderId },
        order: [['updatedAt', 'DESC']]
      });
      
      return {
        success: true,
        notes
      };
    } catch (error) {
      console.error('Error fetching notes:', error);
      return {
        success: false,
        message: 'Failed to fetch notes'
      };
    }
  });
  
  // Create a note
  ipcMain.handle('notes:createNote', async (_, noteData: {
    title: string;
    content: string;
    userId: number;
    folderId: number;
  }) => {
    try {
      const { title, content, userId, folderId } = noteData;
      
      // Create the note
      const note = await Note.create({
        title,
        content,
        userId,
        folderId
      });
      
      return {
        success: true,
        note
      };
    } catch (error) {
      console.error('Error creating note:', error);
      return {
        success: false,
        message: 'Failed to create note'
      };
    }
  });
  
  // Update a note
  ipcMain.handle('notes:updateNote', async (_, noteData: {
    id: number;
    title?: string;
    content?: string;
    folderId?: number;
  }) => {
    try {
      const { id, title, content, folderId } = noteData;
      
      const note = await Note.findByPk(id);
      
      if (!note) {
        return {
          success: false,
          message: 'Note not found'
        };
      }
      
      // Update fields
      if (title) note.title = title;
      if (content !== undefined) note.content = content;
      if (folderId) note.folderId = folderId;
      
      await note.save();
      
      return {
        success: true,
        note
      };
    } catch (error) {
      console.error('Error updating note:', error);
      return {
        success: false,
        message: 'Failed to update note'
      };
    }
  });
  
  // Delete a note
  ipcMain.handle('notes:deleteNote', async (_, noteId: number) => {
    try {
      const note = await Note.findByPk(noteId);
      
      if (!note) {
        return {
          success: false,
          message: 'Note not found'
        };
      }
      
      await note.destroy();
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting note:', error);
      return {
        success: false,
        message: 'Failed to delete note'
      };
    }
  });
};
