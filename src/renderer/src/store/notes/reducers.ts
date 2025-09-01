import { PayloadAction } from "@reduxjs/toolkit";
import { NotesState, Folder, Note } from "./types";

export default {
    setCurrentFolder: (state: NotesState, action: PayloadAction<Folder | null>) => {
        state.currentFolder = action.payload;
    },
    updateBreadcrumbs: (state: NotesState, action: PayloadAction<Folder[]>) => {
        state.breadcrumbs = action.payload;
    },
    setNoteFilter: (state: NotesState, action: PayloadAction<{
        tags?: number[];
        searchTerm?: string;
    }>) => {
        if (action.payload.tags !== undefined) state.filter.tags = action.payload.tags;
        if (action.payload.searchTerm !== undefined) state.filter.searchTerm = action.payload.searchTerm;
    },
    clearNoteFilters: (state: NotesState) => {
        state.filter = {
            tags: [],
            searchTerm: '',
        };
    },
    clearNotesError: (state: NotesState) => {
        state.error = null;
    },
    setCurrentNote: (state: NotesState, action: PayloadAction<Note | null>) => {
        state.currentNote = action.payload;
    },
}