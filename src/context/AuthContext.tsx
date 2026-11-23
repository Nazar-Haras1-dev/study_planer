import { useCallback, useMemo, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { authStore } from '../auth/authStore'
import { authRepository } from '../repositories/authRepository'
import { AuthContext } from './authContextDef'
import type { AuthContextValue } from './authContextDef'

export function AuthProvider({ children }: { children: ReactNode }) {
  // Джерело правди про сесію: authStore (його ж читають loader-и й API client).
  // useSyncExternalStore перемальовує React, коли сесія змінюється.
  const session = useSyncExternalStore(authStore.subscribe, authStore.getSession)

  const login = useCallback<AuthContextValue['login']>(async (credentials) => {
    const nextSession = await authRepository.login(credentials)
    authStore.setSession(nextSession)
  }, [])

  const logout = useCallback(() => authStore.clear(), [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      isAuthenticated: session !== null,
      login,
      logout,
    }),
    [session, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
