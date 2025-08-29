import { UiState } from './types';

export const initialState: UiState = {
  themeMode: 'dark', // Default to dark mode
  colorPalette: 'blue', // Default accent color
  projectsViewMode: 'card', // Default projects view
  notesViewMode: 'grid', // Default notes view
  sidebarCollapsed: false,
};
