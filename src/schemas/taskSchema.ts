import { z } from 'zod'

// Схема форми завдання: одна для створення й редагування
export const taskSchema = z.object({
  title: z.string().trim().min(1, 'Вкажіть назву завдання').max(100, 'Назва не довша за 100 символів'),
  description: z.string().trim().max(500, 'Опис не довший за 500 символів'),
  category: z.string().trim().min(1, 'Вкажіть категорію').max(40, 'Категорія не довша за 40 символів'),
  priority: z.enum(['low', 'medium', 'high']),
})

export type TaskFormData = z.infer<typeof taskSchema>
