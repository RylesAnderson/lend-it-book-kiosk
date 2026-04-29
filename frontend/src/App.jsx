import { Routes, Route, Navigate } from 'react-router-dom';
import TopBar from './components/TopBar.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import BrowseBooks from './pages/BrowseBooks.jsx';
import BookDetail from './pages/BookDetail.jsx';
import MyLoans from './pages/MyLoans.jsx';
import MyReservations from './pages/MyReservations.jsx';
import Donate from './pages/Donate.jsx';
import Instructions from './pages/Instructions.jsx';
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
      <TopBar />
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Navigate to="/books" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/instructions" element={<Instructions />} />

          <Route path="/books" element={<BrowseBooks />} />
          <Route path="/books/:id" element={<BookDetail />} />

          <Route path="/my-loans" element={
            <ProtectedRoute><MyLoans /></ProtectedRoute>
          } />
          <Route path="/my-reservations" element={
            <ProtectedRoute><MyReservations /></ProtectedRoute>
          } />
          <Route path="/donate" element={
            <ProtectedRoute><Donate /></ProtectedRoute>
          } />

          <Route path="/staff" element={
            <ProtectedRoute requireRole="STAFF"><StaffBooks /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requireRole="ADMIN"><AdminReports /></ProtectedRoute>
          } />

          <Route path="*" element={
            <div className="page page-narrow">
              <h1>Page not found</h1>
              <p className="muted">That route doesn't exist. Try Browse or How to use.</p>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}