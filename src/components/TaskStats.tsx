import type { Task } from '../types/task'
import './TaskStats.scss'

interface TaskStatsProps {
  // Завдання поточної сторінки
  tasks: Task[]
}

function TaskStats({ tasks }: TaskStatsProps) {
  // Derived state: рахуємо під час render із поточного масиву
  const total = tasks.length
  const completed = tasks.filter((task) => task.completed).length
  const active = total - completed

  return (
    <div className="task-stats">
      <div className="task-stats__item">
        <span className="task-stats__value">{total}</span>
        <span className="task-stats__label">На сторінці</span>
      </div>
      <div className="task-stats__item task-stats__item--done">
        <span className="task-stats__value">{completed}</span>
        <span className="task-stats__label">Виконано</span>
      </div>
      <div className="task-stats__item task-stats__item--active">
        <span className="task-stats__value">{active}</span>
        <span className="task-stats__label">Не виконано</span>
      </div>
    </div>
  )
}

export default TaskStats
