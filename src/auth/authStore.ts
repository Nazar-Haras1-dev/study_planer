// Сховище сесії поза React. Воно потрібне, бо loader маршруту (Data Mode) і API client
// не можуть користуватись hooks та Context, а токен їм потрібен.
// AuthContext лише підписується на це сховище (useSyncExternalStore).

export interface AuthUser {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  image?: string
}

export interface AuthSession {
  user: AuthUser
  accessToken: string
}

const STORAGE_KEY = 'study-planner:session'

// sessionStorage: сесія переживає перезавантаження вкладки, але не зберігається назавжди.
// Зберігання токена в web storage вразливе до XSS: скрипт на сторінці зможе його прочитати.
function readSession(): AuthSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<AuthSession>
    if (parsed.accessToken && parsed.user?.username) return parsed as AuthSession
    return null
  } catch {
    return null
  }
}

let session: AuthSession | null = readSession()
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

export const authStore = {
  getSession: (): AuthSession | null => session,
  getToken: (): string | null => session?.accessToken ?? null,
  isAuthenticated: (): boolean => session !== null,

  setSession(next: AuthSession) {
    session = next
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // сховище недоступне: сесія житиме лише в пам'яті
    }
    emit()
  },

  clear() {
    session = null
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // ігноруємо
    }
    emit()
  },

  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}
