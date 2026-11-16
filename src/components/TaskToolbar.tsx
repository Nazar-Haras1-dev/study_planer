import { useTaskContext } from '../hooks/useTaskContext'
import './TaskToolbar.scss'

function TaskToolbar() {
  const { clearCompleted, resetTasks } = useTaskContext()

  return (
    <div className="task-toolbar">
      <button type="button" className="task-toolbar__button" onClick={clearCompleted}>
        Очистити виконані
      </button>
      <button
        type="button"
        className="task-toolbar__button task-toolbar__button--danger"
        onClick={resetTasks}
      >
        Скинути дані
      </button>
    </div>
  )
}

export default TaskToolbar
