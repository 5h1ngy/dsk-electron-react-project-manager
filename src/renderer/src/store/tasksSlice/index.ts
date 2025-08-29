import { createSlice } from '@reduxjs/toolkit';
import { initialState } from './initialState';
import { reducers } from './reducers';
import { extraReducers } from './extraReducers';
import * as asyncThunks from './asyncThunks';

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers,
  extraReducers,
});

export const actions = { ...asyncThunks, ...tasksSlice.actions }

export default tasksSlice.reducer;
