import { ActionReducerMapBuilder, PayloadAction } from '@reduxjs/toolkit';
import { NotesState, Folder, Note, File } from "./types";
import { fetchFolders, createFolder, updateFolder, deleteFolder, fetchFiles, uploadFile, deleteFile, fetchNotes, createNote, updateNote, deleteNote } from './asyncThunks';

export default (builder: ActionReducerMapBuilder<NotesState>) => {
    
    // Fetch folders
    builder.addCase(fetchFolders.pending, (state: NotesState) => {
        state.loading = true;
        state.error = null;
    });
    builder.addCase(fetchFolders.fulfilled, (state: NotesState, action: PayloadAction<Folder[]>) => {
        state.loading = false;
        state.folders = action.payload;
    });
    builder.addCase(fetchFolders.rejected, (state: NotesState, action) => {
        state.loading = false;
        state.error = action.payload as string;
    });

    // Create folder
    builder.addCase(createFolder.pending, (state: NotesState) => {
        state.loading = true;
        state.error = null;
    });
    builder.addCase(createFolder.fulfilled, (state: NotesState, action: PayloadAction<Folder>) => {
        state.loading = false;
        state.folders.push(action.payload);
    });
    builder.addCase(createFolder.rejected, (state: NotesState, action) => {
        state.loading = false;
        state.error = action.payload as string;
    });

    // Update folder
    builder.addCase(updateFolder.pending, (state: NotesState) => {
        state.loading = true;
        state.error = null;
    });
    builder.addCase(updateFolder.fulfilled, (state: NotesState, action: PayloadAction<Folder>) => {
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
    builder.addCase(updateFolder.rejected, (state: NotesState, action) => {
        state.loading = false;
        state.error = action.payload as string;
    });

    // Delete folder
    builder.addCase(deleteFolder.pending, (state: NotesState) => {
        state.loading = true;
        state.error = null;
    });
    builder.addCase(deleteFolder.fulfilled, (state: NotesState, action: PayloadAction<number>) => {
        state.loading = false;
        state.folders = state.folders.filter(folder => folder.id !== action.payload);
        if (state.currentFolder?.id === action.payload) {
            state.currentFolder = null;
        }
        // Update breadcrumbs if needed
        state.breadcrumbs = state.breadcrumbs.filter(folder => folder.id !== action.payload);
    });
    builder.addCase(deleteFolder.rejected, (state: NotesState, action) => {
        state.loading = false;
        state.error = action.payload as string;
    });

    // Fetch files
    builder.addCase(fetchFiles.pending, (state: NotesState) => {
        state.loading = true;
        state.error = null;
    });
    builder.addCase(fetchFiles.fulfilled, (state: NotesState, action: PayloadAction<File[]>) => {
        state.loading = false;
        state.files = action.payload;
    });
    builder.addCase(fetchFiles.rejected, (state: NotesState, action) => {
        state.loading = false;
        state.error = action.payload as string;
    });

    // Upload file
    builder.addCase(uploadFile.pending, (state: NotesState) => {
        state.loading = true;
        state.error = null;
    });
    builder.addCase(uploadFile.fulfilled, (state: NotesState, action: PayloadAction<File>) => {
        state.loading = false;
        state.files.push(action.payload);
    });
    builder.addCase(uploadFile.rejected, (state: NotesState, action) => {
        state.loading = false;
        state.error = action.payload as string;
    });

    // Delete file
    builder.addCase(deleteFile.pending, (state: NotesState) => {
        state.loading = true;
        state.error = null;
    });
    builder.addCase(deleteFile.fulfilled, (state: NotesState, action: PayloadAction<number>) => {
        state.loading = false;
        state.files = state.files.filter(file => file.id !== action.payload);
    });
    builder.addCase(deleteFile.rejected, (state: NotesState, action) => {
        state.loading = false;
        state.error = action.payload as string;
    });

    // Fetch notes
    builder.addCase(fetchNotes.pending, (state: NotesState) => {
        state.loading = true;
        state.error = null;
    });
    builder.addCase(fetchNotes.fulfilled, (state: NotesState, action: PayloadAction<Note[]>) => {
        state.loading = false;
        state.notes = action.payload;
    });
    builder.addCase(fetchNotes.rejected, (state: NotesState, action) => {
        state.loading = false;
        state.error = action.payload as string;
    });

    // Create note
    builder.addCase(createNote.pending, (state: NotesState) => {
        state.loading = true;
        state.error = null;
    });
    builder.addCase(createNote.fulfilled, (state: NotesState, action: PayloadAction<Note>) => {
        state.loading = false;
        state.notes.push(action.payload);
    });
    builder.addCase(createNote.rejected, (state: NotesState, action) => {
        state.loading = false;
        state.error = action.payload as string;
    });

    // Update note
    builder.addCase(updateNote.pending, (state: NotesState) => {
        state.loading = true;
        state.error = null;
    });
    builder.addCase(updateNote.fulfilled, (state: NotesState, action: PayloadAction<Note>) => {
        state.loading = false;
        state.notes = state.notes.map(note =>
            note.id === action.payload.id ? action.payload : note
        );
    });
    builder.addCase(updateNote.rejected, (state: NotesState, action) => {
        state.loading = false;
        state.error = action.payload as string;
    });

    // Delete note
    builder.addCase(deleteNote.pending, (state: NotesState) => {
        state.loading = true;
        state.error = null;
    });
    builder.addCase(deleteNote.fulfilled, (state: NotesState, action: PayloadAction<number>) => {
        state.loading = false;
        state.notes = state.notes.filter(note => note.id !== action.payload);
    });
    builder.addCase(deleteNote.rejected, (state: NotesState, action) => {
        state.loading = false;
        state.error = action.payload as string;
    });

}