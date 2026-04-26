import { Link } from 'react-router-dom';

export default function BookCard({ book }) {
  return (
    <Link to={`/books/${book.id}`} className="book-card">
      <div className="book-card-cover" aria-hidden="true">
        {book.title.charAt(0)}
      </div>
      <div className="book-card-body">
        <h3>{book.title}</h3>
        <p className="book-author">by {book.author}</p>
        {book.genre && <span className="chip">{book.genre}</span>}
        <span className={`chip ${book.available ? 'chip-ok' : 'chip-warn'}`}>
          {book.available ? 'Available' : 'Checked out'}
        </span>
      </div>
    </Link>
  );
}
