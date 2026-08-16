# Sof2eze

A software company portal built as a CMS-driven web application: a React/Tailwind frontend, a custom Node.js/Express backend, and a Strapi headless CMS — kept as three independently deployable pieces, matching the architecture in `Sof2eze_SRS_1_2.docx`.

## What's actually in here

```
sof2eze/
├── backend/     Custom Express API — auth, forms, applications, admin dashboard
├── cms/         Strapi headless CMS — Service, TeamMember, BlogPost, JobListing,
│                Portfolio, Testimonial, SiteContent
└── frontend/    React + Tailwind, talks to both of the above over HTTP only
```

The frontend never writes to the CMS directly — it only ever reads from Strapi's public API and sends every user action (forms, applications, auth) to the custom backend. This split is what lets the two of us build in parallel: CMS content modeling on one side, application logic on the other, without either blocking the other.

## Quick start

You'll need Node.js 18+ installed. Three terminals:

```bash
# Terminal 1 — CMS (Strapi)
cd cms
npm install
npm run develop              # http://localhost:1337 — first run prompts you to create an admin account

# Terminal 2 — backend
cd backend
npm install
cp .env.example .env
# Edit .env — see "Environment variables" below for what's required
npm run seed                 # creates your first Admin login
npm start                    # http://localhost:4000

# Terminal 3 — frontend
cd frontend
npm install
cp .env.example .env         # then set VITE_CMS_API_URL and VITE_BACKEND_API_URL
npm run dev                  # http://localhost:5173
```

Open `http://localhost:5173`. Log in at `/login` with the email/password you set in `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.

## What's implemented

Every FR/NFR from the SRS that falls on the "your side" of the architecture (frontend + custom backend — CMS content modeling lives in `cms/`):

- **Public pages**: Home, About, Services, Team, Blog (list + detail), Careers (list + detail), Portfolio, Testimonials — all CMS-driven
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

## Backing services

Unlike an earlier version of this project, nothing here is a local stand-in anymore — all four pieces below are real, working integrations, each isolated to one file so swapping providers stays simple:

| Concern | Implementation | File |
|---|---|---|
| Database | Real MongoDB via Mongoose. Every route goes through the repository functions in this file, not raw queries. | `backend/src/db/store.js` |
| Resume storage | Real Cloudinary (`resource_type: raw`, so PDFs/docs upload unmodified). Falls back to a local `uploads/` folder in dev if `STORAGE_DRIVER=local`. | `backend/src/utils/cloudStorage.js` |
| Email | Real SMTP via Nodemailer. Falls back to a free Ethereal test account in dev if no SMTP credentials are set — emails are captured in a web UI instead of actually delivered. | `backend/src/utils/email.js` |
| CMS | Real Strapi, with custom controllers reshaping every response into a flat, predictable JSON shape (`id`, not Strapi's internal `documentId`). | `cms/` |

**Note on Cloudinary:** new accounts block delivery of raw file types (PDF/ZIP) by default. If resume downloads return an error, check Cloudinary Console → Settings → Security → enable "PDF and ZIP files delivery."

Per the SRS: frontend → Vercel, backend + CMS → Railway.

## Environment variables

**Backend** (`backend/.env.example` has the full list with comments). Required to run at all:
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — generate with `openssl rand -hex 32` (or `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` on Windows) — don't reuse the same value for both
- `MONGODB_URI` — a MongoDB Atlas connection string (free tier is fine)
- `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` — used once by `npm run seed`

Optional (has working dev fallbacks):
- `STORAGE_DRIVER` + `CLOUDINARY_URL` — omit to use local disk storage instead
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` — omit to use Ethereal test emails instead

**Frontend** (`frontend/.env.example`):
- `VITE_CMS_API_URL` — Strapi's URL (`http://localhost:1337` in dev)
- `VITE_BACKEND_API_URL` — the Express backend's URL (`http://localhost:4000` in dev)

## A note on scope

This implements FR10–FR25 and the NFRs that are testable at this scale (validation, rate limiting, RBAC, auth token handling, etc.), plus the full CMS-side content modeling for FR1–FR9. Remaining work is deployment itself (Vercel + Railway) and finalizing which credentials (MongoDB/Cloudinary/SMTP accounts) are used for the production environment.