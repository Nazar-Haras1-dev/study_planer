import type { Priority, PriorityFilter, TaskStatus } from '../types/task'

// Підписи для інтерфейсу українською
export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Низький',
  medium: 'Середній',
  high: 'Високий',
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  all: 'Всі',
  completed: 'Виконані',
  active: 'Не виконані',
}

export const PRIORITY_FILTER_LABELS: Record<PriorityFilter, string> = {
  all: 'Будь-який пріоритет',
  ...PRIORITY_LABELS,
}
