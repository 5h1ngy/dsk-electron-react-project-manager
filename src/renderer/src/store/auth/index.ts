import { createSlice } from '@reduxjs/toolkit';

import '../types'
import initialState from './initialState';
import reducers from './reducers';
import extraReducers from './extraReducers';
import * as asyncThunks from './asyncThunks';

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers,
  extraReducers,
});

export const actions = { ...asyncThunks, ...authSlice.actions }

export const reducer = authSlice.reducer;
