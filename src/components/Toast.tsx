import { useEffect } from 'react'
import { useTaskContext } from '../hooks/useTaskContext'
import { TOAST_DURATION_MS, UNDO_TIMEOUT_MS } from '../data/config'
import './Toast.scss'

// Власний Toast без бібліотек: звичайне повідомлення + Toast для Undoable Delete
function Toast() {
  const { toast, dismissToast, pendingDeletion, undoDelete } = useTaskContext()

  // Автозникнення звичайного Toast. Cleanup очищує таймер при новому Toast або unmount.
  useEffect(() => {
    if (!toast) return
    const timerId = setTimeout(dismissToast, TOAST_DURATION_MS)
    return () => clearTimeout(timerId)
  }, [toast, dismissToast])

  return (
    // aria-live: скрінрідер озвучує повідомлення; контейнер не перехоплює кліки
    <div className="toast-container" aria-live="polite">
      {pendingDeletion && (
        // key = startedAt: при новому видаленні елемент створюється заново і анімація стартує спочатку
        <div className="toast toast--undo" key={pendingDeletion.startedAt} role="status">
          <div className="toast__row">
            <span className="toast__message">
              {pendingDeletion.kind === 'completed'
                ? `Виконані завдання (${pendingDeletion.ids.length}) буде видалено`
                : 'Завдання буде видалено'}
            </span>
            <button type="button" className="toast__action" onClick={undoDelete}>
              Скасувати
            </button>
          </div>
          <div className="toast__progress">
            <div
              className="toast__progress-bar"
              style={{ animationDuration: `${UNDO_TIMEOUT_MS}ms` }}
            />
          </div>
        </div>
      )}

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
