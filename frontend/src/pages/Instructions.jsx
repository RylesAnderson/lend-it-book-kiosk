/**
 * Implements the InstructionGuide use case: a public, no-login-required
 * walkthrough of how to use the kiosk. Worth keeping deliberately plain
 * so it works for first-time visitors who haven't signed up yet.
 */
export default function Instructions() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>How to use the kiosk</h1>
          <p className="muted">
            A quick walkthrough of borrowing, reserving, returning, and donating books.
          </p>
        </div>
      </div>

      <Step number={1} title="Create an account">
        <p>
          Tap <strong>Sign up</strong> in the top-right corner. You'll need an email address
          and a password (at least 6 characters). Your account works on the website and at
          the physical kiosk.
        </p>
      </Step>

      <Step number={2} title="Browse the catalog">
        <p>
          Use the <strong>Browse</strong> page to search by title or author. Toggle{' '}
          <em>Available now</em> to hide books that are currently checked out. Tap any book
          for more details.
        </p>
      </Step>

      <Step number={3} title="Borrow a book">
        <p>
          On a book's detail page, tap <strong>Borrow this book</strong>. The kiosk
          dispenses the book and your loan starts immediately. Loans run for{' '}
          <strong>14 days</strong>. You'll get an email confirmation, and the loan shows
          up on your <strong>My Loans</strong> page.
        </p>
      </Step>

      <Step number={4} title="Reserve a checked-out book">
        <p>
          If a book is already checked out, you'll see a <strong>Reserve</strong> button on
          its detail page. Reserving puts you in line — when the book comes back, we email
          you and hold it for <strong>3 days</strong> for you to pick up. After that the
          reservation expires and the book goes to the next person in line.
        </p>
      </Step>

      <Step number={5} title="Return a book">
        <p>
          Drop the book in the kiosk's return slot. Then open <strong>My Loans</strong> and
          tap <strong>Return</strong> next to the loan. You'll get an email confirmation.
        </p>
      </Step>

      <Step number={6} title="Donate a book">
        <p>
          Have a book to give to the library? Open <strong>Donate</strong>, fill out the
          short form (title, author, condition), and drop the book at the kiosk. Library
          staff reviews each donation — if accepted, it gets added to the catalog and
          you'll receive an email saying so.
        </p>
      </Step>

      <Step number={7} title="Watch your notifications">
        <p>
          The bell icon in the top-right shows your recent activity: loan and return
          confirmations, reservation updates, and donation status changes. The number on
          the bell is unread notifications.
        </p>
      </Step>

      <section className="card" style={{ marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Need help?</h2>
        <p style={{ marginBottom: 0 }}>
          For anything the kiosk can't help with, talk to library staff at the front desk
          or check your email for kiosk notifications and reminders.
        </p>
      </section>
    </div>
  );
}

function Step({ number, title, children }) {
  return (
    <section className="card guide-step">
      <div className="guide-step-number" aria-hidden="true">{number}</div>
      <div>
        <h2 style={{ marginTop: 0 }}>{title}</h2>
        {children}
      </div>
    </section>
  );
}