import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useTask } from '../hooks/useTask'
import { useUiContext } from '../hooks/useUiContext'
import { useRequireAuth } from '../hooks/useRequireAuth'
import { taskRepository } from '../repositories/taskRepository'
import { getErrorMessage } from '../api/errors'
import { PRIORITY_LABELS } from '../data/labels'
import TaskFormDialog from '../components/TaskFormDialog'
import StatePanel from '../components/StatePanel'
import './TaskDetailsPage.scss'

function formatDate(value: string | null): string {
  if (!value) return 'Невідомо (API не надає дату)'
  return new Date(value).toLocaleString('uk-UA')
}

function TaskDetailsPage() {
  // taskId береться з URL: /tasks/42
  const { taskId } = useParams()
  const { status, task, error, retry, setTask } = useTask(Number(taskId))
  const { showToast } = useUiContext()
  const requireAuth = useRequireAuth()
  const navigate = useNavigate()

  const [editOpen, setEditOpen] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function openEdit() {
    if (requireAuth()) setEditOpen(true)
  }

  function startDelete() {
    if (requireAuth()) setConfirmingDelete(true)
  }

  async function confirmDelete() {
    if (!task) return
    setDeleting(true)
    try {
      await taskRepository.delete(task.id)
      showToast('Завдання видалено')
      navigate('/tasks')
    } catch (err) {
      showToast(`Не вдалося видалити завдання: ${getErrorMessage(err)}`, 'error')
      setDeleting(false)
      setConfirmingDelete(false)
    }
  }

  return (
    <>
      <Link className="task-details__back" to="/tasks">
        ← До списку
      </Link>

      {status === 'loading' && <StatePanel variant="loading" message="Loading..." />}
      {status === 'error' && (
        <StatePanel variant="error" message={`Помилка завантаження. ${error ?? ''}`} onRetry={retry} />
      )}

      {status === 'success' && task && (
        <section className="task-details" aria-label="Деталі завдання">
          <div className="task-details__header">
            <h1 className="task-details__heading">{task.title}</h1>
            <span className={`task-details__badge${task.completed ? ' task-details__badge--done' : ''}`}>
              {task.completed ? 'Виконано' : 'Не виконано'}
            </span>
          </div>

          <dl className="task-details__list">
            <dt>Опис</dt>
            <dd>{task.description || '—'}</dd>
            <dt>Категорія</dt>
            <dd>{task.category}</dd>
            <dt>Пріоритет</dt>
            <dd>{PRIORITY_LABELS[task.priority]}</dd>
            <dt>Створив</dt>
            <dd>{task.createdBy}</dd>
            <dt>Дата створення</dt>
            <dd>{formatDate(task.createdAt)}</dd>
          </dl>

          {confirmingDelete ? (
            <div className="task-details__confirm" role="alertdialog" aria-label="Підтвердження видалення">
              <span>Видалити це завдання?</span>
              <button
                type="button"
                className="task-details__button task-details__button--danger"
                disabled={deleting}
                onClick={confirmDelete}
              >
                {deleting ? 'Видалення...' : 'Так, видалити'}
              </button>
              <button
                type="button"
                className="task-details__button"
                disabled={deleting}
                onClick={() => setConfirmingDelete(false)}
              >
                Скасувати
              </button>
            </div>
          ) : (
            <div className="task-details__actions">
              <button type="button" className="task-details__button" onClick={openEdit}>
                Редагувати
              </button>
              <button
                type="button"
                className="task-details__button task-details__button--danger"
                onClick={startDelete}
              >
                Видалити
              </button>
            </div>
          )}

          {/* Той самий TaskFormDialog, що й для створення, але в режимі edit */}
          <TaskFormDialog
            open={editOpen}
            mode="edit"
            task={task}
            onClose={() => setEditOpen(false)}
            onSubmit={async (data) => {
              const updated = await taskRepository.update(task.id, data)
              setTask(updated)
              showToast('Завдання оновлено')
            }}
          />
        </section>
      )}
    </>
  )
}

export default TaskDetailsPage
