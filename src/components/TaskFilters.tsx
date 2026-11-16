import type { TaskFilter } from '../types/task'
import { FILTER_LABELS } from '../data/labels'
import { useTaskContext } from '../hooks/useTaskContext'
import './TaskFilters.scss'

const filters = Object.keys(FILTER_LABELS) as TaskFilter[]

function TaskFilters() {
  const { filter, setFilter } = useTaskContext()

  return (
    <div className="task-filters" role="group" aria-label="Фільтр завдань">
      {filters.map((item) => (
        <button
          key={item}
          type="button"
          // Активний фільтр позначається BEM-модифікатором
          className={`task-filters__button${item === filter ? ' task-filters__button--active' : ''}`}
          aria-pressed={item === filter}
          onClick={() => setFilter(item)}
        >
          {FILTER_LABELS[item]}
        </button>
      ))}
    </div>
  )
}

export default TaskFilters
