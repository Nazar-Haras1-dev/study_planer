import { createContext } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastData {
  id: number
  message: string
  type: ToastType
}

// Контекст містить лише Toast. Фільтри живуть в URL, дані завдань у useTasks,
// сесія в AuthContext.
export interface UiContextValue {
  toast: ToastData | null
  showToast: (message: string, type?: ToastType) => void
  dismissToast: () => void
}

export const UiContext = createContext<UiContextValue | null>(null)
