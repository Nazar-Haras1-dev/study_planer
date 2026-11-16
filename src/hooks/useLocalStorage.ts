import { useCallback, useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'

/**
 * Повторно використовувана робота з localStorage.
 * Поводиться як useState, але значення зберігається між перезавантаженнями.
 * `validate` захищає від некоректних збережених даних (повертаємось до initialValue).
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  validate?: (value: unknown) => value is T,
): [T, Dispatch<SetStateAction<T>>] {
  // Lazy init: читаємо сховище лише один раз, при першому render
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return initialValue
      const parsed: unknown = JSON.parse(raw)
      if (validate && !validate(parsed)) return initialValue
      return parsed as T
    } catch {
      return initialValue
    }
  })

  // Синхронізація зі сховищем — побічний ефект, тому useEffect
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ігноруємо помилки сховища
    }
  }, [key, value])

  // Стабільна функція для використання у залежностях
  const set = useCallback<Dispatch<SetStateAction<T>>>((next) => setValue(next), [])

  return [value, set]
}
