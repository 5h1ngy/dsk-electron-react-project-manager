// #region Imports
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
// #endregion

// #region Types
export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  userId: number;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  filter: {
    tags: number[];
    searchTerm: string;
  };
}
// #endregion

// #region Initial State
const initialState: ProjectsState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  filter: {
    tags: [],
    searchTerm: '',
  },
};
// #endregion

// #region Async Thunks
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
  async (projectData: { name: string; description?: string; userId: number; tags?: number[] }, { rejectWithValue }) => {
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
  async (projectData: { id: number; name?: string; description?: string; tags?: number[] }, { rejectWithValue }) => {
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
// #endregion

// #region Slice
const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload;
    },
    setTagFilter: (state, action: PayloadAction<number[]>) => {
      state.filter.tags = action.payload;
    },
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filter.searchTerm = action.payload;
    },
    clearFilters: (state) => {
      state.filter = {
        tags: [],
        searchTerm: '',
      };
    },
    clearProjectsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch projects
    builder.addCase(fetchProjects.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
      state.loading = false;
      state.projects = action.payload;
    });
    builder.addCase(fetchProjects.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create project
    builder.addCase(createProject.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createProject.fulfilled, (state, action: PayloadAction<Project>) => {
      state.loading = false;
      state.projects.push(action.payload);
    });
    builder.addCase(createProject.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update project
    builder.addCase(updateProject.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateProject.fulfilled, (state, action: PayloadAction<Project>) => {
      state.loading = false;
      state.projects = state.projects.map(project =>
        project.id === action.payload.id ? action.payload : project
      );
      if (state.currentProject?.id === action.payload.id) {
        state.currentProject = action.payload;
      }
    });
    builder.addCase(updateProject.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete project
    builder.addCase(deleteProject.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteProject.fulfilled, (state, action: PayloadAction<number>) => {
      state.loading = false;
      state.projects = state.projects.filter(project => project.id !== action.payload);
      if (state.currentProject?.id === action.payload) {
        state.currentProject = null;
      }
    });
    builder.addCase(deleteProject.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});
// #endregion

// #region Exports & Selectors
export const {
  setCurrentProject,
  setTagFilter,
  setSearchFilter,
  clearFilters,
  clearProjectsError,
} = projectsSlice.actions;

// Selectors
export const selectFilteredProjects = (state: RootState) => {
  const { projects, filter } = state.projects;

  return projects.filter(project => {
    // Filter by tags
    if (filter.tags.length > 0) {
      const projectTagIds = project.tags.map(tag => tag.id);
      if (!filter.tags.some(tagId => projectTagIds.includes(tagId))) {
        return false;
      }
    }

    // Filter by search term
    if (filter.searchTerm && filter.searchTerm.trim() !== '') {
      const searchTerm = filter.searchTerm.toLowerCase();
      return (
        project.name.toLowerCase().includes(searchTerm) ||
        project.description.toLowerCase().includes(searchTerm)
      );
    }

    return true;
  });
};

export default projectsSlice.reducer;
// #endregion
