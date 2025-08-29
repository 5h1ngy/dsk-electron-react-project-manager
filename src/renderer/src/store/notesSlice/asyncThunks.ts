import { createAsyncThunk } from "@reduxjs/toolkit";
import { Tag } from "../projectsSlice/projectsSlice";

export const fetchFolders = createAsyncThunk(
  'notes/fetchFolders',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await window.api.getFolders(userId);
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
      const response = await window.api.createFolder(folderData);
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
      const response = await window.api.updateFolder({ id, name, tags });
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
      const response = await window.api.deleteFolder(folderId);
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
  async ({ folderId }: { userId: number; folderId?: number }, { rejectWithValue }) => {
    try {
      const response = await window.api.getFiles(folderId);
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
      const response = await window.api.uploadFile(noteData);
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
      const response = await window.api.updateFile({ id, title, content, folderId });
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
      // const response = await window.api.deleteFile(noteId);
      return noteId;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);