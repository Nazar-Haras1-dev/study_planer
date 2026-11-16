import type { Task, TaskFilter } from '../types/task'

// Повертає новий масив за фільтром, вихідний масив не змінюється
export function filterTasks(tasks: Task[], filter: TaskFilter): Task[] {
  switch (filter) {
    case 'completed':
      return tasks.filter((task) => task.completed)
    case 'active':
      return tasks.filter((task) => !task.completed)
    default:
      return tasks
  }
}
