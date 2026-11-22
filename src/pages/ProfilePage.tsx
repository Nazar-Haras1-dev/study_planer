import { useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useUiContext } from '../hooks/useUiContext'
import './ProfilePage.scss'

// Сторінка захищена loader-ом у routes/router.tsx: гість сюди не потрапить
function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth()
  const { showToast } = useUiContext()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    showToast('Ви вийшли з акаунта', 'info')
    navigate('/login')
  }

  return (
    <section className="profile-page">
      <h1 className="profile-page__title">Профіль</h1>
      <dl className="profile-page__list">
        <dt>Username</dt>
        <dd>{user?.username}</dd>
        <dt>Email</dt>
        <dd>{user?.email}</dd>
        <dt>Ім’я</dt>
        <dd>
          {user?.firstName} {user?.lastName}
        </dd>
        <dt>Статус</dt>
        <dd>{isAuthenticated ? 'Авторизовано' : 'Гість'}</dd>
      </dl>
      <button type="button" className="profile-page__logout" onClick={handleLogout}>
        Logout
      </button>
    </section>
  )
}

export default ProfilePage
