import { useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';
import BookCard from '../components/BookCard.jsx';

/**
 * The catalog landing page. Two distinct sections by design:
 *   1. A dark hero with a tagline + live stats — pulled from the loaded
 *      catalog so it self-updates when staff adds books. Mirrors the
 *      "stats as social proof" pattern from corporate landing pages.
 *   2. A search + filter toolbar above the responsive grid of books.
 */
export default function BrowseBooks() {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allBooks, setAllBooks] = useState([]);

  // We keep an unfiltered total so the hero stats stay stable while users filter.
  const fetchAll = async () => {
    try {
      const { data } = await api.get('/books');
      setAllBooks(data);
    } catch (err) { /* soft fail */ }
  };

  const fetchBooks = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (query.trim()) params.query = query.trim();
      if (availableOnly) params.availableOnly = true;
      const { data } = await api.get('/books', { params });
      setBooks(data);
    } catch (err) {
      setError('Could not load books. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableOnly]);

  const stats = useMemo(() => {
    const total = allBooks.length;
    const available = allBooks.filter((b) => b.available).length;
    const genres = new Set(allBooks.map((b) => b.genre).filter(Boolean)).size;
    return { total, available, genres };
  }, [allBooks]);

  const handleSearch = (e) => { e.preventDefault(); fetchBooks(); };

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div>
            <div className="hero-eyebrow">A library at every kiosk</div>
            <h1 className="hero-title">
              Borrow, reserve, <em>read</em>.
            </h1>
            <p className="hero-blurb">
              Curated titles, fourteen-day loans, no card required at the kiosk.
              Reserve checked-out books and we'll email you the moment they're back.
            </p>
          </div>

          <div className="hero-stats">
            <div>
              <div className="hero-stat-value">{stats.total}</div>
              <div className="hero-stat-label">Titles in catalog</div>
            </div>
            <div>
              <div className="hero-stat-value">{stats.available}</div>
              <div className="hero-stat-label">Available right now</div>
            </div>
            <div>
              <div className="hero-stat-value">{stats.genres}</div>
              <div className="hero-stat-label">Genres covered</div>
            </div>
          </div>
        </div>
      </section>

      <div className="page">
        <form className="toolbar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search title or author…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <label className="checkbox">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
            />
            Available only
          </label>
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        {loading && <p className="muted">Loading books…</p>}
        {error && <div className="error">{error}</div>}

        {!loading && !error && books.length === 0 && (
          <p className="muted">No books match your search.</p>
        )}

        <div className="book-grid">
          {books.map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      </div>
    </>
  );
}