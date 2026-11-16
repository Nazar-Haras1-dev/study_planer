import { HttpError, NetworkError, isAbortError } from './errors'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  // Сигнал AbortController: дозволяє скасувати запит ззовні
  signal?: AbortSignal
}

// Базовий URL беремо зі змінної середовища (див. .env.example)
function buildUrl(path: string): string {
  const base = import.meta.env.VITE_API_URL
  if (!base) {
    throw new Error('Не задано VITE_API_URL (скопіюйте .env.example у .env)')
  }
  return `${base.replace(/\/$/, '')}${path}`
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal } = options

  let response: Response
  try {
    response = await fetch(buildUrl(path), {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (error) {
    // AbortError прокидаємо як є, щоб верхній рівень міг його проігнорувати
    if (isAbortError(error)) throw error
    throw new NetworkError()
  }

  // fetch НЕ кидає помилку на 404/500, тому статус перевіряємо вручну
  if (!response.ok) {
    let message = response.statusText || 'Помилка запиту'
    try {
      const data = (await response.json()) as { message?: string }
      if (data.message) message = data.message
    } catch {
      // тіло відповіді не JSON — лишаємо statusText
    }
    throw new HttpError(response.status, message)
  }

  return (await response.json()) as T
}

// Тонкий шар над fetch: UI та repository нічого не знають про fetch
export const httpClient = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
