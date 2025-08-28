// #region Imports
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// #endregion

// #region Global Declarations
// Use the exposed API instead of direct electron imports
declare global {
  interface Window {
    api: any;
  }
}
// #endregion

// #region Types
// Define User interface
export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  avatar?: string;
  role?: string;
}

// Define initial state
export interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
}
// #endregion

// #region Initial State
const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
};
// #endregion

// #region Async Thunks
// Async thunks for user operations
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async () => {
    const response = await window.api.getUsers();
    return response;
  }
);
// #endregion

// #region Slice
// Create the users slice
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      });
  },
});
// #endregion

// #region Exports
export const { clearError } = usersSlice.actions;
export default usersSlice.reducer;
// #endregion
