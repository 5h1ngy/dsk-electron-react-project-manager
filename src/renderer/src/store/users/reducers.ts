import { UsersState } from './types';

export const reducers = {
  clearError: (state: UsersState) => {
    state.error = null;
  },
};
