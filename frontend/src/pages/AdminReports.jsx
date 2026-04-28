import { useEffect, useState } from 'react';
import api from '../api/client.js';

function StatCard({ label, value, accent }) {
  return (
    <div className="stat-card">
      <div className="stat-value" style={accent ? { color: accent } : undefined}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function AdminReports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/reports/summary');
      setReport(data);
    } catch (err) {
      const status = err.response?.status;
      setError(status === 403
        ? 'Admin access required.'
        : 'Could not load the report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, []);

  if (loading) return <div className="page"><p className="muted">Loading report…</p></div>;
  if (error) return <div className="page"><div className="error">{error}</div></div>;
  if (!report) return null;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Admin dashboard</h1>
          <p className="muted">Snapshot of kiosk activity right now.</p>
        </div>
        <button className="btn btn-ghost" onClick={fetchReport}>Refresh</button>
      </div>

      <h2>Catalog</h2>
      <div className="stat-grid">
        <StatCard label="Total books" value={report.totalBooks} />
        <StatCard label="Available" value={report.availableBooks} accent="#166534" />
        <StatCard label="Checked out" value={report.checkedOutBooks} accent="#b45309" />
      </div>

      <h2>Activity</h2>
      <div className="stat-grid">
        <StatCard label="Registered users" value={report.totalUsers} />
        <StatCard label="Active loans" value={report.activeLoans} />
        <StatCard label="Overdue loans" value={report.overdueLoans} accent={report.overdueLoans > 0 ? '#991b1b' : undefined} />
        <StatCard label="Total loans (all time)" value={report.totalLoansAllTime} />
      </div>

      <h2>Most borrowed books</h2>
      {report.mostBorrowedBooks.length === 0 ? (
        <p className="muted">No loans yet, so nothing to rank.</p>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="report-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Author</th>
                <th style={{ textAlign: 'right' }}>Times borrowed</th>
              </tr>
            </thead>
            <tbody>
              {report.mostBorrowedBooks.map((book, i) => (
                <tr key={book.bookId}>
                  <td>{i + 1}</td>
                  <td>{book.title}</td>
                  <td className="muted">{book.author}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{book.borrowCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
