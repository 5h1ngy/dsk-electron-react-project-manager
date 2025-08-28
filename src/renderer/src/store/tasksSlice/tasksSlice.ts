// #region Imports
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Tag } from '../projectsSlice/projectsSlice';
import { RootState } from '../index';
// #endregion

// #region Enums
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'inProgress',
  REVIEW = 'review',
  BLOCKED = 'blocked',
  DONE = 'done',
  // Supporto per stati personalizzati
  CUSTOM0 = 'custom0',
  CUSTOM1 = 'custom1',
  CUSTOM2 = 'custom2',
  CUSTOM3 = 'custom3',
  CUSTOM4 = 'custom4'
}
// #endregion

// #region Types
export interface BoardColumn {
  id: string;
  title: string;
  status: TaskStatus;
  position: number;
}

export interface Attachment {
  id: number;
  name: string;
  path: string;
  mimeType: string;
  size: number;
  taskId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  estimationDate: string | null;
  projectId: number;
  position: number;
  tags: Tag[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface TasksState {
  tasks: Task[];
  columns: BoardColumn[];
  loading: boolean;
  error: string | null;
  filter: {
    tags: number[];
    status: TaskStatus[];
    priority: TaskPriority[];
    searchTerm: string;
  };
}
// #endregion

// #region Initial State
const initialState: TasksState = {
  tasks: [],
  columns: [
    { id: TaskStatus.TODO, title: 'Da fare', status: TaskStatus.TODO, position: 0 },
    { id: TaskStatus.IN_PROGRESS, title: 'In corso', status: TaskStatus.IN_PROGRESS, position: 1 },
    { id: TaskStatus.REVIEW, title: 'In revisione', status: TaskStatus.REVIEW, position: 2 },
    { id: TaskStatus.BLOCKED, title: 'Bloccati', status: TaskStatus.BLOCKED, position: 3 },
    { id: TaskStatus.DONE, title: 'Completati', status: TaskStatus.DONE, position: 4 }
  ],
  loading: false,
  error: null,
  filter: {
    tags: [],
    status: [],
    priority: [],
    searchTerm: '',
  },
};
// #endregion

// #region Async Thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchByProject',
  async (projectId: number, { rejectWithValue }) => {
    try {
      const response = await window.api.getTasks(projectId);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return response.tasks;
    } catch (error) {
      return rejectWithValue('Failed to fetch tasks.');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/create',
  async (taskData: {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: Date | null;
    estimationDate?: Date | null;
    projectId: number;
    tags?: number[];
    position: number;
  }, { rejectWithValue }) => {
    try {
      const response = await window.api.createTask(taskData);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return response.task;
    } catch (error) {
      return rejectWithValue('Failed to create task.');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async (taskData: {
    id: number;
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: Date | null;
    estimationDate?: Date | null;
    tags?: number[];
    position?: number;
  }, { rejectWithValue }) => {
    try {
      const response = await window.api.updateTask(taskData);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return response.task;
    } catch (error) {
      return rejectWithValue('Failed to update task.');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (taskId: number, { rejectWithValue }) => {
    try {
      const response = await window.api.deleteTask(taskId);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return taskId;
    } catch (error) {
      return rejectWithValue('Failed to delete task.');
    }
  }
);

export const uploadAttachment = createAsyncThunk(
  'tasks/uploadAttachment',
  async (attachmentData: {
    taskId: number;
    filePath: string;
    fileName: string;
    mimeType: string;
  }, { rejectWithValue }) => {
    try {
      const response = await window.api.uploadAttachment(attachmentData);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return response.attachment;
    } catch (error) {
      return rejectWithValue('Failed to upload attachment.');
    }
  }
);

export const deleteAttachment = createAsyncThunk(
  'tasks/deleteAttachment',
  async ({ taskId, attachmentId }: { taskId: number; attachmentId: number }, { rejectWithValue }) => {
    try {
      const response = await window.api.deleteAttachment(attachmentId);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return { taskId, attachmentId };
    } catch (error) {
      return rejectWithValue('Failed to delete attachment.');
    }
  }
);
// #endregion

// #region Slice
const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTaskFilter: (state, action: PayloadAction<{
      tags?: number[];
      status?: TaskStatus[];
      priority?: TaskPriority[];
      searchTerm?: string;
    }>) => {
      if (action.payload.tags !== undefined) state.filter.tags = action.payload.tags;
      if (action.payload.status !== undefined) state.filter.status = action.payload.status;
      if (action.payload.priority !== undefined) state.filter.priority = action.payload.priority;
      if (action.payload.searchTerm !== undefined) state.filter.searchTerm = action.payload.searchTerm;
    },
    clearTaskFilters: (state) => {
      state.filter = {
        tags: [],
        status: [],
        priority: [],
        searchTerm: '',
      };
    },
    clearTasksError: (state) => {
      state.error = null;
    },
    // For drag and drop reordering
    reorderTasks: (state, action: PayloadAction<Task[]>) => {
      // Update the tasks that have been reordered
      const reorderedTasks = action.payload;
      reorderedTasks.forEach(reorderedTask => {
        const index = state.tasks.findIndex(task => task.id === reorderedTask.id);
        if (index !== -1) {
          state.tasks[index] = reorderedTask;
        }
      });
    },
    // Aggiorna le colonne della taskboard
    updateTaskColumns: (state, action: PayloadAction<Array<{id: string, name: string}>>) => {
      const columns = action.payload.map((col, index) => ({
        id: col.id,
        title: col.name,
        status: col.id as TaskStatus, // Usa l'id come status
        position: index
      }));
      state.columns = columns;
      
      // Aggiorna i task che si riferiscono a colonne rimosse
      if (columns.length > 0) {
        const validStatuses = columns.map(col => col.status);
        state.tasks = state.tasks.map(task => {
          if (!validStatuses.includes(task.status)) {
            // Se lo status non è più valido, assegna il task alla prima colonna
            return { ...task, status: validStatuses[0] };
          }
          return task;
        });
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch tasks
    builder.addCase(fetchTasks.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
      state.loading = false;
      state.tasks = action.payload;
    });
    builder.addCase(fetchTasks.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create task
    builder.addCase(createTask.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
      state.loading = false;
      state.tasks.push(action.payload);
    });
    builder.addCase(createTask.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update task
    builder.addCase(updateTask.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
      state.loading = false;
      state.tasks = state.tasks.map(task => 
        task.id === action.payload.id ? action.payload : task
      );
    });
    builder.addCase(updateTask.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete task
    builder.addCase(deleteTask.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteTask.fulfilled, (state, action: PayloadAction<number>) => {
      state.loading = false;
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
    });
    builder.addCase(deleteTask.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Upload attachment
    builder.addCase(uploadAttachment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(uploadAttachment.fulfilled, (state, action: PayloadAction<Attachment>) => {
      state.loading = false;
      const taskIndex = state.tasks.findIndex(task => task.id === action.payload.taskId);
      if (taskIndex !== -1) {
        state.tasks[taskIndex].attachments.push(action.payload);
      }
    });
    builder.addCase(uploadAttachment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete attachment
    builder.addCase(deleteAttachment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteAttachment.fulfilled, (state, action: PayloadAction<{ taskId: number; attachmentId: number }>) => {
      state.loading = false;
      const { taskId, attachmentId } = action.payload;
      const taskIndex = state.tasks.findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        state.tasks[taskIndex].attachments = state.tasks[taskIndex].attachments.filter(
          attachment => attachment.id !== attachmentId
        );
      }
    });
    builder.addCase(deleteAttachment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});
// #endregion

// #region Exports & Selectors
export const {
  setTaskFilter,
  clearTaskFilters,
  clearTasksError,
  reorderTasks,
  updateTaskColumns
} = tasksSlice.actions;

// Selectors
export const selectFilteredTasks = (state: RootState) => {
  const { tasks, filter } = state.tasks;
  
  return tasks.filter(task => {
    // Filter by tags
    if (filter.tags.length > 0) {
      const taskTagIds = task.tags.map(tag => tag.id);
      if (!filter.tags.some(tagId => taskTagIds.includes(tagId))) {
        return false;
      }
    }
    
    // Filter by status
    if (filter.status.length > 0 && !filter.status.includes(task.status)) {
      return false;
    }
    
    // Filter by priority
    if (filter.priority.length > 0 && !filter.priority.includes(task.priority)) {
      return false;
    }
    
    // Filter by search term
    if (filter.searchTerm && filter.searchTerm.trim() !== '') {
      const searchTerm = filter.searchTerm.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm)
      );
    }
    
    return true;
  });
};

export const selectTasksByStatus = (state: RootState) => {
  const filteredTasks = selectFilteredTasks(state);
  const columns = state.tasks.columns;
  
  // Crea un oggetto per raggruppare i task in base allo stato
  const tasksByStatus: Record<string, Task[]> = {};
  
  // Inizializza l'oggetto con tutte le colonne disponibili
  columns.forEach(column => {
    tasksByStatus[column.status] = [];
  });
  
  // Assicurati che ci siano sempre le colonne standard anche se per qualche motivo columns è vuoto
  if (!tasksByStatus[TaskStatus.TODO]) tasksByStatus[TaskStatus.TODO] = [];
  if (!tasksByStatus[TaskStatus.IN_PROGRESS]) tasksByStatus[TaskStatus.IN_PROGRESS] = [];
  if (!tasksByStatus[TaskStatus.REVIEW]) tasksByStatus[TaskStatus.REVIEW] = [];
  if (!tasksByStatus[TaskStatus.BLOCKED]) tasksByStatus[TaskStatus.BLOCKED] = [];
  if (!tasksByStatus[TaskStatus.DONE]) tasksByStatus[TaskStatus.DONE] = [];
  
  // Raggruppa i task per stato
  filteredTasks.forEach(task => {
    // Se lo stato esiste già, aggiungi il task al gruppo corrispondente
    if (tasksByStatus[task.status]) {
      tasksByStatus[task.status].push(task);
    } else {
      // Se lo stato non esiste (può accadere se le colonne sono cambiate), aggiungi il task al gruppo TODO
      tasksByStatus[TaskStatus.TODO].push(task);
    }
  });
  
  // Sort tasks by position within each status group
  Object.keys(tasksByStatus).forEach(status => {
    tasksByStatus[status as TaskStatus].sort((a, b) => a.position - b.position);
  });
  
  return tasksByStatus;
};

export default tasksSlice.reducer;
// #endregion
