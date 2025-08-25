import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ipcRenderer } from 'electron';
import { Tag } from './projectsSlice';
import { RootState } from '../index';

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

interface NotesState {
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

const initialState: NotesState = {
  folders: [],
  currentFolder: null,
  files: [],
  notes: [],
  currentNote: null,
  loading: false,
  loadingNotes: false,
  loadingFolders: false,
  error: null,
  breadcrumbs: [],
  filter: {
    tags: [],
    searchTerm: '',
  },
};

// Async thunks for notes actions
export const fetchFolders = createAsyncThunk(
  'notes/fetchFolders',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await ipcRenderer.invoke('folders:getAll', userId);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createFolder = createAsyncThunk(
  'notes/createFolder',
  async (folderData: { name: string; userId: number; parentId?: number }, { rejectWithValue }) => {
    try {
      const response = await ipcRenderer.invoke('folders:create', folderData);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateFolder = createAsyncThunk(
  'notes/updateFolder',
  async (
    { id, name, tags }: { id: number; name?: string; tags?: Tag[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await ipcRenderer.invoke('folders:update', { id, name, tags });
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteFolder = createAsyncThunk(
  'notes/deleteFolder',
  async (folderId: number, { rejectWithValue }) => {
    try {
      const response = await ipcRenderer.invoke('folders:delete', folderId);
      return { id: folderId, ...response };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchFiles = createAsyncThunk(
  'notes/fetchFiles',
  async (folderId: number, { rejectWithValue }) => {
    try {
      const response = await window.api.getFiles(folderId);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return response.files;
    } catch (error) {
      return rejectWithValue('Failed to fetch files.');
    }
  }
);

export const uploadFile = createAsyncThunk(
  'notes/uploadFile',
  async (fileData: {
    filePath: string;
    fileName: string;
    mimeType: string;
    userId: number;
    folderId: number;
    tags?: number[];
  }, { rejectWithValue }) => {
    try {
      const response = await window.api.uploadFile(fileData);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return response.file;
    } catch (error) {
      return rejectWithValue('Failed to upload file.');
    }
  }
);

export const deleteFile = createAsyncThunk(
  'notes/deleteFile',
  async (fileId: number, { rejectWithValue }) => {
    try {
      const response = await window.api.deleteFile(fileId);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return fileId;
    } catch (error) {
      return rejectWithValue('Failed to delete file.');
    }
  }
);

export const fetchNotes = createAsyncThunk(
  'notes/fetchNotes',
  async ({ userId, folderId }: { userId: number; folderId?: number }, { rejectWithValue }) => {
    try {
      const response = await ipcRenderer.invoke('notes:getAll', { userId, folderId });
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createNote = createAsyncThunk(
  'notes/createNote',
  async (noteData: { title: string; content: string; userId: number; folderId?: number }, { rejectWithValue }) => {
    try {
      const response = await ipcRenderer.invoke('notes:create', noteData);
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateNote = createAsyncThunk(
  'notes/updateNote',
  async (
    { id, title, content, folderId }: { id: number; title?: string; content?: string; folderId?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await ipcRenderer.invoke('notes:update', { id, title, content, folderId });
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async (noteId: number, { rejectWithValue }) => {
    try {
      const response = await ipcRenderer.invoke('notes:delete', noteId);
      return noteId;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setCurrentFolder: (state, action: PayloadAction<Folder | null>) => {
      state.currentFolder = action.payload;
    },
    updateBreadcrumbs: (state, action: PayloadAction<Folder[]>) => {
      state.breadcrumbs = action.payload;
    },
    setNoteFilter: (state, action: PayloadAction<{
      tags?: number[];
      searchTerm?: string;
    }>) => {
      if (action.payload.tags !== undefined) state.filter.tags = action.payload.tags;
      if (action.payload.searchTerm !== undefined) state.filter.searchTerm = action.payload.searchTerm;
    },
    clearNoteFilters: (state) => {
      state.filter = {
        tags: [],
        searchTerm: '',
      };
    },
    clearNotesError: (state) => {
      state.error = null;
    },
    setCurrentNote: (state, action: PayloadAction<Note | null>) => {
      state.currentNote = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch folders
    builder.addCase(fetchFolders.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchFolders.fulfilled, (state, action: PayloadAction<Folder[]>) => {
      state.loading = false;
      state.folders = action.payload;
    });
    builder.addCase(fetchFolders.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create folder
    builder.addCase(createFolder.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createFolder.fulfilled, (state, action: PayloadAction<Folder>) => {
      state.loading = false;
      state.folders.push(action.payload);
    });
    builder.addCase(createFolder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update folder
    builder.addCase(updateFolder.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateFolder.fulfilled, (state, action: PayloadAction<Folder>) => {
      state.loading = false;
      state.folders = state.folders.map(folder => 
        folder.id === action.payload.id ? action.payload : folder
      );
      if (state.currentFolder?.id === action.payload.id) {
        state.currentFolder = action.payload;
      }
      // Update breadcrumbs if needed
      state.breadcrumbs = state.breadcrumbs.map(folder => 
        folder.id === action.payload.id ? action.payload : folder
      );
    });
    builder.addCase(updateFolder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete folder
    builder.addCase(deleteFolder.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteFolder.fulfilled, (state, action: PayloadAction<number>) => {
      state.loading = false;
      state.folders = state.folders.filter(folder => folder.id !== action.payload);
      if (state.currentFolder?.id === action.payload) {
        state.currentFolder = null;
      }
      // Update breadcrumbs if needed
      state.breadcrumbs = state.breadcrumbs.filter(folder => folder.id !== action.payload);
    });
    builder.addCase(deleteFolder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch files
    builder.addCase(fetchFiles.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchFiles.fulfilled, (state, action: PayloadAction<File[]>) => {
      state.loading = false;
      state.files = action.payload;
    });
    builder.addCase(fetchFiles.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Upload file
    builder.addCase(uploadFile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(uploadFile.fulfilled, (state, action: PayloadAction<File>) => {
      state.loading = false;
      state.files.push(action.payload);
    });
    builder.addCase(uploadFile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete file
    builder.addCase(deleteFile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteFile.fulfilled, (state, action: PayloadAction<number>) => {
      state.loading = false;
      state.files = state.files.filter(file => file.id !== action.payload);
    });
    builder.addCase(deleteFile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch notes
    builder.addCase(fetchNotes.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchNotes.fulfilled, (state, action: PayloadAction<Note[]>) => {
      state.loading = false;
      state.notes = action.payload;
    });
    builder.addCase(fetchNotes.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create note
    builder.addCase(createNote.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createNote.fulfilled, (state, action: PayloadAction<Note>) => {
      state.loading = false;
      state.notes.push(action.payload);
    });
    builder.addCase(createNote.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update note
    builder.addCase(updateNote.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateNote.fulfilled, (state, action: PayloadAction<Note>) => {
      state.loading = false;
      state.notes = state.notes.map(note => 
        note.id === action.payload.id ? action.payload : note
      );
    });
    builder.addCase(updateNote.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete note
    builder.addCase(deleteNote.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteNote.fulfilled, (state, action: PayloadAction<number>) => {
      state.loading = false;
      state.notes = state.notes.filter(note => note.id !== action.payload);
    });
    builder.addCase(deleteNote.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  setCurrentFolder,
  updateBreadcrumbs,
  setNoteFilter,
  clearNoteFilters,
  clearNotesError,
  setCurrentNote,
} = notesSlice.actions;

// Selectors
export const selectFilteredItems = (state: RootState) => {
  const { folders, files, filter } = state.notes;
  
  const filteredFolders = folders.filter(folder => {
    // Filter by tags
    if (filter.tags.length > 0) {
      const folderTagIds = folder.tags.map(tag => tag.id);
      if (!filter.tags.some(tagId => folderTagIds.includes(tagId))) {
        return false;
      }
    }
    
    // Filter by search term
    if (filter.searchTerm && filter.searchTerm.trim() !== '') {
      const searchTerm = filter.searchTerm.toLowerCase();
      return folder.name.toLowerCase().includes(searchTerm);
    }
    
    return true;
  });
  
  const filteredFiles = files.filter(file => {
    // Filter by tags
    if (filter.tags.length > 0) {
      const fileTagIds = file.tags.map(tag => tag.id);
      if (!filter.tags.some(tagId => fileTagIds.includes(tagId))) {
        return false;
      }
    }
    
    // Filter by search term
    if (filter.searchTerm && filter.searchTerm.trim() !== '') {
      const searchTerm = filter.searchTerm.toLowerCase();
      return file.name.toLowerCase().includes(searchTerm);
    }
    
    return true;
  });
  
  return { folders: filteredFolders, files: filteredFiles };
};

export default notesSlice.reducer;
