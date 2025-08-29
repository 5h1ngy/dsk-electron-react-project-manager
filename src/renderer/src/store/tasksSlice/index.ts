import { createSlice } from '@reduxjs/toolkit';
import { initialState } from './initialState';
import { reducers } from './reducers';
import { extraReducers } from './extraReducers';
import { fetchTasks, createTask, updateTask, deleteTask } from './asyncThunks';

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers,
  extraReducers,
});

export const {
  setTaskFilter,
  clearTaskFilters,
  clearTasksError,
  reorderTasks,
  updateTaskColumns,
} = tasksSlice.actions;

export default tasksSlice.reducer;

export { fetchTasks, createTask, updateTask, deleteTask };
