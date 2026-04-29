import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { useNotifications } from '../context/NotificationContext.jsx';

const EMPTY_FORM = { title: '', author: '', isbn: '', condition: 'GOOD' };

const STATUS_LABELS = {
  PENDING_REVIEW: { label: 'Awaiting review', tone: '' },
  ACCEPTED: { label: 'Added to catalog', tone: 'chip-ok' },
  REJECTED: { label: 'Could not accept', tone: 'chip-warn' }
};

export default function Donate() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { refresh: refreshNotifications } = useNotifications();

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/donations/mine');
      setHistory(data);
    } catch (err) { /* soft fail */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      const { data } = await api.post('/donations', form);
      setSuccess(`Thanks for donating "${data.title}". Library staff will review it.`);
      setForm(EMPTY_FORM);
      await fetchHistory();
      refreshNotifications();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit your donation. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <div className="eyebrow">Give back</div>
        <h1>Donate a book</h1>
        <p>
          Have a book you'd like to give to the kiosk? Drop it in the donation slot,
          then fill out this form. Library staff reviews each donation before adding
          it to the catalog.
        </p>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <section className="card" style={{ marginBottom: 32 }}>
        <h2 style={{ marginTop: 0 }}>Submit a donation</h2>
        <form onSubmit={handleSubmit} className="field-grid">
          <div className="field">
            <label htmlFor="title">Title *</label>
            <input id="title" type="text" value={form.title}
                   onChange={update('title')} required maxLength={255} />
          </div>
          <div className="field">
            <label htmlFor="author">Author *</label>
            <input id="author" type="text" value={form.author}
                   onChange={update('author')} required maxLength={255} />
          </div>
          <div className="field">
            <label htmlFor="isbn">ISBN</label>
            <input id="isbn" type="text" value={form.isbn}
                   onChange={update('isbn')} placeholder="optional" maxLength={20} />
          </div>
          <div className="field">
            <label htmlFor="condition">Condition *</label>
            <select id="condition" value={form.condition} onChange={update('condition')}>
              <option value="NEW">New — looks unread</option>
              <option value="GOOD">Good — minor wear</option>
              <option value="FAIR">Fair — readable but worn</option>
              <option value="POOR">Poor — significant wear</option>
            </select>
          </div>
          <div className="full-width">
            <button type="submit" className="btn btn-accent" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit donation'}
            </button>
          </div>
        </form>
      </section>

      <h2 style={{ marginBottom: 16 }}>Your donation history</h2>
      {loading ? (
        <p className="muted">Loading…</p>
      ) : history.length === 0 ? (
        <p className="muted">You haven't donated anything yet.</p>
      ) : (
        <div className="row-list">
          {history.map((d) => {
            const info = STATUS_LABELS[d.status] || { label: d.status, tone: '' };
            return (
              <div key={d.id} className="row-item">
                <div className="row-item-info">
                  <h3>{d.title}</h3>
                  <p className="muted">by {d.author} · condition: {d.condition.toLowerCase()}</p>
                  <p>Donated {d.donationDate}</p>
                </div>
                <span className={`chip ${info.tone}`}>{info.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}