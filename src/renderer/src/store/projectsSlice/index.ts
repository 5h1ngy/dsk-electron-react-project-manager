import { createSlice } from '@reduxjs/toolkit';
import { initialState } from './initialState';
import { reducers } from './reducers';
import { extraReducers } from './extraReducers';
import * as asyncThunks from './asyncThunks';
export * as selectors from './selectors';

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers,
  extraReducers,
});

export const actions = { ...asyncThunks, ...projectsSlice.actions }
export default projectsSlice.reducer;