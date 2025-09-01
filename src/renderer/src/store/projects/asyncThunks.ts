import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async (userId: number, { rejectWithValue }) => {
    try {
      // Verifica che userId sia definito e valido
      if (!userId || isNaN(userId)) {
        return rejectWithValue('ID utente non valido o non fornito');
      }

      const response = await window.api.getProjects(userId);

      // Gestione migliore della risposta
      if (!response.success) {
        return rejectWithValue(response.message || 'Errore nel recupero dei progetti');
      }

      // Verifica che i progetti siano un array
      if (!Array.isArray(response.projects)) {
        console.error('Risposta non valida dal server:', response);
        return rejectWithValue('La risposta dal server non contiene un elenco di progetti valido');
      }

      return response.projects;
    } catch (error) {
      console.error('Errore durante il recupero dei progetti:', error);
      return rejectWithValue('Impossibile recuperare i progetti. Si è verificato un errore di comunicazione.');
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/create',
  async (
    projectData: { name: string; description?: string; userId: number; tags?: number[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await window.api.createProject(projectData);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return response.project;
    } catch (error) {
      return rejectWithValue('Failed to create project.');
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/update',
  async (
    projectData: { id: number; name?: string; description?: string; tags?: number[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await window.api.updateProject(projectData);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return response.project;
    } catch (error) {
      return rejectWithValue('Failed to update project.');
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/delete',
  async (projectId: number, { rejectWithValue }) => {
    try {
      const response = await window.api.deleteProject(projectId);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return projectId;
    } catch (error) {
      return rejectWithValue('Failed to delete project.');
    }
  }
);
