import { useState } from 'react'
import type { Task, TaskFilter, TaskFormValues } from './types/task'
import { initialTasks } from './data/initialTasks'
import { filterTasks, getNextId } from './utils/tasks'
import Header from './components/Header'
import TaskForm from './components/TaskForm'
import TaskStats from './components/TaskStats'
import TaskFilters from './components/TaskFilters'
import TaskList from './components/TaskList'
import './App.scss'

function App() {
  // Стан піднято в App, бо його потребують кілька дочірніх компонентів
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [filter, setFilter] = useState<TaskFilter>('all')

  // Усі оновлення імутабельні: створюємо новий масив / новий об'єкт
  function addTask(values: TaskFormValues) {
    setTasks((prev) => [...prev, { ...values, id: getNextId(prev), completed: false }])
  }

  function toggleTask(id: number) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    )
  }

  function deleteTask(id: number) {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  // Фільтрований список обчислюється під час render, вихідний масив не змінюється
  const visibleTasks = filterTasks(tasks, filter)

  return (
    <main className="app">
      <Header />
      <TaskForm onAdd={addTask} />
      <TaskStats tasks={tasks} />
      <TaskFilters filter={filter} onChange={setFilter} />
      <TaskList
        tasks={visibleTasks}
        totalCount={tasks.length}
        onToggle={toggleTask}
        onDelete={deleteTask}
      />
    </main>
  )
}

export default App
