import { createSlice } from '@reduxjs/toolkit';
import { initialState } from './initialState';
import { reducers } from './reducers';
import { extraReducers } from './extraReducers';
import { fetchProjects, createProject, updateProject, deleteProject } from './asyncThunks';

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers,
  extraReducers,
});

export const {
  setCurrentProject,
  setTagFilter,
  setSearchFilter,
  clearFilters,
  clearProjectsError,
} = projectsSlice.actions;

export default projectsSlice.reducer;

export { fetchProjects, createProject, updateProject, deleteProject };
