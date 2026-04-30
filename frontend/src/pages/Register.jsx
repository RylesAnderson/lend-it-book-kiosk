import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const EMPTY = { name: '', email: '', password: '' };

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/books');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <div className="auth-aside-eyebrow">Free membership</div>
        <div>
          <h2 className="auth-aside-headline">
            Open a <em>card</em>.
          </h2>
          <p className="auth-aside-blurb">
            One account is all you need to borrow books, reserve titles when
            they're checked out, and donate books you've finished.
          </p>
        </div>
        <div className="auth-aside-meta">
          Already a member? <Link to="/login" style={{ color: '#FFF' }}>Sign in</Link>.
        </div>
      </aside>

      <main className="auth-main">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h1>Create account</h1>
          <p>Already have one? <Link to="/login">Sign in</Link>.</p>

          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" type="text" value={form.name}
                   onChange={update('name')} required autoFocus />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={form.email}
                   onChange={update('email')} required autoComplete="email" />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={form.password}
                   onChange={update('password')} required minLength={6}
                   autoComplete="new-password" />
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>
      </main>
    </div>
  );
}