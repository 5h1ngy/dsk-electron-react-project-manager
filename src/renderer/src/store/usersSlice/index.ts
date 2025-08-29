import { createSlice } from '@reduxjs/toolkit';
import { initialState } from './initialState';
import { reducers } from './reducers';
import { extraReducers } from './extraReducers';
import { fetchUsers } from './asyncThunks';

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers,
  extraReducers,
});

export const { clearError } = usersSlice.actions;
export default usersSlice.reducer;

export { fetchUsers };
