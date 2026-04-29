import { useEffect, useRef, useState } from 'react';
import { useNotifications } from '../context/NotificationContext.jsx';

/**
 * Bell icon in the navbar with an unread badge.
 *
 * Click to open a dropdown panel showing recent notifications. Clicking a
 * notification marks it read; "Mark all read" clears the badge in one go.
 *
 * The panel closes when the user clicks outside it or presses Escape, which
 * is the standard expected behavior for navbar popovers and prevents it from
 * being stuck open accidentally.
 */
export default function NotificationBell() {
  const { items, unread, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close on outside click + Escape key
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="bell-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className="bell-button"
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <BellIcon />
        {unread > 0 && (
          <span className="bell-badge" aria-hidden="true">{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <div className="bell-panel" role="dialog" aria-label="Notifications">
          <div className="bell-panel-header">
            <strong>Notifications</strong>
            {items.some((n) => !n.readByUser) && (
              <button className="link-button" onClick={markAllRead}>Mark all read</button>
            )}
          </div>

          <div className="bell-panel-list">
            {items.length === 0 ? (
              <p className="muted center" style={{ padding: '24px 12px' }}>
                You have no notifications yet.
              </p>
            ) : (
              items.slice(0, 12).map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`bell-item ${n.readByUser ? '' : 'bell-item-unread'}`}
                  onClick={() => !n.readByUser && markRead(n.id)}
                >
                  <div className="bell-item-subject">
                    {!n.readByUser && <span className="bell-dot" aria-hidden="true" />}
                    {n.subject}
                  </div>
                  <div className="bell-item-message">{n.message}</div>
                  <div className="bell-item-time">{formatTime(n.createdAt)}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 7) return `${diffD}d ago`;
  return d.toLocaleDateString();
}