import './StatePanel.scss'

interface StatePanelProps {
  variant: 'loading' | 'error' | 'empty'
  message: string
  // Є лише для error: кнопка повтору запиту
  onRetry?: () => void
}

// Єдиний вигляд для loading / error / empty станів асинхронного запиту
function StatePanel({ variant, message, onRetry }: StatePanelProps) {
  return (
    <div
      className={`state-panel state-panel--${variant}`}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      {variant === 'loading' && <span className="state-panel__spinner" aria-hidden="true" />}
      <p className="state-panel__message">{message}</p>
      {variant === 'error' && onRetry && (
        <button type="button" className="state-panel__retry" onClick={onRetry}>
          Спробувати ще
        </button>
      )}
    </div>
  )
}

export default StatePanel
