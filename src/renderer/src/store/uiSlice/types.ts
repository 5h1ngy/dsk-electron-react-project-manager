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
