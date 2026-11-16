import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { TaskFilter, TaskFormValues } from '../types/task'
import { createInitialState, taskReducer } from '../reducers/taskReducer'
import { TaskContext } from './taskContextDef'
import type { TaskContextValue, ToastData, ToastType } from './taskContextDef'

interface TaskProviderProps {
  children: ReactNode
}

export function TaskProvider({ children }: TaskProviderProps) {
  const [state, dispatch] = useReducer(taskReducer, undefined, () =>
    createInitialState(),
  )
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [toast, setToast] = useState<ToastData | null>(null)
  const toastCounter = useRef(0)

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    toastCounter.current += 1
    setToast({ id: toastCounter.current, message, type })
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

  const addTask = useCallback(
    (values: TaskFormValues) => {
      dispatch({ type: 'add', payload: values })
      showToast('Завдання створено')
    },
    [showToast],
  )

  const updateTask = useCallback(
    (id: number, values: TaskFormValues) => {
      dispatch({ type: 'update', payload: { id, values } })
      showToast('Завдання оновлено')
    },
    [showToast],
  )

  const toggleTask = useCallback((id: number) => {
    dispatch({ type: 'toggle', payload: { id } })
  }, [])

  // Тимчасово: видалення без undo (таймер і Toast додаються наступним комітом)
  const requestDelete = useCallback(
    (id: number) => {
      dispatch({ type: 'requestDelete', payload: { id, startedAt: Date.now() } })
      dispatch({ type: 'confirmDelete' })
      showToast('Завдання видалено')
    },
    [showToast],
  )

  const undoDelete = useCallback(() => dispatch({ type: 'undoDelete' }), [])

  const clearCompleted = useCallback(() => {
    dispatch({ type: 'clearCompleted', payload: { startedAt: Date.now() } })
    dispatch({ type: 'confirmDelete' })
  }, [])

  const resetTasks = useCallback(() => {
    dispatch({ type: 'reset' })
    showToast('Дані скинуто до початкових', 'info')
  }, [showToast])

  // Заголовок вкладки синхронізуємо з кількістю невиконаних завдань
  const activeCount = state.tasks.filter((task) => !task.completed).length
  useEffect(() => {
    document.title = `Study Planner — ${activeCount} active tasks`
  }, [activeCount])

  // useMemo: об'єкт value змінюється лише коли змінились його залежності,
  // тому споживачі контексту не перерендерюються без потреби
  const value = useMemo<TaskContextValue>(
    () => ({
      tasks: state.tasks,
      filter,
      setFilter,
      pendingDeletion: state.pendingDeletion,
      addTask,
      updateTask,
      toggleTask,
      requestDelete,
      undoDelete,
      clearCompleted,
      resetTasks,
      toast,
      dismissToast,
      showToast,
    }),
    [
      state.tasks,
      state.pendingDeletion,
      filter,
      addTask,
      updateTask,
      toggleTask,
      requestDelete,
      undoDelete,
      clearCompleted,
      resetTasks,
      toast,
      dismissToast,
      showToast,
    ],
  )

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}
