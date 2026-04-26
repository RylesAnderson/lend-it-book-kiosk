import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [borrowing, setBorrowing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchBook = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/books/${id}`);
      setBook(data);
    } catch (err) {
      setError('Book not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleBorrow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setBorrowing(true);
    setError('');
    setSuccessMsg('');
    try {
      const { data } = await api.post('/loans', { bookId: Number(id) });
      setSuccessMsg(`Borrowed! Due back on ${data.dueDate}.`);
      await fetchBook(); // refresh availability
    } catch (err) {
      setError(err.response?.data?.message || 'Could not borrow this book.');
    } finally {
      setBorrowing(false);
    }
  };

  if (loading) return <div className="page"><p className="muted">Loading…</p></div>;
  if (error && !book) return <div className="page"><div className="error">{error}</div></div>;
  if (!book) return null;

  return (
    <div className="page">
      <button className="btn btn-ghost" onClick={() => navigate('/books')}>← Back to catalog</button>

      <div className="detail-layout">
        <div className="detail-cover" aria-hidden="true">{book.title.charAt(0)}</div>

        <div className="detail-body">
          <h1>{book.title}</h1>
          <p className="detail-author">by {book.author}</p>

          <div className="chip-row">
            {book.genre && <span className="chip">{book.genre}</span>}
            <span className={`chip ${book.available ? 'chip-ok' : 'chip-warn'}`}>
              {book.available ? 'Available now' : 'Checked out'}
            </span>
            {book.isbn && <span className="chip">ISBN {book.isbn}</span>}
          </div>

          {book.description && <p className="detail-description">{book.description}</p>}

          {successMsg && <div className="success">{successMsg}</div>}
          {error && <div className="error">{error}</div>}

          <div className="detail-actions">
            <button
              className="btn btn-primary btn-lg"
              disabled={!book.available || borrowing}
              onClick={handleBorrow}
            >
              {borrowing ? 'Processing…' : book.available ? 'Borrow this book' : 'Not available'}
            </button>
            {!user && book.available && (
              <p className="muted">You'll need to log in first.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
