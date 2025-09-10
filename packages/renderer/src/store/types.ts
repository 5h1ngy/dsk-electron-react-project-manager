import type { ThunkAction, UnknownAction } from '@reduxjs/toolkit'

import { setupStore } from '@renderer/store/setupStore'

export type AppStore = ReturnType<typeof setupStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, UnknownAction>
