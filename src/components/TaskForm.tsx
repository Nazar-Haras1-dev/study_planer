import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Priority, Task, TaskFormValues } from '../types/task'
import { PRIORITY_LABELS } from '../data/labels'
import { useTaskContext } from '../hooks/useTaskContext'
import './TaskForm.scss'

interface TaskFormProps {
  // Якщо передано task — форма працює в режимі редагування
  task?: Task
  // Викликається після збереження або скасування (щоб батько закрив режим редагування)
  onDone?: () => void
}

const emptyValues: TaskFormValues = {
  title: '',
  description: '',
  category: '',
  priority: 'medium',
}

function TaskForm({ task, onDone }: TaskFormProps) {
  const { addTask, updateTask, showToast } = useTaskContext()
  const isEdit = task !== undefined

  const [values, setValues] = useState<TaskFormValues>(
    task
      ? {
          title: task.title,
          description: task.description,
          category: task.category,
          priority: task.priority,
        }
      : emptyValues,
  )
  const [error, setError] = useState('')

  // Оновлення одного поля: створюємо новий об'єкт, а не мутуємо старий
  function setField<K extends keyof TaskFormValues>(
    field: K,
    value: TaskFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Проста валідація: назва обов'язкова
    if (values.title.trim() === '') {
      setError('Вкажіть назву завдання')
      showToast('Не вдалося зберегти: назва обов\'язкова', 'error')
      return
    }

    const cleaned: TaskFormValues = {
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category.trim() || 'Загальне',
      priority: values.priority,
    }

    // Зміни проходять через dispatch у контексті (reducer), а не мутують об'єкт
    if (task) {
      updateTask(task.id, cleaned)
    } else {
      addTask(cleaned)
      // Очищення форми після успішного додавання
      setValues(emptyValues)
    }
    setError('')
    onDone?.()
  }

  const idPrefix = isEdit ? `task-${task.id}` : 'task-new'

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      <div className="task-form__field task-form__field--wide">
        <label className="task-form__label" htmlFor={`${idPrefix}-title`}>
          Назва *
        </label>
        <input
          id={`${idPrefix}-title`}
          className={`task-form__input${error ? ' task-form__input--invalid' : ''}`}
          value={values.title}
          onChange={(e) => {
            setField('title', e.target.value)
            if (error) setError('')
          }}
          placeholder="Наприклад: Вивчити useState"
        />
        {error && <p className="task-form__error">{error}</p>}
      </div>

      <div className="task-form__field task-form__field--wide">
        <label className="task-form__label" htmlFor={`${idPrefix}-description`}>
          Опис
        </label>
        <input
          id={`${idPrefix}-description`}
          className="task-form__input"
          value={values.description}
          onChange={(e) => setField('description', e.target.value)}
          placeholder="Короткий опис"
        />
      </div>

      <div className="task-form__field">
        <label className="task-form__label" htmlFor={`${idPrefix}-category`}>
          Категорія
        </label>
        <input
          id={`${idPrefix}-category`}
          className="task-form__input"
          value={values.category}
          onChange={(e) => setField('category', e.target.value)}
          placeholder="React"
        />
      </div>

      <div className="task-form__field">
        <label className="task-form__label" htmlFor={`${idPrefix}-priority`}>
          Пріоритет
        </label>
        <select
          id={`${idPrefix}-priority`}
          className="task-form__input"
          value={values.priority}
          onChange={(e) => setField('priority', e.target.value as Priority)}
        >
          {(Object.keys(PRIORITY_LABELS) as Priority[]).map((priority) => (
            <option key={priority} value={priority}>
              {PRIORITY_LABELS[priority]}
            </option>
          ))}
        </select>
      </div>

      <div className="task-form__actions">
        {isEdit && (
          <button type="button" className="task-form__cancel" onClick={onDone}>
            Скасувати
          </button>
        )}
        <button type="submit" className="task-form__submit">
          {isEdit ? 'Зберегти' : 'Додати'}
        </button>
      </div>
    </form>
  )
}

export default TaskForm
