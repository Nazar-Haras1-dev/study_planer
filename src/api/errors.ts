// Помилка HTTP-рівня: сервер відповів, але зі статусом не 2xx
export class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

// Мережева помилка: відповіді немає (офлайн, DNS, CORS тощо)
export class NetworkError extends Error {
  constructor(message = 'Не вдалося з’єднатися із сервером') {
    super(message)
    this.name = 'NetworkError'
  }
}

// Скасований через AbortController запит — це НЕ помилка для користувача
export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

// Централізована нормалізація помилок у зрозумілий текст для UI
export function getErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    if (error.status === 404) return 'Ресурс не знайдено (404)'
    if (error.status >= 500) return `Помилка сервера (${error.status})`
    return `${error.message} (${error.status})`
  }
  if (error instanceof Error) return error.message
  return 'Невідома помилка'
}
