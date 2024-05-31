import { configureStore } from '@reduxjs/toolkit'

import { combineReducers } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux'
import threads from './threads'

const rootReducer = combineReducers({
  threads
})

const store = configureStore({
  reducer: rootReducer
})

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()

export default store
