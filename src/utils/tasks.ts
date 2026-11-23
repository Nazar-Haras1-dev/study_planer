import type { PriorityFilter, Task, TaskStatus } from '../types/task'

// Параметри списку, що живуть в URL: /tasks?status=completed&priority=high&page=2
export interface TaskQuery {
  status: TaskStatus
  priority: PriorityFilter
  page: number
}

const statuses: TaskStatus[] = ['all', 'completed', 'active']
const priorities: PriorityFilter[] = ['all', 'low', 'medium', 'high']

// URL — єдине джерело правди для фільтрів: читаємо й валідуємо, некоректне значення -> за замовчуванням
export function parseTaskQuery(params: URLSearchParams): TaskQuery {
  const status = params.get('status') as TaskStatus
  const priority = params.get('priority') as PriorityFilter
  const page = Number(params.get('page'))
  return {
    status: statuses.includes(status) ? status : 'all',
    priority: priorities.includes(priority) ? priority : 'all',
    page: Number.isInteger(page) && page >= 1 ? page : 1,
  }
}

// Повертає новий масив, вихідний не змінюється
export function filterTasks(tasks: Task[], query: Pick<TaskQuery, 'status' | 'priority'>): Task[] {
  return tasks.filter((task) => {
    if (query.status === 'completed' && !task.completed) return false
    if (query.status === 'active' && task.completed) return false
    if (query.priority !== 'all' && task.priority !== query.priority) return false
    return true
  })
}
