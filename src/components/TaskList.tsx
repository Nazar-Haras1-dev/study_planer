import type { Task } from '../types/task'
import TaskItem from './TaskItem'
import './TaskList.scss'

interface TaskListProps {
  tasks: Task[]
  // Загальна кількість завдань без фільтра: щоб відрізнити «порожній список» від «порожній результат фільтра»
  totalCount: number
  onToggle: (id: number) => void
  onDelete: (id: number) => void
}

function TaskList({ tasks, totalCount, onToggle, onDelete }: TaskListProps) {
  // Умовний рендеринг: два різні порожні стани
  if (totalCount === 0) {
    return (
      <p className="task-list__empty">
        Завдань поки немає.
        <br />
        Додайте перше навчальне завдання.
      </p>
    )
  }

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
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}

export default TaskList
