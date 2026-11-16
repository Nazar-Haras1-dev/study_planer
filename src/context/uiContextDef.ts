import { createContext } from 'react'
import type { TaskFilter } from '../types/task'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastData {
  id: number
  message: string
  type: ToastType
}

// Контекст містить лише client/UI state: фільтр і Toast.
// Server state (завдання з API) живе в хуку useTasks, а не тут.
export interface UiContextValue {
  filter: TaskFilter
  setFilter: (filter: TaskFilter) => void
  toast: ToastData | null
  showToast: (message: string, type?: ToastType) => void
  dismissToast: () => void
}

export const UiContext = createContext<UiContextValue | null>(null)
