import type { Task, TaskFormValues } from '../types/task'
import TaskItem from './TaskItem'
import './TaskList.scss'

interface TaskListProps {
  // Уже відфільтровані завдання поточної сторінки
  tasks: Task[]
  busyIds: number[]
  selectedId: number | null
  onSelect: (id: number) => void
  onToggle: (task: Task) => void
  onUpdate: (id: number, values: TaskFormValues) => Promise<boolean>
  onDelete: (id: number) => void
}

function TaskList({ tasks, busyIds, ...handlers }: TaskListProps) {
  if (tasks.length === 0) {
    return <p className="task-list__empty">За цим фільтром завдань немає.</p>
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        // key = стабільний id, а не індекс масиву
        <TaskItem
          key={task.id}
          task={task}
          busy={busyIds.includes(task.id)}
          selected={handlers.selectedId === task.id}
          onSelect={handlers.onSelect}
          onToggle={handlers.onToggle}
          onUpdate={handlers.onUpdate}
          onDelete={handlers.onDelete}
        />
      ))}
    </ul>
  )
}

export default TaskList
