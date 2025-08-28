import { createSlice } from '@reduxjs/toolkit';

import '../types'
import initialState from './initialState';
import reducers from './reducers';
import extraReducers from './extraReducers';

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers,
  extraReducers,
});

export const {
  setCurrentFolder,
  updateBreadcrumbs,
  setNoteFilter,
  clearNoteFilters,
  clearNotesError,
  setCurrentNote,
} = notesSlice.actions;

export default notesSlice.reducer;