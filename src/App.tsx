import { TaskProvider } from './context/TaskContext'
import Header from './components/Header'
import TaskForm from './components/TaskForm'
import TaskStats from './components/TaskStats'
import TaskFilters from './components/TaskFilters'
import TaskToolbar from './components/TaskToolbar'
import TaskList from './components/TaskList'
import Toast from './components/Toast'
import './App.scss'

// App більше не тримає стан: він живе в TaskProvider і доступний через контекст
function App() {
  return (
    <TaskProvider>
      <main className="app">
        <Header />
        <TaskForm />
        <TaskStats />
        <div className="app__controls">
          <TaskFilters />
          <TaskToolbar />
        </div>
        <TaskList />
      </main>
      <Toast />
    </TaskProvider>
  )
}

export default App
