// Допустимі пріоритети завдання
export type Priority = 'low' | 'medium' | 'high'

// Режими фільтрації списку
export type TaskFilter = 'all' | 'completed' | 'active'

// Модель навчального завдання
export interface Task {
  id: number
  title: string
  description: string
  completed: boolean
  priority: Priority
  category: string
}

// Дані форми (завдання без службових полів id та completed)
export type TaskFormValues = Omit<Task, 'id' | 'completed'>
