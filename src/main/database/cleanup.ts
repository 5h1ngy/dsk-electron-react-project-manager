import { Op } from 'sequelize';
import { User } from './models/User';
import { Project } from './models/Project';
import { Task } from './models/Task';
import { Folder } from './models/Folder';
import { File } from './models/File';
import { Note } from './models/Note';
import fs from 'fs';
import path from 'path';
import { app } from 'electron';

/**
 * Funzione di pulizia del database che risolve vari problemi comuni
 * - Rimuove i riferimenti orfani (entità che puntano a record non esistenti)
 * - Verifica i vincoli di integrità referenziale
 * - Rimuove i file su disco che non hanno corrispondenza nel database
 */
export const cleanupDatabase = async (): Promise<{ success: boolean; deletedItems: any; message: string }> => {
  try {
    console.log('Avvio della pulizia del database...');
    const deletedItems = {
      orphanedProjects: 0,
      orphanedTasks: 0,
      orphanedFolders: 0,
      orphanedFiles: 0,
      orphanedNotes: 0,
      missingFiles: 0
    };

    // 1. Trova e rimuovi i progetti orfani (che fanno riferimento a utenti che non esistono)
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

    // 2. Trova e rimuovi le attività orfane (che fanno riferimento a progetti che non esistono)
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

    // 3. Trova e rimuovi le cartelle orfane (che fanno riferimento a utenti che non esistono)
    const orphanedFolders = await Folder.findAll({
      where: {},
      include: [{ model: User, required: false }]
    });

    for (const folder of orphanedFolders) {
      if (!folder.get('User')) {
        await folder.destroy();
        deletedItems.orphanedFolders++;
      }
    }

    // 4. Trova e rimuovi le note orfane (che fanno riferimento a cartelle che non esistono)
    const orphanedNotes = await Note.findAll({
      where: { folderId: { [Op.ne]: null } },
      include: [{ model: Folder, required: false }]
    });

    for (const note of orphanedNotes) {
      if (!note.get('Folder')) {
        await note.destroy();
        deletedItems.orphanedNotes++;
      }
    }

    // 5. Trova e rimuovi i file orfani (che fanno riferimento a cartelle che non esistono)
    const orphanedFiles = await File.findAll({
      where: { folderId: { [Op.ne]: null } },
      include: [{ model: Folder, required: false }]
    });

    for (const file of orphanedFiles) {
      if (!file.get('Folder')) {
        // Elimina anche il file fisico
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (err) {
          console.error(`Errore durante l'eliminazione del file: ${file.path}`, err);
        }
        
        await file.destroy();
        deletedItems.orphanedFiles++;
      }
    }

    // 6. Verifica l'integrità dei file fisici rispetto ai record del database
    const filesDir = path.join(app.getPath('userData'), 'files');
    if (fs.existsSync(filesDir)) {
      const files = await File.findAll();
      const dbFilePaths = files.map(file => file.path);
      
      // Leggi tutti i file nella directory dei file
      const physicalFiles = fs.readdirSync(filesDir)
        .filter(filename => filename !== '.gitkeep' && !filename.startsWith('.'))
        .map(filename => path.join(filesDir, filename));
      
      // Trova file che esistono sul disco ma non nel database
      for (const filePath of physicalFiles) {
        if (!dbFilePaths.includes(filePath)) {
          try {
            fs.unlinkSync(filePath);
            deletedItems.missingFiles++;
          } catch (err) {
            console.error(`Errore durante l'eliminazione del file fisico: ${filePath}`, err);
          }
        }
      }
    }

    console.log('Pulizia del database completata:', deletedItems);
    
    return { 
      success: true, 
      deletedItems,
      message: `Pulizia completata: rimossi ${Object.values(deletedItems).reduce((a, b) => a + b, 0)} elementi problematici`
    };
  } catch (error) {
    console.error('Errore durante la pulizia del database:', error);
    return { 
      success: false, 
      deletedItems: null,
      message: `Errore durante la pulizia: ${(error as Error).message}`
    };
  }
};
