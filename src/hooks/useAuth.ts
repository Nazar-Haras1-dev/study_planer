import { useContext } from 'react'
import { AuthContext } from '../context/authContextDef'

// Доступ до AuthContext + зрозуміла помилка поза <AuthProvider>
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth має використовуватись всередині <AuthProvider>')
  }
  return context
}
