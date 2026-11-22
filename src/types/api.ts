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

// Відповідь POST /auth/login
export interface ApiLoginResponse {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  image?: string
  accessToken: string
  refreshToken: string
}

// Відповідь GET /auth/me
export interface ApiUser {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  image?: string
}
