import { z } from 'zod'

// Схема форми Login: правила тут, а повідомлення показуються біля полів
export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Вкажіть username'),
  // Мінімум 6 символів: лише навчальна перевірка форми, не універсальне правило безпеки
  password: z.string().min(1, 'Вкажіть пароль').min(6, 'Пароль має містити щонайменше 6 символів'),
})

export type LoginFormData = z.infer<typeof loginSchema>
