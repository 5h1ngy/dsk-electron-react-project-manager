import { configureStore } from '@reduxjs/toolkit';

import authReducer, { actions as authActions } from './authSlice';
import projectsReducer, { actions as projectsActions, selectors as projectSelectors } from './projectsSlice';
import tasksReducer, { actions as tasksActions } from './tasksSlice';
import notesReducer, { actions as notesActions } from './notesSlice';
import uiReducer, { actions as uiActions } from './uiSlice';
import usersReducer, { actions as usersActions } from './usersSlice';

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

export const rootActions = {
  authActions,
  projectsActions,
  tasksActions,
  notesActions,
  uiActions,
  usersActions,
}

export const rootSelectors = {
  projectSelectors
}

export type RootState = ReturnType<typeof store.getState>;
export type RootDispatch = typeof store.dispatch;

export default store;