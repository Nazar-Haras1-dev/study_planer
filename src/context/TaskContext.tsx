import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { TaskFilter, TaskFormValues } from '../types/task'
import { FILTER_STORAGE_KEY, UNDO_TIMEOUT_MS } from '../data/config'
import { createInitialState, taskReducer } from '../reducers/taskReducer'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { loadTasks, saveTasks } from '../utils/taskStorage'
import { TaskContext } from './taskContextDef'
import type { TaskContextValue, ToastData, ToastType } from './taskContextDef'

function isTaskFilter(value: unknown): value is TaskFilter {
  return value === 'all' || value === 'completed' || value === 'active'
}

interface TaskProviderProps {
  children: ReactNode
}

export function TaskProvider({ children }: TaskProviderProps) {
  // Lazy init: reducer стартує зі збережених задач (або з initialTasks як fallback).
  // Reducer лишається єдиним джерелом правди для tasks.
  const [state, dispatch] = useReducer(taskReducer, undefined, () =>
    createInitialState(loadTasks()),
  )
  // Активний фільтр зберігаємо окремим hook-ом (це не друге джерело для tasks)
  const [filter, setFilter] = useLocalStorage<TaskFilter>(FILTER_STORAGE_KEY, 'all', isTaskFilter)
  const [toast, setToast] = useState<ToastData | null>(null)
  const toastCounter = useRef(0)
  const { pendingDeletion } = state

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

  // Undoable Delete: спочатку лише позначаємо завдання як «очікує видалення».
  // Може бути лише одне активне видалення — інакше показуємо помилку в Toast.
  const requestDelete = useCallback(
    (id: number) => {
      if (state.pendingDeletion) {
        showToast('Спершу дочекайтесь завершення попереднього видалення', 'error')
        return
      }
      dispatch({ type: 'requestDelete', payload: { id, startedAt: Date.now() } })
    },
    [state.pendingDeletion, showToast],
  )

  const undoDelete = useCallback(() => {
    dispatch({ type: 'undoDelete' })
    showToast('Видалення скасовано', 'info')
  }, [showToast])

  const clearCompleted = useCallback(() => {
    if (state.pendingDeletion) {
      showToast('Спершу дочекайтесь завершення попереднього видалення', 'error')
      return
    }
    if (!state.tasks.some((task) => task.completed)) {
      showToast('Немає виконаних завдань для очищення', 'error')
      return
    }
    dispatch({ type: 'clearCompleted', payload: { startedAt: Date.now() } })
  }, [state.pendingDeletion, state.tasks, showToast])

  const resetTasks = useCallback(() => {
    dispatch({ type: 'reset' })
    showToast('Дані скинуто до початкових', 'info')
  }, [showToast])

  /**
   * Effect із таймером Undoable Delete.
   * Таймер — side effect, тому живе тут, а не в reducer.
   * Залежність pendingDeletion: щойно з'являється нове видалення, Effect запускає
   * setTimeout на 5 с; якщо користувач натиснув Undo (pendingDeletion став null)
   * або компонент демонтується, cleanup робить clearTimeout і таймер скасовується.
   * Коли час вийшов — dispatch confirmDelete (остаточне видалення) + Toast.
   */
  useEffect(() => {
    if (!pendingDeletion) return

    const timerId = setTimeout(() => {
      dispatch({ type: 'confirmDelete' })
      showToast(
        pendingDeletion.kind === 'completed'
          ? `Видалено виконаних завдань: ${pendingDeletion.ids.length}`
          : 'Завдання остаточно видалено',
      )
    }, UNDO_TIMEOUT_MS)

    return () => clearTimeout(timerId)
  }, [pendingDeletion, showToast])

  // Effect: після кожної зміни tasks записуємо їх у localStorage.
  // Запис у сховище — side effect, тому він тут, а не в reducer.
  useEffect(() => {
    saveTasks(state.tasks)
  }, [state.tasks])

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
      setFilter,
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
