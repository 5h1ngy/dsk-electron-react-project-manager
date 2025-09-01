import { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { fetchUsers } from './asyncThunks';
import { UsersState } from './types';

export const extraReducers = (builder: ActionReducerMapBuilder<UsersState>) => {
  builder
    .addCase(fetchUsers.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchUsers.fulfilled, (state, action) => {
      state.loading = false;
      state.users = action.payload;
    })
    .addCase(fetchUsers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch users';
    });
};
