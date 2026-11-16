import { useContext } from 'react'
import { TaskContext } from '../context/taskContextDef'

// Зручний доступ до контексту + зрозуміла помилка, якщо забули обгорнути в <TaskProvider>
export function useTaskContext() {
  const context = useContext(TaskContext)
  if (context === null) {
    throw new Error(
      'useTaskContext має використовуватись всередині <TaskProvider>',
    )
  }
  return context
}
