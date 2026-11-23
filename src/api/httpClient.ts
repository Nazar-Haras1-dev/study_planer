import { HttpError, NetworkError, isAbortError } from './errors'
import { authStore } from '../auth/authStore'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  // Сигнал AbortController: дозволяє скасувати запит ззовні
  signal?: AbortSignal
  // Запит потребує авторизації: токен береться зі сховища сесії
  auth?: boolean
  // Явно переданий токен (потрібен, поки сесії ще немає: login -> /auth/me)
  token?: string
}

// Базовий URL беремо зі змінної середовища (див. .env.example)
function buildUrl(path: string): string {
  const base = import.meta.env.VITE_API_URL
  if (!base) {
    throw new Error('Не задано VITE_API_URL (скопіюйте .env.example у .env)')
  }
  return `${base.replace(/\/$/, '')}${path}`
}

// Єдине місце, де формується заголовок Authorization: Bearer <token>.
// Компоненти й repository про токен нічого не знають.
function buildHeaders(options: RequestOptions): Record<string, string> {
  const headers: Record<string, string> = {}
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'

  const token = options.token ?? (options.auth ? authStore.getToken() : null)
  if (options.auth && !token) {
    throw new HttpError(401, 'Потрібно увійти в систему')
  }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal } = options

  let response: Response
  try {
    response = await fetch(buildUrl(path), {
      method,
      headers: buildHeaders(options),
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (error) {
    // AbortError та помилки авторизації прокидаємо як є
    if (isAbortError(error) || error instanceof HttpError) throw error
    throw new NetworkError()
  }

  // fetch НЕ кидає помилку на 404/500, тому статус перевіряємо вручну
  if (!response.ok) {
    let message = response.statusText || 'Помилка запиту'
    try {
      const data = (await response.json()) as { message?: string }
      if (data.message) message = data.message
    } catch {
      // тіло відповіді не JSON: лишаємо statusText
    }
    throw new HttpError(response.status, message)
  }

  return (await response.json()) as T
}

type CallOptions = Pick<RequestOptions, 'signal' | 'auth' | 'token'>

// Тонкий шар над fetch: UI та repository нічого не знають про fetch
export const httpClient = {
  get: <T>(path: string, options?: CallOptions) => request<T>(path, { ...options }),
  post: <T>(path: string, body: unknown, options?: CallOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body: unknown, options?: CallOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: CallOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
}
