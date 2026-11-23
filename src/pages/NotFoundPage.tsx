import { Link } from 'react-router'
import './NotFoundPage.scss'

function NotFoundPage() {
  return (
    <section className="not-found">
      <h1 className="not-found__title">404</h1>
      <p className="not-found__text">Такої сторінки не існує.</p>
      <Link className="not-found__link" to="/tasks">
        До списку завдань
      </Link>
    </section>
  )
}

export default NotFoundPage
