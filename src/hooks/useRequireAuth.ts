import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useAuth } from './useAuth'
import { useUiContext } from './useUiContext'

/**
 * Перевірка авторизації перед захищеною дією (створення, редагування, видалення).
 * Повертає функцію: true, якщо можна продовжувати; інакше показує повідомлення
 * і веде на /login, запам'ятавши, куди повернутись після входу.
 * Це не єдиний захист: repository теж відмовить без токена.
 */
export function useRequireAuth() {
  const { isAuthenticated } = useAuth()
  const { showToast } = useUiContext()
  const navigate = useNavigate()
  const location = useLocation()

  return useCallback((): boolean => {
    if (isAuthenticated) return true
    showToast('Увійдіть, щоб виконати цю дію', 'info')
    const from = encodeURIComponent(location.pathname + location.search)
    navigate(`/login?from=${from}`)
    return false
  }, [isAuthenticated, showToast, navigate, location.pathname, location.search])
}
