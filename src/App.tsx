import { RouterProvider } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import { UiProvider } from './context/UiContext'
import { router } from './routes/router'

// Провайдери стоять над RouterProvider: сторінки та layout отримують доступ до сесії й Toast
function App() {
  return (
    <AuthProvider>
      <UiProvider>
        <RouterProvider router={router} />
      </UiProvider>
    </AuthProvider>
  )
}

export default App
