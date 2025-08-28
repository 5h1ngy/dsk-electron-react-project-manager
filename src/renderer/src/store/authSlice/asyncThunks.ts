import { createAsyncThunk } from '@reduxjs/toolkit';

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