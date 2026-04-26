import { useEffect, useState } from 'react';
import api from '../api/client.js';
import BookCard from '../components/BookCard.jsx';

export default function BrowseBooks() {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  // Load on first render and when the availability filter toggles
  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableOnly]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Browse the catalog</h1>
          <p className="muted">Search by title or author, or filter to what's in the kiosk right now.</p>
        </div>
      </div>

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
  );
}
