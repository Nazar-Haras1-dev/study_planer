import type { Task, TaskFormValues } from '../types/task'
import { initialTasks } from '../data/initialTasks'
import { getNextId } from '../utils/tasks'

// Що саме очікує на видалення: одне завдання або всі виконані (clearCompleted)
export interface PendingDeletion {
  ids: number[]
  kind: 'single' | 'completed'
  // Унікальна мітка запуску: за нею Effect із таймером розуміє, що почалося нове видалення
  startedAt: number
}

export interface TaskState {
  tasks: Task[]
  pendingDeletion: PendingDeletion | null
}

// Discriminated union: за полем `type` TypeScript сам звужує тип payload у кожній гілці switch
export type TaskAction =
  | { type: 'add'; payload: TaskFormValues }
  | { type: 'toggle'; payload: { id: number } }
  | { type: 'update'; payload: { id: number; values: TaskFormValues } }
  | { type: 'requestDelete'; payload: { id: number; startedAt: number } }
  | { type: 'confirmDelete' }
  | { type: 'undoDelete' }
  | { type: 'clearCompleted'; payload: { startedAt: number } }
  | { type: 'reset' }

export function createInitialState(tasks: Task[] = initialTasks): TaskState {
  return { tasks, pendingDeletion: null }
}

/**
 * Reducer — ЧИСТА функція: (state, action) => новий state.
 * Тут немає localStorage, DOM, таймерів і HTTP: лише обчислення нового стану.
 * Той самий вхід завжди дає той самий результат, а старий state не мутується.
 * Id нового завдання та мітка startedAt приходять ззовні/обчислюються з state,
 * тому Date.now() і Math.random() у reducer не потрібні.
 */
export function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'add':
      return {
        ...state,
        tasks: [
          ...state.tasks,
          { ...action.payload, id: getNextId(state.tasks), completed: false },
        ],
      }

    case 'toggle':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? { ...task, completed: !task.completed }
            : task,
        ),
      }

    case 'update':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.values }
            : task,
        ),
      }

    case 'requestDelete': {
      // Одне активне видалення одночасно: поки є pending, нове ігноруємо
      if (state.pendingDeletion) return state
      const exists = state.tasks.some((task) => task.id === action.payload.id)
      if (!exists) return state
      return {
        ...state,
        pendingDeletion: {
          ids: [action.payload.id],
          kind: 'single',
          startedAt: action.payload.startedAt,
        },
      }
    }

    case 'confirmDelete': {
      // Остаточне видалення: прибираємо з масиву всі id, що очікували
      if (!state.pendingDeletion) return state
      const { ids } = state.pendingDeletion
      return {
        tasks: state.tasks.filter((task) => !ids.includes(task.id)),
        pendingDeletion: null,
      }
    }

    case 'undoDelete':
      // Скасування: завдання нікуди не зникали, тому просто знімаємо позначку
      if (!state.pendingDeletion) return state
      return { ...state, pendingDeletion: null }

    case 'clearCompleted': {
      // Власний undo-flow: ті самі pending, але для всіх виконаних завдань
      if (state.pendingDeletion) return state
      const ids = state.tasks.filter((t) => t.completed).map((t) => t.id)
      if (ids.length === 0) return state
      return {
        ...state,
        pendingDeletion: {
          ids,
          kind: 'completed',
          startedAt: action.payload.startedAt,
        },
      }
    }

    case 'reset':
      return createInitialState()

    default:
      return state
  }
}
