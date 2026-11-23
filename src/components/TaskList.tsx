import type { Task } from '../types/task'
import TaskItem from './TaskItem'
import './TaskList.scss'

interface TaskListProps {
  // Уже відфільтровані завдання поточної сторінки
  tasks: Task[]
  busyIds: number[]
  guard: () => boolean
  onToggle: (task: Task) => void
  onDelete: (id: number) => void
}

function TaskList({ tasks, busyIds, guard, onToggle, onDelete }: TaskListProps) {
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
          guard={guard}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}

export default TaskList
