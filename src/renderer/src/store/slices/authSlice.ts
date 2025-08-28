// #region Global Declarations
// Use the exposed API instead of direct electron imports
declare global {
  interface Window {
    api: any;
  }
}
// #endregion

// #region Imports
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// #endregion

// #region Types
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  isAuthenticated: boolean;
}
// #endregion

// #region Initial State
const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  initialized: false,
  isAuthenticated: false
};
// #endregion

// #region Async Thunks
export const register = createAsyncThunk(
  'auth/register',
  async (userData: { username: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await window.api.register(userData);

      if (!response.success) {
        return rejectWithValue(response.message || 'Errore durante la registrazione');
      }

      return response.user;
    } catch (error) {
      console.error('Errore durante la registrazione:', error);
      return rejectWithValue((error as Error).message || 'Errore di connessione durante la registrazione');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (loginData: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await window.api.login(loginData);

      if (!response.success) {
        return rejectWithValue(response.message || 'Errore durante l\'accesso');
      }

      return response.user;
    } catch (error) {
      console.error('Errore durante il login:', error);
      return rejectWithValue((error as Error).message || 'Errore di connessione durante l\'accesso');
    }
  }
);

export const restoreUser = createAsyncThunk(
  'auth/restore',
  async (_, { rejectWithValue }) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (!user) {
        return null;
      }
      return user;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);
// #endregion

// #region Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
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
  },
});
// #endregion

// #region Exports
export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
// #endregion
