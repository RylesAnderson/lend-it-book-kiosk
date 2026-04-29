import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refresh: refreshNotifications } = useNotifications();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [borrowing, setBorrowing] = useState(false);
  const [reserving, setReserving] = useState(false);
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
    if (!user) { navigate('/login'); return; }
    setBorrowing(true); setError(''); setSuccessMsg('');
    try {
      const { data } = await api.post('/loans', { bookId: Number(id) });
      setSuccessMsg(`Borrowed! Due back on ${data.dueDate}.`);
      await fetchBook();
      refreshNotifications();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not borrow this book.');
    } finally {
      setBorrowing(false);
    }
  };

  const handleReserve = async () => {
    if (!user) { navigate('/login'); return; }
    setReserving(true); setError(''); setSuccessMsg('');
    try {
      await api.post('/reservations', { bookId: Number(id) });
      setSuccessMsg("You're in line. We'll email you when this book is ready to pick up.");
      refreshNotifications();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reserve this book.');
    } finally {
      setReserving(false);
    }
  };

  if (loading) return <div className="page"><p className="muted">Loading…</p></div>;
  if (error && !book) return <div className="page"><div className="error">{error}</div></div>;
  if (!book) return null;

  return (
    <div className="page">
      <button className="detail-back" onClick={() => navigate('/books')}>
        ← Back to catalog
      </button>

      <div className="detail-layout">
        <div className="detail-cover" aria-hidden="true">{book.title.charAt(0)}</div>

        <div className="detail-body">
          {book.genre && <div className="detail-eyebrow">{book.genre}</div>}
          <h1>{book.title}</h1>
          <p className="detail-author">by {book.author}</p>

          <div className="chip-row">
            <span className={`chip ${book.available ? 'chip-ok' : 'chip-warn'}`}>
              {book.available ? 'Available now' : 'Checked out'}
            </span>
            {book.isbn && <span className="chip chip-isbn">ISBN {book.isbn}</span>}
          </div>

          {book.description && <p className="detail-description">{book.description}</p>}

          {successMsg && <div className="success" style={{ marginBottom: 16 }}>{successMsg}</div>}
          {error && <div className="error" style={{ marginBottom: 16 }}>{error}</div>}

          <div className="detail-actions">
            {book.available ? (
              <button className="btn btn-accent btn-lg" disabled={borrowing} onClick={handleBorrow}>
                {borrowing ? 'Processing…' : 'Borrow this book'}
              </button>
            ) : (
              <>
                <button className="btn btn-primary btn-lg" disabled={reserving} onClick={handleReserve}>
                  {reserving ? 'Processing…' : 'Reserve this book'}
                </button>
                <p className="muted">
                  This book is checked out. Reserve it and we'll email you when it's
                  ready to pick up.
                </p>
              </>
            )}
            {!user && <p className="muted">You'll need to log in first.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}