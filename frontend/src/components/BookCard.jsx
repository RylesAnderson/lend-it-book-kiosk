import { Link } from 'react-router-dom';

/**
 * Editorial-style book card.
 *
 * Covers use the first letter of the title set in Fraunces — a placeholder
 * that reads as deliberate typography rather than "TODO add image". Genre
 * appears as a small-caps eyebrow above the title; status as a pill below.
 */
export default function BookCard({ book }) {
  return (
    <Link to={`/books/${book.id}`} className="book-card">
      <div className="book-card-cover" aria-hidden="true">
        {book.title.charAt(0)}
      </div>
      <div className="book-card-body">
        <h3>{book.title}</h3>
        <p className="book-author">by {book.author}</p>
        <div className="book-card-tags">
          {book.genre && <span className="chip chip-genre">{book.genre}</span>}
          <span className={`chip ${book.available ? 'chip-ok' : 'chip-warn'}`}>
            {book.available ? 'Available' : 'Checked out'}
          </span>
        </div>
      </div>
    </Link>
  );
}