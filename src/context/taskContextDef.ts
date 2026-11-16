import { createContext } from 'react'
import type { Task, TaskFilter, TaskFormValues } from '../types/task'
import type { PendingDeletion } from '../reducers/taskReducer'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastData {
  id: number
  message: string
  type: ToastType
}

// Публічний API контексту: компоненти не знають про reducer і таймери
export interface TaskContextValue {
  tasks: Task[]
  filter: TaskFilter
  setFilter: (filter: TaskFilter) => void
  pendingDeletion: PendingDeletion | null
  addTask: (values: TaskFormValues) => void
  updateTask: (id: number, values: TaskFormValues) => void
  toggleTask: (id: number) => void
  requestDelete: (id: number) => void
  undoDelete: () => void
  clearCompleted: () => void
  resetTasks: () => void
  toast: ToastData | null
  dismissToast: () => void
  showToast: (message: string, type?: ToastType) => void
}

export const TaskContext = createContext<TaskContextValue | null>(null)
