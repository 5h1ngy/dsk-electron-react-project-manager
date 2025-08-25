import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ipcRenderer } from 'electron';

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
interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
};

// Async thunks for user operations
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async () => {
    const response = await ipcRenderer.invoke('users:getAll');
    return response;
  }
);

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

export const { clearError } = usersSlice.actions;
export default usersSlice.reducer;
