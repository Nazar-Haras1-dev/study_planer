import { createContext } from 'react'
import type { AuthUser } from '../auth/authStore'
import type { LoginFormData } from '../schemas/authSchema'

export interface AuthContextValue {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  login: (credentials: LoginFormData) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
