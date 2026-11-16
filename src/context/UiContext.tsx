import { useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { TaskFilter } from '../types/task'
import { FILTER_STORAGE_KEY } from '../data/config'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { UiContext } from './uiContextDef'
import type { ToastData, ToastType, UiContextValue } from './uiContextDef'

function isTaskFilter(value: unknown): value is TaskFilter {
  return value === 'all' || value === 'completed' || value === 'active'
}

export function UiProvider({ children }: { children: ReactNode }) {
  // Активний фільтр — client state, його можна зберігати в localStorage
  const [filter, setFilter] = useLocalStorage<TaskFilter>(
    FILTER_STORAGE_KEY,
    'all',
    isTaskFilter,
  )
  const [toast, setToast] = useState<ToastData | null>(null)
  const toastCounter = useRef(0)

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    toastCounter.current += 1
    setToast({ id: toastCounter.current, message, type })
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

  const value = useMemo<UiContextValue>(
    () => ({ filter, setFilter, toast, showToast, dismissToast }),
    [filter, setFilter, toast, showToast, dismissToast],
  )

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>
}
