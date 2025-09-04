import { createSlice } from '@reduxjs/toolkit'

import type {
  ProjectTaskState,
  TaskCommentsState,
  TaskDetails,
  TasksState
} from './types'
import {
  addComment,
  createTask,
  deleteTask,
  fetchComments,
  fetchTasks,
  moveTask,
  searchTasks,
  updateTask
} from './thunks'

const buildProjectState = (): ProjectTaskState => ({
  ids: [],
  entities: {},
  status: 'idle',
  error: undefined
})

const buildCommentsState = (): TaskCommentsState => ({
  items: [],
  status: 'idle',
  error: undefined
})

const initialState: TasksState = {
  byProjectId: {},
  commentsByTaskId: {},
  search: {
    query: '',
    results: [],
    status: 'idle',
    error: undefined
  },
  mutationStatus: 'idle'
}

const ensureProjectState = (state: TasksState, projectId: string): ProjectTaskState => {
  if (!state.byProjectId[projectId]) {
    state.byProjectId[projectId] = buildProjectState()
  }
  return state.byProjectId[projectId]
}

const ensureCommentsState = (state: TasksState, taskId: string): TaskCommentsState => {
  if (!state.commentsByTaskId[taskId]) {
    state.commentsByTaskId[taskId] = buildCommentsState()
  }
  return state.commentsByTaskId[taskId]
}

const upsertTask = (collection: ProjectTaskState, task: TaskDetails): void => {
  collection.entities[task.id] = task
  if (!collection.ids.includes(task.id)) {
    collection.ids.push(task.id)
  }
}

const removeTask = (collection: ProjectTaskState, taskId: string): void => {
  collection.ids = collection.ids.filter((id) => id !== taskId)
  delete collection.entities[taskId]
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTaskErrors: (state, action) => {
      if (action.payload) {
        const projectState = state.byProjectId[action.payload as string]
        if (projectState) {
          projectState.error = undefined
        }
      } else {
        Object.values(state.byProjectId).forEach((projectState) => {
          projectState.error = undefined
        })
      }
    },
    resetTaskSearch: (state) => {
      state.search = {
        query: '',
        results: [],
        status: 'idle',
        error: undefined
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state, action) => {
        const projectState = ensureProjectState(state, action.meta.arg)
        projectState.status = 'loading'
        projectState.error = undefined
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        const projectState = ensureProjectState(state, action.payload.projectId)
        projectState.status = 'succeeded'
        projectState.ids = action.payload.tasks.map((task) => task.id)
        projectState.entities = action.payload.tasks.reduce<Record<string, TaskDetails>>(
          (accumulator, task) => {
            accumulator[task.id] = task
            return accumulator
          },
          {}
        )
        projectState.error = undefined
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        const projectId = action.meta.arg
        const projectState = ensureProjectState(state, projectId)
        projectState.status = 'failed'
        projectState.error = action.payload ?? 'Operazione non riuscita'
      })
      .addCase(createTask.pending, (state) => {
        state.mutationStatus = 'loading'
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        const projectState = ensureProjectState(state, action.payload.projectId)
        upsertTask(projectState, action.payload)
      })
      .addCase(createTask.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        if (action.meta.arg.projectId) {
          const projectState = ensureProjectState(state, action.meta.arg.projectId)
          projectState.error = action.payload ?? 'Operazione non riuscita'
        }
      })
      .addCase(updateTask.pending, (state) => {
        state.mutationStatus = 'loading'
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        const projectState = ensureProjectState(state, action.payload.projectId)
        upsertTask(projectState, action.payload)
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        const taskId = action.meta.arg.taskId
        const projectEntry = Object.values(state.byProjectId).find((projectState) =>
          projectState.ids.includes(taskId)
        )
        if (projectEntry) {
          projectEntry.error = action.payload ?? 'Operazione non riuscita'
        }
      })
      .addCase(moveTask.pending, (state) => {
        state.mutationStatus = 'loading'
      })
      .addCase(moveTask.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        const projectState = ensureProjectState(state, action.payload.projectId)
        upsertTask(projectState, action.payload)
      })
      .addCase(moveTask.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        const taskId = action.meta.arg.taskId
        const projectEntry = Object.values(state.byProjectId).find((projectState) =>
          projectState.ids.includes(taskId)
        )
        if (projectEntry) {
          projectEntry.error = action.payload ?? 'Operazione non riuscita'
        }
      })
      .addCase(deleteTask.pending, (state) => {
        state.mutationStatus = 'loading'
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        const projectState = ensureProjectState(state, action.payload.projectId)
        removeTask(projectState, action.payload.taskId)
        delete state.commentsByTaskId[action.payload.taskId]
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        const { projectId } = action.meta.arg
        if (projectId) {
          const projectState = ensureProjectState(state, projectId)
          projectState.error = action.payload ?? 'Operazione non riuscita'
        }
      })
      .addCase(fetchComments.pending, (state, action) => {
        const commentsState = ensureCommentsState(state, action.meta.arg)
        commentsState.status = 'loading'
        commentsState.error = undefined
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        const commentsState = ensureCommentsState(state, action.payload.taskId)
        commentsState.status = 'succeeded'
        commentsState.items = action.payload.comments
      })
      .addCase(fetchComments.rejected, (state, action) => {
        const commentsState = ensureCommentsState(state, action.meta.arg)
        commentsState.status = 'failed'
        commentsState.error = action.payload ?? 'Operazione non riuscita'
      })
      .addCase(addComment.pending, (state) => {
        state.mutationStatus = 'loading'
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded'
        const commentsState = ensureCommentsState(state, action.payload.taskId)
        commentsState.items.push(action.payload.comment)
        commentsState.status = 'succeeded'
      })
      .addCase(addComment.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        const taskId = action.meta.arg.taskId
        if (taskId) {
          const commentsState = ensureCommentsState(state, taskId)
          commentsState.error = action.payload ?? 'Operazione non riuscita'
        }
      })
      .addCase(searchTasks.pending, (state, action) => {
        state.search.status = 'loading'
        state.search.query = action.meta.arg.query
        state.search.error = undefined
      })
      .addCase(searchTasks.fulfilled, (state, action) => {
        state.search.status = 'succeeded'
        state.search.results = action.payload.results
        state.search.query = action.payload.query
      })
      .addCase(searchTasks.rejected, (state, action) => {
        state.search.status = 'failed'
        state.search.error = action.payload ?? 'Operazione non riuscita'
      })
  }
})

export const tasksReducer = tasksSlice.reducer
export const { clearTaskErrors, resetTaskSearch } = tasksSlice.actions
