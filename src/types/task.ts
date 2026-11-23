// Допустимі пріоритети завдання
export type Priority = 'low' | 'medium' | 'high'

// Режими фільтрації списку за станом виконання
export type TaskStatus = 'all' | 'completed' | 'active'

// Фільтр за пріоритетом
export type PriorityFilter = Priority | 'all'

// Модель навчального завдання
export interface Task {
  id: number
  title: string
  description: string
  completed: boolean
  priority: Priority
  category: string
  // Автор: для завдань із API це власник todo (userId), для створених у застосунку — username
  createdBy: string
  // Дата створення — CLIENT-OWNED metadata: DummyJSON її не надає.
  // Для завдань із сервера дата невідома (null), для створених у цій сесії це час створення.
  createdAt: string | null
}

// Дані форми (без службових полів)
export type TaskFormValues = Pick<Task, 'title' | 'description' | 'category' | 'priority'>
