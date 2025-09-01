import { ActionReducerMapBuilder, PayloadAction } from '@reduxjs/toolkit';
import { fetchTasks, createTask, updateTask, deleteTask, uploadAttachment, deleteAttachment } from './asyncThunks';
import { Attachment, Task, TasksState } from './types';

export const extraReducers = (builder: ActionReducerMapBuilder<TasksState>) => {
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
}