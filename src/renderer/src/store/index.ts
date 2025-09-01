import { configureStore } from '@reduxjs/toolkit';

import { reducer as authReducer, actions as authActions } from './auth';
import { reducer as projectsReducer, actions as projectsActions, selectors as projectSelectors } from './projects';
import { reducer as tasksReducer, actions as tasksActions } from './tasks';
import { reducer as notesReducer, actions as notesActions, selectors as notesSelectors } from './notes';
import { reducer as uiReducer, actions as uiActions } from './ui';
import { reducer as usersReducer, actions as usersActions } from './users';

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
  projectSelectors,
  notesSelectors,
}

export type RootState = ReturnType<typeof store.getState>;
export type RootDispatch = typeof store.dispatch;

export default store;