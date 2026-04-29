import { Link } from 'react-router-dom';

/**
 * Site-wide footer modeled on the link-column footers used by ADP / Experient.
 * Adds a sense of completeness — a kiosk app without a footer always feels
 * unfinished, even though the routes themselves are intentionally short.
 */
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              Lend IT
              <span className="footer-brand-tag">Book Kiosk</span>
            </div>
            <p className="footer-tag">
              An automated lending kiosk bringing curated reading to campuses,
              dorms, and community spaces.
            </p>
          </div>

          <div className="footer-col">
            <h4>Patrons</h4>
            <ul>
              <li><Link to="/books">Browse</Link></li>
              <li><Link to="/instructions">How to use</Link></li>
              <li><Link to="/donate">Donate a book</Link></li>
              <li><Link to="/my-loans">My loans</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>About</h4>
            <ul>
              <li><Link to="/instructions">How it works</Link></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Locations</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Hours</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Contact</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Library</h4>
            <ul>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Privacy</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Accessibility</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Press</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Careers</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-meta">
          <span>© {new Date().getFullYear()} Lend IT Book Kiosk. All rights reserved.</span>
          <span>Designed for libraries that read the room.</span>
        </div>
      </div>
    </footer>
  );
}