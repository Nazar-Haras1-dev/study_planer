import { useCallback, useEffect, useState } from 'react'
import type { Task } from '../types/task'
import { taskRepository } from '../repositories/taskRepository'
import { getErrorMessage, isAbortError } from '../api/errors'

interface Result {
  // Для якого id і якої спроби отримано результат
  key: string
  task: Task | null
  error: string | null
}

// Одне завдання за id (для сторінки деталей). GET скасовується при зміні id чи unmount.
export function useTask(taskId: number) {
  const [result, setResult] = useState<Result | null>(null)
  const [attempt, setAttempt] = useState(0)

  const isValidId = Number.isInteger(taskId) && taskId > 0
  const requestKey = `${taskId}:${attempt}`

  useEffect(() => {
    if (!isValidId) return
    const controller = new AbortController()

    taskRepository
      .getById(taskId, controller.signal)
      .then((task) => setResult({ key: requestKey, task, error: null }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return
        setResult({ key: requestKey, task: null, error: getErrorMessage(error) })
      })

    return () => controller.abort()
  }, [taskId, isValidId, requestKey])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  // Після успішного редагування підставляємо оновлене завдання без повторного запиту
  const setTask = useCallback(
    (task: Task) => setResult({ key: requestKey, task, error: null }),
    [requestKey],
  )

  const loading = isValidId && (result === null || result.key !== requestKey)
  const error = !isValidId ? 'Некоректний id завдання' : (result?.key === requestKey ? result.error : null)

  return {
    status: loading ? ('loading' as const) : error !== null ? ('error' as const) : ('success' as const),
    task: result?.key === requestKey ? result.task : null,
    error,
    retry,
    setTask,
  }
}
