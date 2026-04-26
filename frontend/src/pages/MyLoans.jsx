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
    <div className={`loan-row ${overdue ? 'loan-overdue' : ''}`}>
      <div className="loan-info">
        <h3>{loan.bookTitle}</h3>
        <p className="muted">by {loan.bookAuthor}</p>
        <p>
          Borrowed {loan.borrowDate} · Due {loan.dueDate}
          {isActive && !overdue && ` · ${daysLeft} day${daysLeft === 1 ? '' : 's'} left`}
          {overdue && ` · ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? '' : 's'} overdue`}
          {loan.returnDate && ` · Returned ${loan.returnDate}`}
        </p>
      </div>
      <div className="loan-action">
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

  const handleReturn = async (loanId) => {
    setReturningId(loanId);
    try {
      await api.post(`/loans/${loanId}/return`);
      await fetchLoans();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not return this book.');
    } finally {
      setReturningId(null);
    }
  };

  const activeLoans = loans.filter((l) => l.status === 'ACTIVE');
  const pastLoans = loans.filter((l) => l.status !== 'ACTIVE');

  return (
    <div className="page">
      <div className="page-header">
        <h1>My loans</h1>
        <p className="muted">Your active and past borrows.</p>
      </div>

      {loading && <p className="muted">Loading…</p>}
      {error && <div className="error">{error}</div>}

      {!loading && loans.length === 0 && (
        <p className="muted">You haven't borrowed anything yet.</p>
      )}

      {activeLoans.length > 0 && (
        <section>
          <h2>Active ({activeLoans.length})</h2>
          <div className="loan-list">
            {activeLoans.map((l) => (
              <LoanRow key={l.id} loan={l} onReturn={handleReturn} returningId={returningId} />
            ))}
          </div>
        </section>
      )}

      {pastLoans.length > 0 && (
        <section>
          <h2>History</h2>
          <div className="loan-list">
            {pastLoans.map((l) => (
              <LoanRow key={l.id} loan={l} onReturn={handleReturn} returningId={returningId} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
