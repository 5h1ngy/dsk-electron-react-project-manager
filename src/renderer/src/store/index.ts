import { configureStore } from '@reduxjs/toolkit';

import authReducer, { actions as authActions } from './authSlice';
import projectsReducer from './projectsSlice';
import tasksReducer from './tasksSlice';
import notesReducer from './notesSlice';
import uiReducer from './uiSlice';
import usersReducer from './usersSlice';

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

export const actions = {
  authActions,
}

export type RootState = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;

export default store;