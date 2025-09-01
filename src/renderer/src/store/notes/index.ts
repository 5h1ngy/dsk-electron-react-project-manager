import { createSlice } from '@reduxjs/toolkit';

import '../types'
import initialState from './initialState';
import reducers from './reducers';
import extraReducers from './extraReducers';
import * as asyncThunks from './asyncThunks';
export * as selectors from './selectors';

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers,
  extraReducers,
});

export const actions = { ...asyncThunks, ...notesSlice.actions }

export const reducer = notesSlice.reducer;