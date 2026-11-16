import { useCallback, useEffect, useState } from 'react'
import type { Task, TaskFormValues } from '../types/task'
import { taskRepository } from '../repositories/taskRepository'
import { getErrorMessage, isAbortError } from '../api/errors'
import { PAGE_SIZE } from '../data/config'
import type { ToastType } from '../context/uiContextDef'

export type RequestStatus = 'loading' | 'success' | 'error'

// Результат останнього завершеного GET: key показує, для якої сторінки / спроби він отриманий
interface LoadedState {
  key: string
  tasks: Task[]
  total: number
  error: string | null
}

type MutationResult<T> = { ok: true; value: T } | { ok: false }

/**
 * SERVER STATE: завдання з API, пагінація та мутації.
 * UI/client state (фільтр, вибране завдання, форми) тут не зберігається.
 */
export function useTasks(notify: (message: string, type?: ToastType) => void) {
  const [page, setPage] = useState(1)
  const [reloadNonce, setReloadNonce] = useState(0)
  const [loaded, setLoaded] = useState<LoadedState | null>(null)
  const [busyIds, setBusyIds] = useState<number[]>([])

  // Ключ поточного запиту: змінюється при зміні сторінки або натисканні «Спробувати ще»
  const requestKey = `${page}:${reloadNonce}`

  // loading — це похідне значення: результат ще не відповідає поточному ключу
  const status: RequestStatus =
    loaded === null || loaded.key !== requestKey
      ? 'loading'
      : loaded.error !== null
        ? 'error'
        : 'success'

  useEffect(() => {
    // Новий запит скасовує попередній: cleanup нижче викликає abort()
    const controller = new AbortController()

    taskRepository
      .getAll({ limit: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE }, controller.signal)
      .then((result) => {
        setLoaded({ key: requestKey, tasks: result.tasks, total: result.total, error: null })
      })
      .catch((error: unknown) => {
        // Скасований запит не показуємо як помилку завантаження
        if (isAbortError(error)) return
        setLoaded((prev) => ({
          key: requestKey,
          tasks: [],
          total: prev?.total ?? 0,
          error: getErrorMessage(error),
        }))
      })

    return () => controller.abort()
  }, [page, requestKey])

  const retry = useCallback(() => setReloadNonce((n) => n + 1), [])

  const total = loaded?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // Спільна обгортка мутацій: busy-стан кнопок + Toast з помилкою
  const mutate = useCallback(
    async <T>(
      id: number | null,
      action: () => Promise<T>,
      errorPrefix: string,
    ): Promise<MutationResult<T>> => {
      if (id !== null) setBusyIds((prev) => [...prev, id])
      try {
        return { ok: true, value: await action() }
      } catch (error) {
        notify(`${errorPrefix}: ${getErrorMessage(error)}`, 'error')
        return { ok: false }
      } finally {
        if (id !== null) setBusyIds((prev) => prev.filter((item) => item !== id))
      }
    },
    [notify],
  )

  // Після успішної мутації оновлюємо client-копію server state, а не перезавантажуємо сторінку
  const replaceTask = useCallback((task: Task) => {
    setLoaded((prev) =>
      prev && { ...prev, tasks: prev.tasks.map((t) => (t.id === task.id ? task : t)) },
    )
  }, [])

  const addTask = useCallback(
    async (values: TaskFormValues): Promise<boolean> => {
      const result = await mutate(null, () => taskRepository.create(values), 'Не вдалося створити завдання')
      if (!result.ok) return false
      if (page === 1) {
        setLoaded((prev) => prev && { ...prev, tasks: [result.value, ...prev.tasks] })
      } else {
        setPage(1)
      }
      notify('Завдання створено')
      return true
    },
    [mutate, notify, page],
  )

  const updateTask = useCallback(
    async (id: number, values: TaskFormValues): Promise<boolean> => {
      const result = await mutate(id, () => taskRepository.update(id, values), 'Не вдалося оновити завдання')
      if (!result.ok) return false
      replaceTask(result.value)
      notify('Завдання оновлено')
      return true
    },
    [mutate, notify, replaceTask],
  )

  const toggleTask = useCallback(
    async (task: Task): Promise<void> => {
      const result = await mutate(
        task.id,
        () => taskRepository.update(task.id, { completed: !task.completed }),
        'Не вдалося змінити стан завдання',
      )
      if (result.ok) replaceTask(result.value)
    },
    [mutate, replaceTask],
  )

  const deleteTask = useCallback(
    async (id: number): Promise<boolean> => {
      const result = await mutate(id, () => taskRepository.delete(id), 'Не вдалося видалити завдання')
      if (!result.ok) return false
      setLoaded((prev) => prev && { ...prev, tasks: prev.tasks.filter((t) => t.id !== id) })
      notify('Завдання видалено')
      return true
    },
    [mutate, notify],
  )

  return {
    status,
    tasks: loaded?.tasks ?? [],
    error: loaded?.error ?? null,
    page,
    pageCount,
    setPage,
    retry,
    busyIds,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
  }
}
