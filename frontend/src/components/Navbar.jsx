import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import NotificationBell from './NotificationBell.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isStaff = user && (user.role === 'STAFF' || user.role === 'ADMIN');
  const isAdmin = user && user.role === 'ADMIN';

  return (
    <header className="navbar">
      <Link to="/books" className="brand">
        Lend IT <span>Book Kiosk</span>
      </Link>
      <nav className="nav-links">
        <Link to="/books">Browse</Link>
        <Link to="/instructions">How to use</Link>

        {user && <Link to="/my-loans">My Loans</Link>}
        {user && <Link to="/my-reservations">Reservations</Link>}
        {user && <Link to="/donate">Donate</Link>}

        {isStaff && <Link to="/staff">Manage Books</Link>}
        {isAdmin && <Link to="/admin">Admin</Link>}

        {user ? (
          <>
            <NotificationBell />
            <span className="nav-user">
              Hi, {user.name}
              {user.role !== 'STUDENT' && (
                <span className={`role-badge role-${user.role.toLowerCase()}`}>
                  {user.role}
                </span>
              )}
            </span>
            <button className="btn btn-ghost" onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  );
}