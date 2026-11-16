import { useEffect, useState } from 'react'
import type { Task } from '../types/task'
import { taskRepository } from '../repositories/taskRepository'
import { getErrorMessage, isAbortError } from '../api/errors'
import { PRIORITY_LABELS } from '../data/labels'
import StatePanel from './StatePanel'
import './TaskDetails.scss'

interface TaskDetailsProps {
  taskId: number
  onClose: () => void
}

interface DetailsResult {
  // Для якого id і якої спроби отримано результат
  key: string
  task: Task | null
  error: string | null
}

// Деталі завдання: актуальні дані через taskRepository.getById. Стан локальний, без глобального Context.
function TaskDetails({ taskId, onClose }: TaskDetailsProps) {
  const [result, setResult] = useState<DetailsResult | null>(null)
  const [attempt, setAttempt] = useState(0)

  const requestKey = `${taskId}:${attempt}`
  const isLoading = result === null || result.key !== requestKey

  useEffect(() => {
    // При виборі іншого завдання (або повторі) попередній GET скасовується
    const controller = new AbortController()

    taskRepository
      .getById(taskId, controller.signal)
      .then((task) => setResult({ key: requestKey, task, error: null }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return
        setResult({ key: requestKey, task: null, error: getErrorMessage(error) })
      })

    return () => controller.abort()
  }, [taskId, requestKey])

  return (
    <section className="task-details" aria-label="Деталі завдання">
      <div className="task-details__header">
        <h2 className="task-details__heading">Деталі завдання #{taskId}</h2>
        <button type="button" className="task-details__close" onClick={onClose}>
          Закрити
        </button>
      </div>

      {isLoading && <StatePanel variant="loading" message="Loading..." />}

      {!isLoading && result.error !== null && (
        <StatePanel
          variant="error"
          message={`Помилка завантаження. ${result.error}`}
          onRetry={() => setAttempt((n) => n + 1)}
        />
      )}

      {!isLoading && result.task && (
        <dl className="task-details__list">
          <dt>Назва</dt>
          <dd>{result.task.title}</dd>
          <dt>Опис</dt>
          <dd>{result.task.description || '—'}</dd>
          <dt>Категорія</dt>
          <dd>{result.task.category}</dd>
          <dt>Пріоритет</dt>
          <dd>{PRIORITY_LABELS[result.task.priority]}</dd>
          <dt>Статус</dt>
          <dd>{result.task.completed ? 'Виконано' : 'Не виконано'}</dd>
        </dl>
      )}
    </section>
  )
}

export default TaskDetails
