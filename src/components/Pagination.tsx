import './Pagination.scss'

interface PaginationProps {
  page: number
  pageCount: number
  onChange: (page: number) => void
}

function Pagination({ page, pageCount, onChange }: PaginationProps) {
  return (
    <nav className="pagination" aria-label="Пагінація">
      <button
        type="button"
        className="pagination__button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        ← Назад
      </button>
      <span className="pagination__info">
        Сторінка {page} з {pageCount}
      </span>
      <button
        type="button"
        className="pagination__button"
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
      >
        Далі →
      </button>
    </nav>
  )
}

export default Pagination
