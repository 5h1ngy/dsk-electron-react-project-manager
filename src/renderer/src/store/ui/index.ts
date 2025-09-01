import { createSlice } from '@reduxjs/toolkit';
import { initialState } from './initialState';
import { reducers } from './reducers';

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers,
});

export const actions = { ...uiSlice.actions }

export const reducer = uiSlice.reducer;
