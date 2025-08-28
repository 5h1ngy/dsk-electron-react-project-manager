import { configureStore } from '@reduxjs/toolkit';

import authReducer from './authSlice';
import projectsReducer from './projectsSlice/projectsSlice';
import tasksReducer from './tasksSlice/tasksSlice';
import notesReducer from './notesSlice';
import uiReducer from './uiSlice/uiSlice';
import usersReducer from './usersSlice/usersSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    tasks: tasksReducer,
    notes: notesReducer,
    ui: uiReducer,
    users: usersReducer,
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;

export default store;