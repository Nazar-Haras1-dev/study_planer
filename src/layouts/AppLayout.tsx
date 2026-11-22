import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useUiContext } from '../hooks/useUiContext'
import Toast from '../components/Toast'
import './AppLayout.scss'

// Спільний layout: Header + навігація + область контенту (<Outlet /> підставляє поточну сторінку)
function AppLayout() {
  const { isAuthenticated, user, logout } = useAuth()
  const { showToast } = useUiContext()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    showToast('Ви вийшли з акаунта', 'info')
    navigate('/tasks')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `app-layout__link${isActive ? ' app-layout__link--active' : ''}`

  return (
    <div className="app-layout">
      <header className="app-layout__header">
        <Link className="app-layout__brand" to="/tasks">
          Study Planner
        </Link>
        <nav className="app-layout__nav" aria-label="Основна навігація">
          <NavLink className={linkClass} to="/tasks">
            Tasks
          </NavLink>
          <NavLink className={linkClass} to="/profile">
            Profile
          </NavLink>
          {isAuthenticated ? (
            <>
              <span className="app-layout__user">{user?.username}</span>
              <button type="button" className="app-layout__logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <NavLink className={linkClass} to="/login">
              Login
            </NavLink>
          )}
        </nav>
      </header>
      <main className="app-layout__content">
        <Outlet />
      </main>
      <Toast />
    </div>
  )
}

export default AppLayout
