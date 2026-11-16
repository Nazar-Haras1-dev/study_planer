import { useEffect, useState } from 'react'
import { useTasks } from '../hooks/useTasks'
import { useUiContext } from '../hooks/useUiContext'
import { filterTasks } from '../utils/tasks'
import Header from '../components/Header'
import TaskForm from '../components/TaskForm'
import TaskStats from '../components/TaskStats'
import TaskFilters from '../components/TaskFilters'
import TaskList from '../components/TaskList'
import TaskDetails from '../components/TaskDetails'
import Pagination from '../components/Pagination'
import StatePanel from '../components/StatePanel'

function TasksPage() {
  const { filter, showToast } = useUiContext()
  // Server state (API) — useTasks; client/UI state (filter, selectedId) — тут і в контексті
  const tasksState = useTasks(showToast)
  const { status, tasks, error, page, pageCount, setPage, retry } = tasksState
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // Derived state: фільтрований список рахуємо під час render
  const visibleTasks = filterTasks(tasks, filter)
  const activeCount = tasks.filter((task) => !task.completed).length

  // Синхронізація заголовка вкладки з кількістю невиконаних завдань
  useEffect(() => {
    document.title = `Study Planner — ${activeCount} active tasks`
  }, [activeCount])

  async function handleDelete(id: number) {
    const ok = await tasksState.deleteTask(id)
    if (ok && selectedId === id) setSelectedId(null)
  }

  return (
    <main className="app">
      <Header />
      <TaskForm onSubmit={tasksState.addTask} />

      {selectedId !== null && (
        // key: при виборі іншого завдання компонент створюється заново зі свіжим запитом
        <TaskDetails key={selectedId} taskId={selectedId} onClose={() => setSelectedId(null)} />
      )}

      {status === 'success' && <TaskStats tasks={tasks} />}
      <TaskFilters />

      {status === 'loading' && <StatePanel variant="loading" message="Loading..." />}
      {status === 'error' && (
        <StatePanel
          variant="error"
          message={`Помилка завантаження. ${error ?? ''}`}
          onRetry={retry}
        />
      )}
      {status === 'success' && tasks.length === 0 && (
        <StatePanel variant="empty" message="Завдань не знайдено." />
      )}
      {status === 'success' && tasks.length > 0 && (
        <TaskList
          tasks={visibleTasks}
          busyIds={tasksState.busyIds}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onToggle={tasksState.toggleTask}
          onUpdate={tasksState.updateTask}
          onDelete={handleDelete}
        />
      )}

      <Pagination page={page} pageCount={pageCount} onChange={setPage} />
    </main>
  )
}

export default TasksPage
