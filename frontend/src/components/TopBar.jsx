/**
 * The thin utility bar above the main navbar — a pattern lifted directly
 * from corporate sites (ADP, banks, telecoms). It signals "we're a real
 * institution" with hours, phone, and a quick support link, without
 * crowding the primary nav.
 */
export default function TopBar() {
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <div>
          <span>Hours: Mon–Fri 8a–10p</span>
          <span className="topbar-divider" style={{ margin: '0 12px' }} />
          <span>Sat–Sun 10a–8p</span>
        </div>
        <div>
          <a href="tel:+15555550100">+1 (555) 555-0100</a>
          <span className="topbar-divider" style={{ margin: '0 12px' }} />
          <a href="#" onClick={(e) => e.preventDefault()}>Support</a>
        </div>
      </div>
    </div>
  );
}