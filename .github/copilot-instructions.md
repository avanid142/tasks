# Copilot Instructions for login-dashboard-app ✅

## Big-picture (what this app is)
- Single-process Node/Express app (entry: `server.js`) that serves a static single-page UI from `public/` and exposes a small JSON API for auth and tasks.
- UI: `public/login.html` (POSTs to `/login`) and `public/dashboard.html` (fetches `/tasks` endpoints).

## Key files & where to look 🔎
- `server.js` — entire server logic (middleware, routes, in-memory data). Primary file for changes.
- `package.json` — run scripts and declared dependencies (`npm start` runs `node server.js`).
- `public/login.html`, `public/dashboard.html` — client-side JS shows how the API is consumed (examples for fetch calls and required `credentials: "include"`).

## Runtime & developer workflow ⚙️
- Start server: `npm start` (runs `node server.js`). Server binds to port 3000 (constant in `server.js`).
- The project uses `dotenv` but no `.env` is present — env patterns exist but are not wired in (see notes below).
- No test script or CI config found.

## Auth & data patterns (explicit, actionable) 🔐
- Auth flow: client POSTs JSON to `/login` with `{ username, password }`. Server sets an HTTP-only `token` cookie on success.
- Protected routes use `auth` middleware that reads `req.cookies.token` and calls `jwt.verify(token, "secret123")`.
  - Example of protected endpoint: `GET /dashboard` and all `/tasks` endpoints.
- Data storage: in-memory objects
  - `users` array is hardcoded (e.g., `{ username: "admin", password: "1234" }`).
  - `tasks` is an object mapping username → array of tasks. Task IDs are array indices (unstable on deletes).

## Important implementation notes & gotchas ⚠️
- Security:
  - JWT secret is hardcoded (`"secret123"`) inside `server.js`; prefer `process.env.JWT_SECRET` (env-based secret) for production.
  - Passwords are stored and compared in plaintext in `users` (no hashing) — look for `bcrypt` or `bcryptjs` in `package.json` (installed but not used).
  - Cookie is `httpOnly` but not `secure` — currently safe only on http in development; adjust for production.
- Stability:
  - Task IDs are array indices. Deleting tasks shifts indices; any client code that stores indices will break. Consider persisting unique IDs if mutability is needed.
- Dependencies mismatch: `mongoose` is present in `package.json` but no models or DB code are used. This indicates a possible intended migration to a DB that is not implemented.

## How the client interacts with the API (examples) 🧩
- Login (from `public/login.html`):
  - fetch('/login', { method: 'POST', credentials: 'include', body: JSON.stringify({username, password}) })
- Get tasks (from `public/dashboard.html`):
  - fetch('/tasks', { credentials: 'include' }) → expects JSON array of tasks
- Mutations use `credentials: 'include'` so API relies on cookie-based auth.

## Recommended small, safe changes an agent can suggest or implement (concrete) 🛠️
- Replace the hardcoded JWT secret with `process.env.JWT_SECRET || 'dev-secret'` and document expected `.env` values.
- Remove unused dependencies (`mongoose`, `bcrypt`/`bcryptjs`) or add a TODO comment explaining intended future work.
- Make task IDs stable by adding an `id` field (UUID/increment) rather than relying on array indices.

## Contribution conventions & style notes ✍️
- Single-file server: prefer small, isolated changes to `server.js` (add tests or extract features only when necessary).
- UI examples are simple inline scripts — make front-end changes within `public/*.html` where needed for quick prototyping.

---
If anything is unclear or you'd like more specific code snippets (e.g., a secure auth refactor or adding a basic test), tell me which area to update and I will iterate. 💡