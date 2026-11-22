import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Task } from '../types/task'
import { PRIORITY_LABELS } from '../data/labels'
import { taskSchema } from '../schemas/taskSchema'
import type { TaskFormData } from '../schemas/taskSchema'
import { getErrorMessage } from '../api/errors'
import './TaskFormDialog.scss'

interface TaskFormDialogProps {
  open: boolean
  // Один компонент для двох сценаріїв: створення та редагування
  mode: 'create' | 'edit'
  task?: Task
  onClose: () => void
  onSubmit: (data: TaskFormData) => Promise<void>
}

function getDefaults(task?: Task): TaskFormData {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    category: task?.category ?? 'General',
    priority: task?.priority ?? 'medium',
  }
}

function TaskFormDialog({ open, mode, task, onClose, onSubmit }: TaskFormDialogProps) {
  // Вбудований <dialog>: showModal() дає фокус усередині вікна, затемнення та Escape
  const dialogRef = useRef<HTMLDialogElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: getDefaults(task),
  })

  // Відкриття/закриття вікна синхронізуємо з prop open
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  // Щоразу при відкритті форма заповнюється даними завдання (edit) або порожніми значеннями (create)
  useEffect(() => {
    if (open) reset(getDefaults(task))
  }, [open, task, reset])

  async function submit(data: TaskFormData) {
    try {
      await onSubmit(data)
      onClose()
    } catch (error) {
      // Вікно лишається відкритим, дані не втрачаються
      setError('root.server', { message: getErrorMessage(error) })
    }
  }

  const title = mode === 'create' ? 'Нове завдання' : 'Редагування завдання'

  return (
    <dialog
      ref={dialogRef}
      className="task-dialog"
      aria-labelledby="task-dialog-title"
      // Escape: браузер надсилає cancel, закриття віддаємо в onClose (під час відправки не закриваємо)
      onCancel={(event) => {
        event.preventDefault()
        if (!isSubmitting) onClose()
      }}
      // Клік по затемненню
      onClick={(event) => {
        if (event.target === dialogRef.current && !isSubmitting) onClose()
      }}
    >
      <form className="task-dialog__form" onSubmit={handleSubmit(submit)} noValidate>
        <h2 className="task-dialog__title" id="task-dialog-title">
          {title}
        </h2>

        <div className="task-dialog__field">
          <label className="task-dialog__label" htmlFor="task-title">
            Назва *
          </label>
          <input
            id="task-title"
            className={`task-dialog__input${errors.title ? ' task-dialog__input--invalid' : ''}`}
            aria-invalid={errors.title ? 'true' : 'false'}
            aria-describedby={errors.title ? 'task-title-error' : undefined}
            autoFocus
            {...register('title')}
          />
          {errors.title && (
            <p className="task-dialog__error" id="task-title-error">
              {errors.title.message}
            </p>
          )}
        </div>

        <div className="task-dialog__field">
          <label className="task-dialog__label" htmlFor="task-description">
            Опис
          </label>
          <textarea
            id="task-description"
            className={`task-dialog__input${errors.description ? ' task-dialog__input--invalid' : ''}`}
            rows={3}
            {...register('description')}
          />
          {errors.description && <p className="task-dialog__error">{errors.description.message}</p>}
        </div>

        <div className="task-dialog__row">
          <div className="task-dialog__field">
            <label className="task-dialog__label" htmlFor="task-category">
              Категорія
            </label>
            <input
              id="task-category"
              className={`task-dialog__input${errors.category ? ' task-dialog__input--invalid' : ''}`}
              {...register('category')}
            />
            {errors.category && <p className="task-dialog__error">{errors.category.message}</p>}
          </div>

          <div className="task-dialog__field">
            <label className="task-dialog__label" htmlFor="task-priority">
              Пріоритет
            </label>
            <select id="task-priority" className="task-dialog__input" {...register('priority')}>
              {(Object.keys(PRIORITY_LABELS) as Array<keyof typeof PRIORITY_LABELS>).map((priority) => (
                <option key={priority} value={priority}>
                  {PRIORITY_LABELS[priority]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {errors.root?.server && (
          <p className="task-dialog__error" role="alert">
            {errors.root.server.message}
          </p>
        )}

        <div className="task-dialog__actions">
          <button
            type="button"
            className="task-dialog__cancel"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Скасувати
          </button>
          {/* Під час відправки показуємо pending і блокуємо повторне натискання */}
          <button type="submit" className="task-dialog__submit" disabled={isSubmitting}>
            {isSubmitting ? 'Збереження...' : mode === 'create' ? 'Створити' : 'Зберегти'}
          </button>
        </div>
      </form>
    </dialog>
  )
}

export default TaskFormDialog
