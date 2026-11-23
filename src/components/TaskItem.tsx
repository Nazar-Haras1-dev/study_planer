import { useState } from 'react'
import { Link } from 'react-router'
import type { Task } from '../types/task'
import { PRIORITY_LABELS } from '../data/labels'
import './TaskItem.scss'

interface TaskItemProps {
  task: Task
  // Виконується мережева операція над цим завданням
  busy: boolean
  // Перевірка авторизації перед захищеною дією: false = користувача відправили на Login
  guard: () => boolean
  onToggle: (task: Task) => void
  onDelete: (id: number) => void
}

function TaskItem({ task, busy, guard, onToggle, onDelete }: TaskItemProps) {
  // Підтвердження видалення: локальний UI-стан одного елемента
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const className = [
    'task-item',
    task.completed && 'task-item--completed',
    busy && 'task-item--busy',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <li className={className}>
      <input
        className="task-item__checkbox"
        type="checkbox"
        checked={task.completed}
        disabled={busy}
        onChange={() => {
          if (guard()) onToggle(task)
        }}
        aria-label={`Виконано: ${task.title}`}
      />
      <div className="task-item__body">
        <h3 className="task-item__title">
          <Link className="task-item__link" to={`/tasks/${task.id}`}>
            {task.title}
          </Link>
        </h3>
        {task.description && <p className="task-item__description">{task.description}</p>}
        <div className="task-item__meta">
          <span className="task-item__category">{task.category}</span>
          <span className={`task-item__priority task-item__priority--${task.priority}`}>
            {PRIORITY_LABELS[task.priority]}
          </span>
          <span className="task-item__status">{task.completed ? 'Виконано' : 'Не виконано'}</span>
          {busy && <span className="task-item__saving">Збереження...</span>}
        </div>
      </div>

      {confirmingDelete ? (
        // Підтвердження видалення прямо в інтерфейсі (без alert/confirm)
        <div className="task-item__confirm" role="alertdialog" aria-label="Підтвердження видалення">
          <span className="task-item__confirm-text">Видалити це завдання?</span>
          <div className="task-item__actions">
            <button
              type="button"
              className="task-item__button task-item__button--danger"
              disabled={busy}
              onClick={() => {
                setConfirmingDelete(false)
                onDelete(task.id)
              }}
            >
              Так, видалити
            </button>
            <button type="button" className="task-item__button" onClick={() => setConfirmingDelete(false)}>
              Скасувати
            </button>
          </div>
        </div>
      ) : (
        <div className="task-item__actions">
          <Link className="task-item__button" to={`/tasks/${task.id}`}>
            Деталі
          </Link>
          <button
            type="button"
            className="task-item__button task-item__button--danger"
            disabled={busy}
            onClick={() => {
              if (guard()) setConfirmingDelete(true)
            }}
          >
            Видалити
          </button>
        </div>
      )}
    </li>
  )
}

export default TaskItem
