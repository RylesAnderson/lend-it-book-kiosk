import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';

const STATUS_INFO = {
  PENDING:   { label: 'In line',          tone: '' },
  READY:     { label: 'Ready for pickup', tone: 'chip-warn' },
  FULFILLED: { label: 'Picked up',        tone: 'chip-ok' },
  CANCELLED: { label: 'Cancelled',        tone: '' },
  EXPIRED:   { label: 'Expired',          tone: '' }
};

export default function MyReservations() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const fetch = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await api.get('/reservations/me');
      setList(data);
    } catch (err) {
      setError('Could not load your reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this reservation?')) return;
    setCancellingId(id); setError('');
    try {
      await api.delete(`/reservations/${id}`);
      await fetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel.');
    } finally {
      setCancellingId(null);
    }
  };

  const active = list.filter((r) => r.status === 'PENDING' || r.status === 'READY');
  const past = list.filter((r) => r.status !== 'PENDING' && r.status !== 'READY');

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <div className="eyebrow">Your account</div>
        <h1>My reservations</h1>
        <p>
          Books you've reserved while they were checked out. We'll email you when
          your book is ready and hold it for 3 days.
        </p>
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <p className="muted">Loading…</p>}

      {!loading && list.length === 0 && (
        <p className="muted">
          You have no reservations. Visit <Link to="/books">Browse</Link> and reserve any
          book that's currently checked out.
        </p>
      )}

      <div className="row-list">
        {active.length > 0 && <h2>Active ({active.length})</h2>}
        {active.map((r) => {
          const info = STATUS_INFO[r.status];
          return (
            <div key={r.id} className="row-item">
              <div className="row-item-info">
                <h3>{r.bookTitle}</h3>
                <p className="muted">by {r.bookAuthor}</p>
                <p>
                  Reserved {r.reservedDate}
                  {r.readyUntilDate && ` · pick up by ${r.readyUntilDate}`}
                </p>
              </div>
              <div className="row-item-actions">
                <span className={`chip ${info.tone}`}>{info.label}</span>
                <button
                  className="btn btn-ghost"
                  disabled={cancellingId === r.id}
                  onClick={() => handleCancel(r.id)}
                >
                  {cancellingId === r.id ? 'Cancelling…' : 'Cancel'}
                </button>
              </div>
            </div>
          );
        })}

        {past.length > 0 && <h2>History</h2>}
        {past.map((r) => {
          const info = STATUS_INFO[r.status] || { label: r.status, tone: '' };
          return (
            <div key={r.id} className="row-item">
              <div className="row-item-info">
                <h3>{r.bookTitle}</h3>
                <p className="muted">by {r.bookAuthor}</p>
                <p>Reserved {r.reservedDate}</p>
              </div>
              <span className={`chip ${info.tone}`}>{info.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}