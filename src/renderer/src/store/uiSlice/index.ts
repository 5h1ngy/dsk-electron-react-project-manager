import { createSlice } from '@reduxjs/toolkit';
import { initialState } from './initialState';
import { reducers } from './reducers';

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers,
});

export const {
  setThemeMode,
  setColorPalette,
  setProjectsViewMode,
  setNotesViewMode,
  toggleSidebar,
  setSidebarCollapsed,
  initializeUiFromStorage,
} = uiSlice.actions;

export default uiSlice.reducer;
