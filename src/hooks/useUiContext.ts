import { useContext } from 'react'
import { UiContext } from '../context/uiContextDef'

// Доступ до UI-контексту + зрозуміла помилка поза <UiProvider>
export function useUiContext() {
  const context = useContext(UiContext)
  if (context === null) {
    throw new Error('useUiContext має використовуватись всередині <UiProvider>')
  }
  return context
}
