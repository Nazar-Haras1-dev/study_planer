import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Priority, TaskFormValues } from '../types/task'
import { PRIORITY_LABELS } from '../data/labels'
import './TaskForm.scss'

interface TaskFormProps {
  onAdd: (values: TaskFormValues) => void
}

const emptyValues: TaskFormValues = {
  title: '',
  description: '',
  category: '',
  priority: 'medium',
}

function TaskForm({ onAdd }: TaskFormProps) {
  const [values, setValues] = useState<TaskFormValues>(emptyValues)
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
      return
    }

    onAdd({
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category.trim() || 'Загальне',
      priority: values.priority,
    })

    // Очищення форми після успішного додавання
    setValues(emptyValues)
    setError('')
  }

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      <div className="task-form__field task-form__field--wide">
        <label className="task-form__label" htmlFor="task-title">
          Назва *
        </label>
        <input
          id="task-title"
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
        <label className="task-form__label" htmlFor="task-description">
          Опис
        </label>
        <input
          id="task-description"
          className="task-form__input"
          value={values.description}
          onChange={(e) => setField('description', e.target.value)}
          placeholder="Короткий опис"
        />
      </div>

      <div className="task-form__field">
        <label className="task-form__label" htmlFor="task-category">
          Категорія
        </label>
        <input
          id="task-category"
          className="task-form__input"
          value={values.category}
          onChange={(e) => setField('category', e.target.value)}
          placeholder="React"
        />
      </div>

      <div className="task-form__field">
        <label className="task-form__label" htmlFor="task-priority">
          Пріоритет
        </label>
        <select
          id="task-priority"
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
        <button type="submit" className="task-form__submit">
          Додати
        </button>
      </div>
    </form>
  )
}

export default TaskForm
