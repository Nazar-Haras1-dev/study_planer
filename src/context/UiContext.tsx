import { useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { UiContext } from './uiContextDef'
import type { ToastData, ToastType, UiContextValue } from './uiContextDef'

export function UiProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null)
  const toastCounter = useRef(0)

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    toastCounter.current += 1
    setToast({ id: toastCounter.current, message, type })
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

  const value = useMemo<UiContextValue>(
    () => ({ toast, showToast, dismissToast }),
    [toast, showToast, dismissToast],
  )

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>
}
