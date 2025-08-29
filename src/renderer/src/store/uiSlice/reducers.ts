import { PayloadAction } from '@reduxjs/toolkit';
import { ThemeMode, ColorPalette, ViewMode, NotesViewMode, UiState } from './types';

export const reducers = {
  setThemeMode: (state: UiState, action: PayloadAction<ThemeMode>) => {
    state.themeMode = action.payload;
    localStorage.setItem('themeMode', action.payload);
  },

  setColorPalette: (state: UiState, action: PayloadAction<ColorPalette>) => {
    state.colorPalette = action.payload;
    localStorage.setItem('colorPalette', action.payload);
  },

  setProjectsViewMode: (state: UiState, action: PayloadAction<ViewMode>) => {
    state.projectsViewMode = action.payload;
    localStorage.setItem('projectsViewMode', action.payload);
  },

  setNotesViewMode: (state: UiState, action: PayloadAction<NotesViewMode>) => {
    state.notesViewMode = action.payload;
    localStorage.setItem('notesViewMode', action.payload);
  },

  toggleSidebar: (state: UiState) => {
    state.sidebarCollapsed = !state.sidebarCollapsed;
    localStorage.setItem('sidebarCollapsed', String(state.sidebarCollapsed));
  },

  setSidebarCollapsed: (state: UiState, action: PayloadAction<boolean>) => {
    state.sidebarCollapsed = action.payload;
    localStorage.setItem('sidebarCollapsed', String(action.payload));
  },

  initializeUiFromStorage: (state: UiState) => {
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
};
