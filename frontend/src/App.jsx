import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import BrowseBooks from './pages/BrowseBooks.jsx';
import BookDetail from './pages/BookDetail.jsx';
import MyLoans from './pages/MyLoans.jsx';
import StaffBooks from './pages/StaffBooks.jsx';
import AdminReports from './pages/AdminReports.jsx';
import { useAuth } from './context/AuthContext.jsx';

function ProtectedRoute({ children, requireRole }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  if (requireRole) {
    const ranks = { STUDENT: 0, STAFF: 1, ADMIN: 2 };
    if (ranks[user.role] < ranks[requireRole]) {
      return <Navigate to="/books" replace />;
    }
  }
  return children;
}

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Navigate to="/books" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/books" element={<BrowseBooks />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route
            path="/my-loans"
            element={
              <ProtectedRoute>
                <MyLoans />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute requireRole="STAFF">
                <StaffBooks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireRole="ADMIN">
                <AdminReports />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<p style={{ padding: 24 }}>Page not found.</p>} />
        </Routes>
      </main>
    </div>
  );
}
