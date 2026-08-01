# Sof2eze

A software company portal built as a CMS-driven web application: a React/Tailwind frontend, a custom Node.js/Express backend, and a headless-CMS-shaped content layer — kept as three independently deployable pieces, matching the architecture in `Sof2eze_SRS_1_2.docx`.

This project runs completely locally with **zero external accounts required** — no real Strapi, no real cloud storage, no real email provider. Every one of those is behind a small adapter so you can swap in the real thing later without touching route logic. See "Going to production" below for exactly what to swap.

## What's actually in here

```
sof2eze/
├── backend/     Custom Express API — auth, forms, applications, admin dashboard
├── mock-cms/    Stand-in for Strapi (same API shape) — swap out once your teammate's CMS is ready
└── frontend/    React + Tailwind, talks to both of the above over HTTP only
```

Why a `mock-cms` folder exists: this project's whole architecture is built around *not* letting the frontend touch CMS data directly except through an API. Building the frontend against a real Strapi instance wasn't available yet, so `mock-cms` serves the exact same endpoint shapes Strapi would (`/api/services`, `/api/blog`, `/api/jobs`, etc.), including the Draft/Published/Unpublished filtering rule from the SRS. When the real CMS is ready, point `VITE_CMS_API_URL` at it and delete this folder — no frontend code changes needed.

## Quick start

You'll need Node.js 18+ installed. Three terminals:

```bash
# Terminal 1 — mock CMS (stand-in for Strapi)
cd mock-cms
npm install
npm start                    # http://localhost:4001

# Terminal 2 — backend
cd backend
npm install
cp .env.example .env
# Edit .env: set JWT_ACCESS_SECRET, JWT_REFRESH_SECRET (openssl rand -hex 32),
# and SEED_ADMIN_PASSWORD to something real.
npm run seed                 # creates your first Admin login
npm start                    # http://localhost:4000

# Terminal 3 — frontend
cd frontend
npm install
npm run dev                  # http://localhost:5173
```

Open `http://localhost:5173`. Log in at `/login` with the email/password you set in `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.

## What's implemented

Every FR/NFR from the SRS that falls on the "your side" of the architecture (frontend + custom backend — the CMS-owned content types are the other team member's responsibility):

- **Public pages**: Home, About, Services, Team, Blog (list + detail), Careers (list + detail), all CMS-driven
- **Forms**: Contact (FR10), newsletter subscribe/unsubscribe (FR11), job application with resume upload (FR12)
- **Search**: site-wide search across blog posts and services (FR15) — implemented as the backend querying the CMS server-side, matching the system context diagram
- **Auth**: JWT login/logout/session-refresh (UC-5), access token held in memory only on the frontend, refresh token in an httpOnly cookie (FR22)
- **Admin dashboard**: list + filter submissions, change status, download resumes, role-gated (Admin vs Staff) (FR16–FR21)
- **Status lifecycle**: New → Reviewed → Archived, New → Archived, Archived → Reviewed — enforced server-side, not just in the UI

## Security measures actually in place

- Passwords hashed with bcrypt (12 rounds), never stored or logged in plaintext
- JWT access tokens are short-lived (15 min default) and held in memory only on the frontend — never localStorage/sessionStorage
- Refresh tokens live only in an httpOnly, sameSite=strict cookie — inaccessible to JS, so an XSS bug can't steal it
- All inputs validated server-side with Zod, independent of whatever the frontend already checked
- Rate limiting on every public form endpoint and a stricter limit on login (brute-force mitigation)
- `helmet` for standard security headers, strict CORS allow-list
- File uploads restricted by MIME type and size (5MB), streamed through memory rather than trusted client-supplied extensions
- Every admin status change is logged with actor + timestamp (`auditLogs`)
- Centralized error handler that never leaks stack traces to the client

## Going to production

Three things in here are deliberately "good enough for local development, not for production," each isolated to one file so swapping them is small:

| Concern | Dev implementation | Production swap |
|---|---|---|
| Database | `backend/src/db/store.js` — JSON file via `lowdb` | Point this file at Postgres/MySQL/Mongo. Every route already goes through the repository functions here, not raw queries, so this is the only file that changes. |
| Resume storage | `backend/src/utils/cloudStorage.js` — local `uploads/` folder | Set `STORAGE_DRIVER=cloudinary` and add your `CLOUDINARY_URL`; wire up the two-line SDK call flagged in that file. |
| Email | `backend/src/utils/email.js` — logs to console | Set `EMAIL_PROVIDER_API_KEY` and wire up your provider's SDK (Resend, SendGrid, Nodemailer/SMTP — any of them). |
| CMS | `mock-cms/` | Set `VITE_CMS_API_URL` (frontend) and `CMS_API_URL` (backend) to your real Strapi URL. Delete `mock-cms/`. |

Per the SRS: frontend → Vercel, backend/CMS → Railway.

## Environment variables

See `backend/.env.example` for the full list with comments. The two you must change before running anything for real: `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (generate with `openssl rand -hex 32` — don't reuse the placeholder values, don't reuse the same value for both).

## A note on scope

This implements FR10–FR25 and the NFRs that are testable at this scale (validation, rate limiting, RBAC, auth token handling, etc.). It does not implement a real Strapi instance (that's explicitly the other team member's part of the project per the SRS) or a production database/hosting setup — both are swap-in points documented above, not gaps in the logic.
