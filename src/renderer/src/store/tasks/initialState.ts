import { TasksState, TaskStatus } from './types';

export const initialState: TasksState = {
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
