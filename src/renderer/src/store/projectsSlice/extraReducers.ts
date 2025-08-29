import { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { fetchProjects, createProject, updateProject, deleteProject } from './asyncThunks';
import { ProjectsState } from './types';

export const extraReducers = (builder: ActionReducerMapBuilder<ProjectsState>) => {
  builder
    // fetchProjects
    .addCase(fetchProjects.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchProjects.fulfilled, (state, action) => {
      state.loading = false;
      state.projects = action.payload;
    })
    .addCase(fetchProjects.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch projects';
    })

    // createProject
    .addCase(createProject.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(createProject.fulfilled, (state, action) => {
      state.loading = false;
      state.projects.push(action.payload);
    })
    .addCase(createProject.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to create project';
    })

    // updateProject
    .addCase(updateProject.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updateProject.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.projects.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
    })
    .addCase(updateProject.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to update project';
    })

    // deleteProject
    .addCase(deleteProject.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(deleteProject.fulfilled, (state, action) => {
      state.loading = false;
      state.projects = state.projects.filter((p) => p.id !== action.payload);
    })
    .addCase(deleteProject.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to delete project';
    });
};
