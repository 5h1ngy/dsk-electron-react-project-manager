import { ActionReducerMapBuilder, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from "./types";
import { register, login, restoreUser } from './asyncThunks';

export default (builder: ActionReducerMapBuilder<AuthState>) => {

    // Register cases
    builder.addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.initialized = true;
        localStorage.setItem('user', JSON.stringify(action.payload));
    });
    builder.addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to register';
        state.initialized = true;
    });

    // Login cases
    builder.addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.initialized = true;
        localStorage.setItem('user', JSON.stringify(action.payload));
    });
    builder.addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to login';
        state.initialized = true;
    });

    // Restore user cases
    builder.addCase(restoreUser.pending, (state) => {
        state.loading = true;
        state.error = null;
    });
    builder.addCase(restoreUser.fulfilled, (state, action: PayloadAction<User | null>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.initialized = true;
    });
    builder.addCase(restoreUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to restore user';
        state.initialized = true;
    });
}