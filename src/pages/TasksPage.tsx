import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useTasks } from '../hooks/useTasks'
import { useUiContext } from '../hooks/useUiContext'
import { useRequireAuth } from '../hooks/useRequireAuth'
import { filterTasks, parseTaskQuery } from '../utils/tasks'
import TaskFormDialog from '../components/TaskFormDialog'
import TaskStats from '../components/TaskStats'
import TaskFilters from '../components/TaskFilters'
import TaskList from '../components/TaskList'
import Pagination from '../components/Pagination'
import StatePanel from '../components/StatePanel'
import './TasksPage.scss'

function TasksPage() {
  const { showToast } = useUiContext()
  const requireAuth = useRequireAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  // Фільтри та сторінка беруться з URL: /tasks?status=completed&priority=high&page=2
  const query = parseTaskQuery(searchParams)

  // Server state (API) у useTasks; UI state (відкритий dialog) тут
  const tasksState = useTasks(query.page, showToast)
  const { status, tasks, error, pageCount, retry } = tasksState
  const [createOpen, setCreateOpen] = useState(false)

  // Derived state: фільтрований список рахуємо під час render
  const visibleTasks = filterTasks(tasks, query)
  const activeCount = tasks.filter((task) => !task.completed).length

  // Синхронізація заголовка вкладки з кількістю невиконаних завдань
  useEffect(() => {
    document.title = `Study Planner — ${activeCount} active tasks`
  }, [activeCount])

  function setPage(page: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (page <= 1) next.delete('page')
      else next.set('page', String(page))
      return next
    })
  }

  function openCreate() {
    // Перевірка авторизації перед дією: гостя перекидає на Login
    if (requireAuth()) setCreateOpen(true)
  }

  return (
    <>
      <div className="tasks-page__top">
        <h1 className="tasks-page__title">Завдання</h1>
        <button
          type="button"
          className="tasks-page__add"
          aria-label="Створити завдання"
          title="Створити завдання"
          onClick={openCreate}
        >
          +
        </button>
      </div>

      {status === 'success' && <TaskStats tasks={tasks} />}
      <TaskFilters />

      {status === 'loading' && <StatePanel variant="loading" message="Loading..." />}
      {status === 'error' && (
        <StatePanel variant="error" message={`Помилка завантаження. ${error ?? ''}`} onRetry={retry} />
      )}
      {status === 'success' && tasks.length === 0 && (
        <StatePanel variant="empty" message="Завдань не знайдено." />
      )}
      {status === 'success' && tasks.length > 0 && (
        <TaskList
          tasks={visibleTasks}
          busyIds={tasksState.busyIds}
          guard={requireAuth}
          onToggle={tasksState.toggleTask}
          onDelete={tasksState.deleteTask}
        />
      )}

      <Pagination page={query.page} pageCount={pageCount} onChange={setPage} />

      <TaskFormDialog
        open={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onSubmit={async (data) => {
          const ok = await tasksState.addTask(data)
          if (!ok) throw new Error('Не вдалося створити завдання')
        }}
      />
    </>
  )
}

export default TasksPage
