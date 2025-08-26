// Importazioni per sequelize-typescript
import { Sequelize } from 'sequelize-typescript';

// Importiamo ancora i modelli per l'esportazione, ma non per l'inizializzazione
import { User } from './User';
import { Project } from './Project';
import { Task } from './Task';
import { Tag } from './Tag';
import { Note } from './Note';
import { Folder } from './Folder';
import { File } from './File';
import { Attachment } from './Attachment';
import { ProjectTag } from './ProjectTag';

/**
 * Funzione per inizializzare i modelli con sequelize-typescript
 * @param sequelize Istanza di Sequelize da utilizzare
 */
export const initializeModels = (sequelize: Sequelize): void => {
  // Con sequelize-typescript, non è necessario definire manualmente le relazioni
  // Invece, registriamo tutti i modelli all'istanza di Sequelize
  // Utilizziamo la notazione esplicita del percorso per assicurarci che sequelize-typescript
  // trovi e carichi correttamente tutti i modelli
  sequelize.addModels([
    __dirname + '/User.ts',
    __dirname + '/Project.ts',
    __dirname + '/Task.ts',
    __dirname + '/Tag.ts',
    __dirname + '/Note.ts',
    __dirname + '/Folder.ts',
    __dirname + '/File.ts',
    __dirname + '/Attachment.ts',
    __dirname + '/ProjectTag.ts'
  ]);

  // Le relazioni sono già definite nei modelli stessi tramite i decoratori
  // quindi non c'è bisogno di definirle qui
  
  // Questo consente a sequelize-typescript di gestire automaticamente
  // la configurazione del database e le relazioni tra i modelli
};

/**
 * Esporta i modelli per poterli utilizzare in altre parti dell'applicazione
 */
export {
  User,
  Project,
  Task,
  Tag,
  Note,
  Folder,
  File,
  Attachment,
  ProjectTag
};
