import { useSearchParams } from 'react-router'
import type { PriorityFilter, TaskStatus } from '../types/task'
import { PRIORITY_FILTER_LABELS, STATUS_LABELS } from '../data/labels'
import { parseTaskQuery } from '../utils/tasks'
import './TaskFilters.scss'

const statuses = Object.keys(STATUS_LABELS) as TaskStatus[]
const priorities = Object.keys(PRIORITY_FILTER_LABELS) as PriorityFilter[]

// Фільтри живуть в URL (query params): окремого state немає, тому вони переживають перезавантаження
function TaskFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { status, priority } = parseTaskQuery(searchParams)

  function update(key: 'status' | 'priority', value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      // Значення за замовчуванням в URL не пишемо
      if (value === 'all') next.delete(key)
      else next.set(key, value)
      return next
    })
  }

  return (
    <div className="task-filters">
      <div className="task-filters__group" role="group" aria-label="Фільтр за станом">
        {statuses.map((item) => (
          <button
            key={item}
            type="button"
            className={`task-filters__button${item === status ? ' task-filters__button--active' : ''}`}
            aria-pressed={item === status}
            onClick={() => update('status', item)}
          >
            {STATUS_LABELS[item]}
          </button>
        ))}
      </div>
      <select
        className="task-filters__select"
        aria-label="Фільтр за пріоритетом"
        value={priority}
        onChange={(e) => update('priority', e.target.value)}
      >
        {priorities.map((item) => (
          <option key={item} value={item}>
            {PRIORITY_FILTER_LABELS[item]}
          </option>
        ))}
      </select>
    </div>
  )
}

export default TaskFilters
