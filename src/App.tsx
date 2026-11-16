import { UiProvider } from './context/UiContext'
import TasksPage from './pages/TasksPage'
import Toast from './components/Toast'
import './App.scss'

function App() {
  return (
    <UiProvider>
      <TasksPage />
      <Toast />
    </UiProvider>
  )
}

export default App
