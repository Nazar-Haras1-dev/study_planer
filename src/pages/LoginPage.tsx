import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearchParams } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useUiContext } from '../hooks/useUiContext'
import { loginSchema } from '../schemas/authSchema'
import type { LoginFormData } from '../schemas/authSchema'
import { getSafeRedirect } from '../routes/authLoaders'
import { getErrorMessage } from '../api/errors'
import './LoginPage.scss'

function LoginPage() {
  const { login } = useAuth()
  const { showToast } = useUiContext()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    // Zod описує правила, React Hook Form керує станом форми, resolver їх з'єднує
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  async function onSubmit(data: LoginFormData) {
    try {
      await login(data)
      showToast('Ви увійшли в систему')
      // Повертаємо користувача туди, звідки його відправили на Login
      navigate(getSafeRedirect(searchParams.get('from')), { replace: true })
    } catch (error) {
      setError('root.server', { message: getErrorMessage(error) })
    }
  }

  return (
    <section className="login-page">
      <h1 className="login-page__title">Вхід</h1>
      <p className="login-page__hint">Тестовий акаунт DummyJSON: emilys / emilyspass</p>

      <form className="login-page__form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="login-page__field">
          <label className="login-page__label" htmlFor="login-username">
            Username
          </label>
          <input
            id="login-username"
            className={`login-page__input${errors.username ? ' login-page__input--invalid' : ''}`}
            autoComplete="username"
            aria-invalid={errors.username ? 'true' : 'false'}
            {...register('username')}
          />
          {errors.username && <p className="login-page__error">{errors.username.message}</p>}
        </div>

        <div className="login-page__field">
          <label className="login-page__label" htmlFor="login-password">
            Пароль
          </label>
          <input
            id="login-password"
            type="password"
            className={`login-page__input${errors.password ? ' login-page__input--invalid' : ''}`}
            autoComplete="current-password"
            aria-invalid={errors.password ? 'true' : 'false'}
            {...register('password')}
          />
          {errors.password && <p className="login-page__error">{errors.password.message}</p>}
        </div>

        {errors.root?.server && (
          <p className="login-page__error login-page__error--form" role="alert">
            {errors.root.server.message}
          </p>
        )}

        <button type="submit" className="login-page__submit" disabled={isSubmitting}>
          {isSubmitting ? 'Вхід...' : 'Увійти'}
        </button>
      </form>
    </section>
  )
}

export default LoginPage
