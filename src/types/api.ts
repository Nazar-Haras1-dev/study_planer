// DTO — те, що повертає DummyJSON. Відрізняється від доменної моделі Task.
export interface ApiTodo {
  id: number
  todo: string
  completed: boolean
  userId: number
}

export interface TodosResponse {
  todos: ApiTodo[]
  total: number
  skip: number
  limit: number
}
