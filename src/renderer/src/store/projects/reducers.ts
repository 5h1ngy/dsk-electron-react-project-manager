import { PayloadAction } from '@reduxjs/toolkit';
import { Project, ProjectsState } from './types';

export const reducers = {
  setCurrentProject: (
    state: ProjectsState,
    action: PayloadAction<Project | null>
  ) => {
    state.currentProject = action.payload;
  },

  setTagFilter: (
    state: ProjectsState,
    action: PayloadAction<number[]>
  ) => {
    state.filter.tags = action.payload;
  },

  setSearchFilter: (
    state: ProjectsState,
    action: PayloadAction<string>
  ) => {
    state.filter.searchTerm = action.payload;
  },

  clearFilters: (state: ProjectsState) => {
    state.filter.tags = [];
    state.filter.searchTerm = '';
  },

  clearProjectsError: (state: ProjectsState) => {
    state.error = null;
  },
};
