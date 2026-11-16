import { useTaskContext } from '../hooks/useTaskContext'
import { filterTasks } from '../utils/tasks'
import TaskItem from './TaskItem'
import './TaskList.scss'

function TaskList() {
  const { tasks, filter } = useTaskContext()

  // Derived state: фільтрований список обчислюється під час render (без useEffect)
  const visibleTasks = filterTasks(tasks, filter)

  // Умовний рендеринг: два різні порожні стани
  if (tasks.length === 0) {
    return (
      <p className="task-list__empty">
        Завдань поки немає.
        <br />
        Додайте перше навчальне завдання.
      </p>
    )
  }

  if (visibleTasks.length === 0) {
    return <p className="task-list__empty">За цим фільтром завдань немає.</p>
  }

  return (
    <ul className="task-list">
      {visibleTasks.map((task) => (
        // key = стабільний id, а не індекс масиву
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  )
}

export default TaskList
