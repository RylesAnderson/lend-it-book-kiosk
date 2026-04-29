import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import api from '../api/client.js';
import { useAuth } from './AuthContext.jsx';

/**
 * Holds the user's notification list + unread count and exposes refresh/markRead.
 *
 * Why a context?  The bell icon (in the navbar) shows a badge with the unread
 * count, the popup panel shows the list, and elsewhere in the app (e.g. after
 * borrowing a book) we want to refresh the count. Keeping all of this in one
 * place avoids duplicate fetching and out-of-sync UI.
 *
 * The polling interval is intentionally lazy (45s) — this is a kiosk-style app,
 * not a chat app. If we ever want push, swap polling for SSE or websockets.
 */

const POLL_MS = 45_000;
const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      setUnread(0);
      return;
    }
    setLoading(true);
    try {
      const [listRes, countRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/unread-count')
      ]);
      setItems(listRes.data);
      setUnread(countRes.data.count || 0);
    } catch (err) {
      // Soft-fail: keep prior state. We don't want notifications to crash the app.
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
    if (!user) return;
    pollRef.current = setInterval(refresh, POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [user, refresh]);

  const markRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, readByUser: true } : n)));
      setUnread((c) => Math.max(0, c - 1));
    } catch (err) { /* ignore */ }
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setItems((prev) => prev.map((n) => ({ ...n, readByUser: true })));
      setUnread(0);
    } catch (err) { /* ignore */ }
  };

  return (
    <NotificationContext.Provider value={{ items, unread, loading, refresh, markRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}