import { useState } from 'react'
import type { Task, TaskFormValues } from '../types/task'
import { PRIORITY_LABELS } from '../data/labels'
import TaskForm from './TaskForm'
import './TaskItem.scss'

interface TaskItemProps {
  task: Task
  // Виконується мережева операція над цим завданням
  busy: boolean
  selected: boolean
  onSelect: (id: number) => void
  onToggle: (task: Task) => void
  onUpdate: (id: number, values: TaskFormValues) => Promise<boolean>
  onDelete: (id: number) => void
}

function TaskItem({ task, busy, selected, onSelect, onToggle, onUpdate, onDelete }: TaskItemProps) {
  // Локальний UI-стан одного елемента: режим редагування та підтвердження видалення
  const [isEditing, setIsEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  if (isEditing) {
    // Повторне використання TaskForm у режимі редагування
    return (
      <li className="task-item task-item--editing">
        <TaskForm
          task={task}
          onSubmit={(values) => onUpdate(task.id, values)}
          onDone={() => setIsEditing(false)}
        />
      </li>
    )
  }

  const className = [
    'task-item',
    task.completed && 'task-item--completed',
    selected && 'task-item--selected',
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
        onChange={() => onToggle(task)}
        aria-label={`Виконано: ${task.title}`}
      />
      <div className="task-item__body">
        <h3 className="task-item__title">{task.title}</h3>
        {task.description && (
          <p className="task-item__description">{task.description}</p>
        )}
        <div className="task-item__meta">
          <span className="task-item__category">{task.category}</span>
          <span
            className={`task-item__priority task-item__priority--${task.priority}`}
          >
            {PRIORITY_LABELS[task.priority]}
          </span>
          <span className="task-item__status">
            {task.completed ? 'Виконано' : 'Не виконано'}
          </span>
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
            <button
              type="button"
              className="task-item__button"
              onClick={() => setConfirmingDelete(false)}
            >
              Скасувати
            </button>
          </div>
        </div>
      ) : (
        <div className="task-item__actions">
          <button type="button" className="task-item__button" onClick={() => onSelect(task.id)}>
            Деталі
          </button>
          <button
            type="button"
            className="task-item__button"
            disabled={busy}
            onClick={() => setIsEditing(true)}
          >
            Редагувати
          </button>
          <button
            type="button"
            className="task-item__button task-item__button--danger"
            disabled={busy}
            onClick={() => setConfirmingDelete(true)}
          >
            Видалити
          </button>
        </div>
      )}
    </li>
  )
}

export default TaskItem
