import { createAsyncThunk } from '@reduxjs/toolkit';
import { TaskPriority, TaskStatus } from './types';

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