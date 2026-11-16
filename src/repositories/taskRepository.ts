import { httpClient } from '../api/httpClient'
import { HttpError } from '../api/errors'
import type { ApiTodo, TodosResponse } from '../types/api'
import type { Priority, Task, TaskFormValues } from '../types/task'

export interface TaskPage {
  tasks: Task[]
  total: number
  skip: number
  limit: number
}

// Зміни, які можна передати в update (усі поля необов'язкові)
export type TaskChanges = Partial<TaskFormValues> & { completed?: boolean }

interface TaskMeta {
  description: string
  category: string
  priority: Priority
}

const defaultMeta: TaskMeta = {
  description: '',
  category: 'General',
  priority: 'medium',
}

/**
 * DummyJSON знає лише id / todo / completed. Поля description, category та priority —
 * client-only metadata: зберігаємо їх у пам'яті repository на час сесії.
 * Також DummyJSON лише СИМУЛЮЄ запис: створене завдання він не зберігає (кожен POST
 * повертає id 255, а GET/PATCH/DELETE для нього дають 404). Тому завдання, створені
 * в цій сесії, repository веде у `localTasks` і обслуговує без звернення до мережі.
 */
const clientMeta = new Map<number, TaskMeta>()
const localTasks = new Map<number, Task>()

// DTO -> доменна модель
function toTask(todo: ApiTodo): Task {
  const meta = clientMeta.get(todo.id) ?? defaultMeta
  return {
    id: todo.id,
    title: todo.todo,
    completed: todo.completed,
    ...meta,
  }
}

function isLocal(id: number): boolean {
  return localTasks.has(id)
}

export const taskRepository = {
  // GET /todos?limit=..&skip=.. — сторінка завдань (пагінація на боці сервера)
  async getAll(
    { limit, skip }: { limit: number; skip: number },
    signal?: AbortSignal,
  ): Promise<TaskPage> {
    const data = await httpClient.get<TodosResponse>(
      `/todos?limit=${limit}&skip=${skip}`,
      signal,
    )
    const apiTasks = data.todos.map(toTask)
    // Створені в цій сесії завдання показуємо зверху першої сторінки
    const tasks = skip === 0 ? [...localTasks.values(), ...apiTasks] : apiTasks
    return { tasks, total: data.total, skip: data.skip, limit: data.limit }
  },

  // GET /todos/:id — актуальні дані одного завдання
  async getById(id: number, signal?: AbortSignal): Promise<Task> {
    const local = localTasks.get(id)
    if (local) return local
    const todo = await httpClient.get<ApiTodo>(`/todos/${id}`, signal)
    return toTask(todo)
  },

  // POST /todos/add
  async create(values: TaskFormValues): Promise<Task> {
    const created = await httpClient.post<ApiTodo>('/todos/add', {
      todo: values.title,
      completed: false,
      userId: 1,
    })
    // Сервер завжди повертає той самий id, тож робимо локально унікальним
    const lastLocalId = Math.max(0, ...localTasks.keys())
    const id = Math.max(created.id, lastLocalId + 1)
    const task: Task = {
      id,
      title: created.todo,
      completed: created.completed,
      description: values.description,
      category: values.category,
      priority: values.priority,
    }
    localTasks.set(id, task)
    clientMeta.set(id, {
      description: task.description,
      category: task.category,
      priority: task.priority,
    })
    return task
  },

  // PATCH /todos/:id — оновлення (назва, completed; решта — client-only metadata)
  async update(id: number, changes: TaskChanges): Promise<Task> {
    const current = clientMeta.get(id) ?? defaultMeta
    const nextMeta: TaskMeta = {
      description: changes.description ?? current.description,
      category: changes.category ?? current.category,
      priority: changes.priority ?? current.priority,
    }

    const local = localTasks.get(id)
    if (local) {
      const updated: Task = {
        ...local,
        ...nextMeta,
        title: changes.title ?? local.title,
        completed: changes.completed ?? local.completed,
      }
      localTasks.set(id, updated)
      clientMeta.set(id, nextMeta)
      return updated
    }

    // На сервер надсилаємо лише ті поля, які він підтримує
    const body: Partial<Pick<ApiTodo, 'todo' | 'completed'>> = {}
    if (changes.title !== undefined) body.todo = changes.title
    if (changes.completed !== undefined) body.completed = changes.completed

    const todo = await httpClient.patch<ApiTodo>(`/todos/${id}`, body)
    clientMeta.set(id, nextMeta)
    return toTask(todo)
  },

  // DELETE /todos/:id
  async delete(id: number): Promise<void> {
    if (isLocal(id)) {
      localTasks.delete(id)
      clientMeta.delete(id)
      return
    }
    try {
      await httpClient.delete<ApiTodo>(`/todos/${id}`)
    } catch (error) {
      // Уже видалене на сервері — для користувача результат той самий
      if (!(error instanceof HttpError && error.status === 404)) throw error
    }
    clientMeta.delete(id)
  },
}
