import { redirect } from 'react-router'
import type { LoaderFunctionArgs } from 'react-router'
import { authStore } from '../auth/authStore'

// Захист маршруту через loader (Data Mode). Loader виконується ДО рендеру сторінки
// і не може використовувати hooks, тому читає сесію напряму зі сховища.
export function requireAuthLoader({ request }: LoaderFunctionArgs) {
  if (!authStore.isAuthenticated()) {
    const url = new URL(request.url)
    const from = encodeURIComponent(url.pathname + url.search)
    return redirect(`/login?from=${from}`)
  }
  return null
}

// Уже авторизованому користувачу сторінка входу не потрібна
export function redirectIfAuthenticatedLoader() {
  if (authStore.isAuthenticated()) return redirect('/profile')
  return null
}

// Безпечне значення "куди повернутись": лише внутрішні шляхи (захист від open redirect)
export function getSafeRedirect(from: string | null): string {
  if (from && from.startsWith('/') && !from.startsWith('//')) return from
  return '/tasks'
}
