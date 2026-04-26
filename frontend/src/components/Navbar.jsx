import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <Link to="/books" className="brand">
        Lend IT <span>Book Kiosk</span>
      </Link>
      <nav className="nav-links">
        <Link to="/books">Browse</Link>
        {user && <Link to="/my-loans">My Loans</Link>}
        {user ? (
          <>
            <span className="nav-user">Hi, {user.name}</span>
            <button className="btn btn-ghost" onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn btn-primary">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  );
}
