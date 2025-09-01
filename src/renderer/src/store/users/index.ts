import { createSlice } from '@reduxjs/toolkit';
import { initialState } from './initialState';
import { reducers } from './reducers';
import { extraReducers } from './extraReducers';
import * as asyncThunks from './asyncThunks';

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers,
  extraReducers,
});

export const actions = { ...asyncThunks, ...usersSlice.actions }

export const reducer = usersSlice.reducer;
