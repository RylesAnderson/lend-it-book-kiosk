import { useEffect, useState } from 'react';
import api from '../api/client.js';

const EMPTY_FORM = { title: '', author: '', isbn: '', genre: '', description: '' };

export default function StaffBooks() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/books');
      setBooks(data);
    } catch (err) {
      setError('Could not load books.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/books', form);
      setSuccess(`Added "${data.title}" to the catalog.`);
      setForm(EMPTY_FORM);
      await fetchBooks();
    } catch (err) {
      const msg = err.response?.status === 403
        ? 'You do not have permission to add books.'
        : err.response?.data?.message || 'Could not add the book.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (book) => {
    if (!window.confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
    setError('');
    setSuccess('');
    setDeletingId(book.id);
    try {
      await api.delete(`/books/${book.id}`);
      setSuccess(`Deleted "${book.title}".`);
      await fetchBooks();
    } catch (err) {
      const status = err.response?.status;
      const msg = status === 409
        ? 'This book has active loans. Wait until it is returned.'
        : status === 403
          ? 'You do not have permission to delete books.'
          : err.response?.data?.message || 'Could not delete the book.';
      setError(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Manage books</h1>
          <p className="muted">Add new titles to the kiosk and remove ones that are no longer stocked.</p>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <section className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Add a new book</h2>
        <form onSubmit={handleAdd} className="staff-form">
          <label>
            Title *
            <input type="text" value={form.title} onChange={update('title')} required maxLength={255} />
          </label>
          <label>
            Author *
            <input type="text" value={form.author} onChange={update('author')} required maxLength={255} />
          </label>
          <label>
            Genre
            <input type="text" value={form.genre} onChange={update('genre')} maxLength={100} placeholder="e.g. Fantasy" />
          </label>
          <label>
            ISBN
            <input type="text" value={form.isbn} onChange={update('isbn')} maxLength={20} placeholder="optional" />
          </label>
          <label className="full-width">
            Description
            <textarea value={form.description} onChange={update('description')} maxLength={1000} rows={3} />
          </label>
          <div className="full-width" style={{ display: 'flex', gap: 8, marginTop: '10px'}}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Adding…' : 'Add book'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setForm(EMPTY_FORM)} disabled={submitting}>
              Clear
            </button>
          </div>
        </form>
      </section>

      <h2>Catalog ({books.length})</h2>
      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <div className="staff-book-list">
          {books.map((book) => (
            <div key={book.id} className="staff-book-row">
              <div>
                <strong>{book.title}</strong>
                <p className="muted">
                  by {book.author} {book.genre && `· ${book.genre}`}
                </p>
                <span className={`chip ${book.available ? 'chip-ok' : 'chip-warn'}`}>
                  {book.available ? 'Available' : 'Checked out'}
                </span>
              </div>
              <button
                className="btn btn-ghost"
                onClick={() => handleDelete(book)}
                disabled={deletingId === book.id}
                style={{ color: '#b91c1c', borderColor: '#df4040', marginBottom: '10px'}}
              >
                {deletingId === book.id ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
