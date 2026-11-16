import { useEffect } from 'react'
import { useUiContext } from '../hooks/useUiContext'
import { TOAST_DURATION_MS } from '../data/config'
import './Toast.scss'

// Власний Toast без бібліотек: success / error / info
function Toast() {
  const { toast, dismissToast } = useUiContext()

  // Автозникнення. Cleanup очищує таймер при новому Toast або unmount.
  useEffect(() => {
    if (!toast) return
    const timerId = setTimeout(dismissToast, TOAST_DURATION_MS)
    return () => clearTimeout(timerId)
  }, [toast, dismissToast])

  return (
    // aria-live: скрінрідер озвучує повідомлення; контейнер не перехоплює кліки
    <div className="toast-container" aria-live="polite">
      {toast && (
        <div className={`toast toast--${toast.type}`} key={toast.id} role="status">
          <div className="toast__row">
            <span className="toast__message">{toast.message}</span>
            <button
              type="button"
              className="toast__close"
              onClick={dismissToast}
              aria-label="Закрити повідомлення"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Toast
