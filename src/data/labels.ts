import type { Priority, TaskFilter } from '../types/task'

// Підписи для інтерфейсу українською
export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Низький',
  medium: 'Середній',
  high: 'Високий',
}

export const FILTER_LABELS: Record<TaskFilter, string> = {
  all: 'Всі',
  completed: 'Виконані',
  active: 'Не виконані',
}
