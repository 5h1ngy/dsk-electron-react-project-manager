// #region Imports
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// #endregion

// #region Types
export type ThemeMode = 'light' | 'dark';
export type ViewMode = 'card' | 'table' | 'list';
export type NotesViewMode = 'grid' | 'list';
export type ColorPalette = 'blue' | 'green' | 'purple' | 'orange' | 'red';

export interface UiState {
  themeMode: ThemeMode;
  colorPalette: ColorPalette;
  projectsViewMode: ViewMode;
  notesViewMode: NotesViewMode;
  sidebarCollapsed: boolean;
}
// #endregion

// #region Initial State
const initialState: UiState = {
  themeMode: 'dark', // Default to dark mode
  colorPalette: 'blue', // Default accent color
  projectsViewMode: 'card', // Default projects view
  notesViewMode: 'grid', // Default notes view
  sidebarCollapsed: false,
};
// #endregion

// #region Slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload;
      localStorage.setItem('themeMode', action.payload);
    },
    setColorPalette: (state, action: PayloadAction<ColorPalette>) => {
      state.colorPalette = action.payload;
      localStorage.setItem('colorPalette', action.payload);
    },
    setProjectsViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.projectsViewMode = action.payload;
      localStorage.setItem('projectsViewMode', action.payload);
    },
    setNotesViewMode: (state, action: PayloadAction<NotesViewMode>) => {
      state.notesViewMode = action.payload;
      localStorage.setItem('notesViewMode', action.payload);
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      localStorage.setItem('sidebarCollapsed', String(state.sidebarCollapsed));
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
      localStorage.setItem('sidebarCollapsed', String(action.payload));
    },
    initializeUiFromStorage: (state) => {
      const storedThemeMode = localStorage.getItem('themeMode') as ThemeMode;
      const storedColorPalette = localStorage.getItem('colorPalette') as ColorPalette;
      const storedProjectsViewMode = localStorage.getItem('projectsViewMode') as ViewMode;
      const storedNotesViewMode = localStorage.getItem('notesViewMode') as NotesViewMode;
      const storedSidebarCollapsed = localStorage.getItem('sidebarCollapsed');

      if (storedThemeMode) state.themeMode = storedThemeMode;
      if (storedColorPalette) state.colorPalette = storedColorPalette;
      if (storedProjectsViewMode) state.projectsViewMode = storedProjectsViewMode;
      if (storedNotesViewMode) state.notesViewMode = storedNotesViewMode;
      if (storedSidebarCollapsed) state.sidebarCollapsed = storedSidebarCollapsed === 'true';
    },
  },
});
// #endregion

// #region Exports
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
// #endregion
