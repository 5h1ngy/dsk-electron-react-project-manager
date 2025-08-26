import { Op } from 'sequelize';
import { User } from '../database/models/User';
import { Project } from '../database/models/Project';
import { Task } from '../database/models/Task';
import { Folder } from '../database/models/Folder';
import { File } from '../database/models/File';
import { Note } from '../database/models/Note';
import fs from 'fs';
import path from 'path';
import { app } from 'electron';

/**
 * Service responsible for database cleanup operations
 */
export class DatabaseCleanupService {
  private static instance: DatabaseCleanupService;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): DatabaseCleanupService {
    if (!DatabaseCleanupService.instance) {
      DatabaseCleanupService.instance = new DatabaseCleanupService();
    }
    return DatabaseCleanupService.instance;
  }

  /**
   * Cleanup database by resolving common issues
   * - Remove orphaned references (entities pointing to non-existing records)
   * - Verify referential integrity constraints
   * - Remove files on disk that don't have a match in the database
   */
  public async cleanupDatabase(): Promise<{ success: boolean; deletedItems: any; message: string }> {
    try {
      console.log('Starting database cleanup...');
      const deletedItems = {
        orphanedProjects: 0,
        orphanedTasks: 0,
        orphanedFolders: 0,
        orphanedFiles: 0,
        orphanedNotes: 0,
        missingFiles: 0
      };

      // 1. Find and remove orphaned projects (referencing users that don't exist)
      const orphanedProjects = await Project.findAll({
        where: {},
        include: [{ model: User, required: false }]
      });

      for (const project of orphanedProjects) {
        if (!project.get('User')) {
          await project.destroy();
          deletedItems.orphanedProjects++;
        }
      }

      // 2. Find and remove orphaned tasks (referencing projects that don't exist)
      const orphanedTasks = await Task.findAll({
        where: {},
        include: [{ model: Project, required: false }]
      });

      for (const task of orphanedTasks) {
        if (!task.get('Project')) {
          await task.destroy();
          deletedItems.orphanedTasks++;
        }
      }

      // 3. Find and remove orphaned folders (referencing projects that don't exist)
      const orphanedFolders = await Folder.findAll({
        where: {},
        include: [{ model: Project, required: false }]
      });

      for (const folder of orphanedFolders) {
        if (!folder.get('Project')) {
          await folder.destroy();
          deletedItems.orphanedFolders++;
        }
      }

      // 4. Find and remove orphaned files (referencing folders that don't exist)
      const orphanedFiles = await File.findAll({
        where: {},
        include: [{ model: Folder, required: false }]
      });

      for (const file of orphanedFiles) {
        if (!file.get('Folder')) {
          await file.destroy();
          deletedItems.orphanedFiles++;
        }
      }

      // 5. Find and remove orphaned notes (referencing projects or tasks that don't exist)
      const orphanedNotes = await Note.findAll({
        where: {
          [Op.or]: [
            { projectId: { [Op.not]: null } },
            { taskId: { [Op.not]: null } }
          ]
        },
        include: [
          { model: Project, required: false },
          { model: Task, required: false }
        ]
      });

      for (const note of orphanedNotes) {
        const projectId = note.get('projectId');
        const taskId = note.get('taskId');
        
        const hasInvalidReference = 
          (projectId && !note.get('Project')) || 
          (taskId && !note.get('Task'));
        
        if (hasInvalidReference) {
          await note.destroy();
          deletedItems.orphanedNotes++;
        }
      }

      // 6. Check for files on disk that don't have a database reference
      if (app.isReady()) {
        const userDataPath = app.getPath('userData');
        const filesPath = path.join(userDataPath, 'files');
        
        if (fs.existsSync(filesPath)) {
          const filesOnDisk = fs.readdirSync(filesPath);
          
          for (const fileOnDisk of filesOnDisk) {
            const fileId = path.basename(fileOnDisk);
            const file = await File.findByPk(fileId);
            
            if (!file) {
              try {
                fs.unlinkSync(path.join(filesPath, fileOnDisk));
                deletedItems.missingFiles++;
              } catch (error) {
                console.error(`Failed to delete orphaned file: ${fileOnDisk}`, error);
              }
            }
          }
        }
      }

      console.log('Database cleanup completed successfully');
      return {
        success: true,
        deletedItems,
        message: 'Database cleanup completed successfully'
      };
    } catch (error: any) {
      console.error('Error during database cleanup:', error);
      return {
        success: false,
        deletedItems: null,
        message: `Error during database cleanup: ${error?.message || 'Unknown error'}`
      };
    }
  }
}

export default DatabaseCleanupService.getInstance();
