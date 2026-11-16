import type { Priority, Task } from '../types/task'
import { initialTasks } from '../data/initialTasks'
import { TASKS_STORAGE_KEY } from '../data/config'

const priorities: Priority[] = ['low', 'medium', 'high']

// Валідація одного елемента: захист від пошкоджених або чужих даних у localStorage
function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'number' &&
    typeof v.title === 'string' &&
    typeof v.description === 'string' &&
    typeof v.completed === 'boolean' &&
    typeof v.category === 'string' &&
    typeof v.priority === 'string' &&
    priorities.includes(v.priority as Priority)
  )
}

/**
 * Читання задач для lazy init reducer-а.
 * 1) немає даних -> початковий список;
 * 2) JSON.parse у try/catch: пошкоджений JSON не ламає застосунок;
 * 3) перевіряємо, що це масив коректних Task, інакше fallback.
 * Збережений порожній масив ([]) — валідний стан: користувач міг видалити все.
 */
export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY)
    if (raw === null) return initialTasks
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.every(isTask)) return parsed
    return initialTasks
  } catch {
    return initialTasks
  }
}

// Запис — side effect, тому викликається лише з useEffect (не з reducer)
export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks))
  } catch {
    // Сховище може бути недоступне (приватний режим, квота): застосунок працює далі
  }
}
