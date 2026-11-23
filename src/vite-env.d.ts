/// <reference types="vite/client" />

// Типізація змінних середовища, які ми використовуємо
interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
