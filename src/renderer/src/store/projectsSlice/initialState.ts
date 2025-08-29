import { ProjectsState } from './types';

export const initialState: ProjectsState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  filter: {
    tags: [],
    searchTerm: '',
  },
};
