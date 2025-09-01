import { Tag } from "../projects/types";

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

export interface TaskFilter {
  searchTerm?: string;
  status?: TaskStatus[];
  priority?: TaskPriority[];
  tags?: string[];
  dueDateRange?: [string, string];
}

export interface TasksState {
  tasks: Task[];
  columns: BoardColumn[];
  loading: boolean;
  error: string | null;
  filter: TaskFilter;
}