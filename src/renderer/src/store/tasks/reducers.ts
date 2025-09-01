import { PayloadAction } from '@reduxjs/toolkit';
import { Task, TaskStatus, TaskPriority, TasksState } from './types';

export const reducers = {
  setTaskFilter: (
    state: TasksState,
    action: PayloadAction<{
      tags?: number[];
      status?: TaskStatus[];
      priority?: TaskPriority[];
      searchTerm?: string;
    }>
  ) => {
    if (action.payload.tags !== undefined) {
      state.filter.tags = action.payload.tags;
    }
    if (action.payload.status !== undefined) {
      state.filter.status = action.payload.status;
    }
    if (action.payload.priority !== undefined) {
      state.filter.priority = action.payload.priority;
    }
    if (action.payload.searchTerm !== undefined) {
      state.filter.searchTerm = action.payload.searchTerm;
    }
  },

  clearTaskFilters: (state: TasksState) => {
    state.filter.tags = [];
    state.filter.status = [];
    state.filter.priority = [];
    state.filter.searchTerm = '';
  },

  clearTasksError: (state: TasksState) => {
    state.error = null;
  },

  reorderTasks: (
    state: TasksState,
    action: PayloadAction<Task[]>
  ) => {
    state.tasks = action.payload;
  },

  updateTaskColumns: (
    state: TasksState,
    action: PayloadAction<Array<{ id: string; name: string }>>
  ) => {
    state.columns = action.payload.map((column, index) => ({
      ...column,
      status: column.id as TaskStatus,
      position: index,
    }));
  },
};
