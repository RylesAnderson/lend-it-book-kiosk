# Lend IT Book Kiosk — Frontend

React 18 + Vite SPA.

## Run

```bash
npm install     # first time only
npm run dev
```

App runs at `http://localhost:5173`. Make sure the backend is running at `http://localhost:8080` (or override with `.env`).

## Environment

Copy `.env.example` to `.env` to override the API URL:

```
VITE_API_BASE_URL=http://localhost:8080/api
```

In production (Netlify, etc.), set this variable in your host's dashboard.

## Build for deployment

```bash
npm run build
```

Output lands in `dist/`. Upload that folder or point Netlify at it.

## Structure

- `src/main.jsx` — React entry, wraps the app in `BrowserRouter` and `AuthProvider`
- `src/App.jsx` — route definitions
- `src/api/client.js` — Axios instance with auth interceptors
- `src/context/AuthContext.jsx` — user state + login/register/logout
- `src/components/` — `Navbar`, `BookCard`
- `src/pages/` — `Login`, `Register`, `BrowseBooks`, `BookDetail`, `MyLoans`
- `src/styles.css` — all global styles (no CSS framework)

## Adding a new page

1. Create `src/pages/NewPage.jsx`
2. Add a `<Route>` in `src/App.jsx`
3. Add a link in `src/components/Navbar.jsx` if needed
4. Use the shared `api` client for backend calls and `useAuth()` for user state
