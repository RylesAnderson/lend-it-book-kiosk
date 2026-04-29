import { useEffect, useState } from 'react';
import api from '../api/client.js';

function daysBetween(d1, d2) {
  const ms = new Date(d2).getTime() - new Date(d1).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function LoanRow({ loan, onReturn, returningId }) {
  const today = new Date().toISOString().slice(0, 10);
  const isActive = loan.status === 'ACTIVE';
  const daysLeft = isActive ? daysBetween(today, loan.dueDate) : null;
  const overdue = isActive && daysLeft < 0;

  return (
    <div className={`row-item ${overdue ? 'row-overdue' : ''}`}>
      <div className="row-item-info">
        <h3>{loan.bookTitle}</h3>
        <p className="muted">by {loan.bookAuthor}</p>
        <p>
          Borrowed {loan.borrowDate} · Due {loan.dueDate}
          {isActive && !overdue && ` · ${daysLeft} day${daysLeft === 1 ? '' : 's'} left`}
          {overdue && ` · ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? '' : 's'} overdue`}
          {loan.returnDate && ` · Returned ${loan.returnDate}`}
        </p>
      </div>
      <div className="row-item-actions">
        <span className={`chip ${isActive ? (overdue ? 'chip-warn' : 'chip-ok') : ''}`}>
          {loan.status}
        </span>
        {isActive && (
          <button
            className="btn btn-primary"
            onClick={() => onReturn(loan.id)}
            disabled={returningId === loan.id}
          >
            {returningId === loan.id ? 'Returning…' : 'Return'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function MyLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [returningId, setReturningId] = useState(null);

  const fetchLoans = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/loans/me');
      setLoans(data);
    } catch (err) {
      setError('Could not load your loans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLoans(); }, []);

  const handleReturn = async (id) => {
    setReturningId(id);
    setError('');
    try {
      await api.post(`/loans/${id}/return`);
      await fetchLoans();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not return.');
    } finally {
      setReturningId(null);
    }
  };

  const active = loans.filter((l) => l.status === 'ACTIVE');
  const past = loans.filter((l) => l.status !== 'ACTIVE');

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <div className="eyebrow">Your account</div>
        <h1>My loans</h1>
        <p>Books you've checked out from the kiosk. Return them when you're done.</p>
      </div>

      {loading && <p className="muted">Loading…</p>}
      {error && <div className="error">{error}</div>}
      {!loading && loans.length === 0 && <p className="muted">No loans yet.</p>}

      <div className="row-list">
        {active.length > 0 && <h2>Active ({active.length})</h2>}
        {active.map((l) =>
          <LoanRow key={l.id} loan={l} onReturn={handleReturn} returningId={returningId} />
        )}

        {past.length > 0 && <h2>History</h2>}
        {past.map((l) =>
          <LoanRow key={l.id} loan={l} onReturn={handleReturn} returningId={returningId} />
        )}
      </div>
    </div>
  );
}