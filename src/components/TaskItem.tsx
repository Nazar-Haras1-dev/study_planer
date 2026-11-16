import { useState } from 'react'
import type { Task } from '../types/task'
import { PRIORITY_LABELS } from '../data/labels'
import { useTaskContext } from '../hooks/useTaskContext'
import TaskForm from './TaskForm'
import './TaskItem.scss'

interface TaskItemProps {
  task: Task
}

function TaskItem({ task }: TaskItemProps) {
  // Дії беремо з контексту, а не через props-ланцюжок
  const { toggleTask, requestDelete, pendingDeletion } = useTaskContext()
  const isPending = pendingDeletion?.ids.includes(task.id) ?? false
  // Режим редагування — локальний UI-стан одного елемента
  const [isEditing, setIsEditing] = useState(false)

  if (isEditing) {
    // Повторне використання TaskForm у режимі редагування
    return (
      <li className="task-item task-item--editing">
        <TaskForm task={task} onDone={() => setIsEditing(false)} />
      </li>
    )
  }

  const className = [
    'task-item',
    task.completed && 'task-item--completed',
    isPending && 'task-item--pending',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <li className={className}>
      <input
        className="task-item__checkbox"
        type="checkbox"
        checked={task.completed}
        disabled={isPending}
        onChange={() => toggleTask(task.id)}
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
          {isPending && (
            <span className="task-item__pending-label">Буде видалено</span>
          )}
        </div>
      </div>
      <div className="task-item__actions">
        <button
          type="button"
          className="task-item__button"
          disabled={isPending}
          onClick={() => toggleTask(task.id)}
        >
          {task.completed ? 'Повернути' : 'Виконано'}
        </button>
        <button
          type="button"
          className="task-item__button"
          disabled={isPending}
          onClick={() => setIsEditing(true)}
        >
          Редагувати
        </button>
        <button
          type="button"
          className="task-item__button task-item__button--danger"
          disabled={isPending}
          onClick={() => requestDelete(task.id)}
        >
          Видалити
        </button>
      </div>
    </li>
  )
}

export default TaskItem
