import { Tag } from '../projectsSlice/projectsSlice';

export interface Note {
  id: number;
  title: string;
  content: string;
  userId: number;
  folderId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: number;
  name: string;
  userId: number;
  parentId: number | null;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface File {
  id: number;
  name: string;
  path: string;
  mimeType: string;
  size: number;
  userId: number;
  folderId: number | null;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface NotesState {
  folders: Folder[];
  currentFolder: Folder | null;
  files: File[];
  notes: Note[];
  currentNote: Note | null;
  loading: boolean;
  loadingNotes: boolean;
  loadingFolders: boolean;
  error: string | null;
  breadcrumbs: Folder[];
  filter: {
    tags: number[];
    searchTerm: string;
  };
}