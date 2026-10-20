# Zelqora — AI Technical Troubleshooting & Diagnostic Platform

Zelqora is an evidence-driven technical troubleshooting and diagnostic investigation web application. Rather than offering conversational chatbots or superficial search snippets, Zelqora guides engineers through structured, evidence-based investigations using adaptive questioning, safe diagnostic tests, ranked hypotheses, and verified official documentation.

---

## Key Features

1. **Adaptive Diagnostic Engine**
   - 10-step systematic troubleshooting protocol (Intake &rarr; Redaction &rarr; Initial Assessment &rarr; Clarifying Questions &rarr; Ranked Hypotheses &rarr; Safe Diagnostic Tests &rarr; User Evidence Ingestion &rarr; Updated Analysis &rarr; Step-by-Step Fix &rarr; Verification & Resolution).
   - Powered by official Google Gemini SDK (`@google/genai`) using `gemini-2.5-flash` or `gemini-2.0-flash` with structured schema validation.
   - Deterministic local diagnostic engine fallback for local development when `GEMINI_API_KEY` is not provided.

2. **Automated Secret Redaction**
   - Multi-pattern regex engine scrubs sensitive data before persistence and before AI reasoning:
     - AWS Access Key IDs (`AKIA...`)
     - GitHub Personal Access Tokens (`ghp_...`, `github_pat_...`)
     - HTTP Bearer Tokens
     - Private Keys (RSA, DSA, OpenSSH)
     - Database Connection URIs containing plaintext passwords
     - Common JSON/YAML secret, token, and password assignments.

3. **Official Documentation Grounding (RAG)**
   - Approved registry of official documentation domains:
     - Python 3 (`docs.python.org`)
     - Node.js (`nodejs.org/docs`)
     - React (`react.dev`)
     - TypeScript (`typescriptlang.org/docs`)
     - Docker (`docs.docker.com`)
     - PostgreSQL (`postgresql.org/docs`)
     - SQLite (`sqlite.org/docs.html`)
     - FastAPI (`fastapi.tiangolo.com`)
     - Git (`git-scm.com/docs`)
     - MDN Web Docs (`developer.mozilla.org`)
   - Strict domain whitelisting preventing SSRF, malicious redirects, or hallucinated URLs.

4. **Multi-Turn Investigation Persistence & History**
   - SQLite with Write-Ahead Logging (WAL mode), versioned migrations, and foreign keys.
   - Turn-by-turn history with rollback support (revert to previous turn if test output is misinterpreted).
   - Ownership controls (user session or guest session token).
   - Automatic migration of guest investigations upon account registration or sign-in.

5. **Human Editorial Review System**
   - Peer-review workflow for permanent troubleshooting guides (`draft` &rarr; `in_review` &rarr; `approved` &rarr; `published`).
   - **Strict Architectural Guardrail:** AI drafts can **never** be auto-published without manual verification of technical accuracy, tested reproduction, and official documentation links.

6. **Google AdSense & Search Policy Readiness**
   - Isolated, policy-compliant `<AdSlot />` component (strictly disabled by default via `ADS_ENABLED=false`).
   - Distinct "Advertisement" visual labeling; never positioned near command copy buttons or evidence submission forms.
   - Full suite of required institutional pages:
     - About Zelqora (`/about`)
     - Contact with honest operational details (`/contact`)
     - Privacy Policy with clear data-flow disclosures (`/privacy`)
     - Terms of Use with diagnostic disclaimers (`/terms`)
     - Diagnostic Methodology & Limitations (`/methodology`)
     - Editorial Review & Correction Standards (`/editorial-policy`)
     - AdSense Policy Readiness Checklist (`/adsense-readiness`) verifying all 12 criteria.
   - Dynamic `sitemap.xml` and `robots.txt` excluding private user diagnostics from public indexing.

---

## Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, React Router 7, Lucide React icons.
- **Backend:** Node.js 24, TypeScript, Express 5, `@google/genai` (official Google Gemini SDK), Zod, bcryptjs, jsonwebtoken, cookie-parser, helmet, express-rate-limit.
- **Database:** SQLite via `better-sqlite3` (WAL mode enabled), versioned migrations.
- **Testing:** Vitest, Supertest (31 unit & integration tests covering redaction, doc registry, editorial gatekeepers, multi-turn workflow, bcrypt auth, and Express endpoints).

---

## Quickstart (Local Development)

### 1. Prerequisites
- Node.js v20+ or v24+
- npm v10+

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```
*(On Windows PowerShell: `Copy-Item .env.example .env`)*

Configure your optional Google Gemini API key in `.env`:
```env
PORT=3001
NODE_ENV=development
APP_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:5173
DATABASE_PATH=./data/zelqora.db
JWT_SECRET=your_secure_random_64_character_key_here
GEMINI_API_KEY=your_actual_gemini_api_key_from_google_ai_studio
GEMINI_MODEL=gemini-2.5-flash
ADS_ENABLED=false
```
> **Note:** If `GEMINI_API_KEY` is not provided, Zelqora automatically operates using its built-in verified deterministic diagnostic engine so you can test all features offline.

### 4. Start Development Server
Run frontend (Vite) and backend (Express) concurrently:
```bash
npm run dev
```
- Frontend UI: `http://localhost:5173`
- Backend API: `http://localhost:3001/api/health`

### 5. Run Automated Tests
```bash
npm test
```
Runs the full suite of 31 Vitest unit & integration tests.

### 6. Build and Run Production
```bash
# Build frontend with Vite and compile server with TypeScript
npm run build

# Start the unified production server
npm start
```
The unified production server serves the compiled Single-Page Application (SPA) and all API routes directly on `http://localhost:3001`.

---

## API Endpoints Overview

| Method | Path | Description | Access |
|---|---|---|---|
| `GET` | `/api/health` | System health check (DB, Gemini, monetization) | Public |
| `GET` | `/sitemap.xml` | Dynamic SEO sitemap of published pages | Public |
| `GET` | `/robots.txt` | Crawler policy restricting private paths | Public |
| `GET` | `/api/guides` | Catalog of reviewed published guides | Public |
| `GET` | `/api/guides/:slug` | Full content of a published guide | Public |
| `GET` | `/api/documentation/sources` | Approved official documentation sources | Public |
| `GET` | `/api/documentation/search` | Search verified documentation topics | Public |
| `POST` | `/api/investigations` | Start new troubleshooting session (Turn 1) | User / Guest |
| `GET` | `/api/investigations/:id` | Get investigation and all turns | Owner only |
| `POST` | `/api/investigations/:id/turn` | Submit test output / evidence (Turn n+1) | Owner only |
| `POST` | `/api/investigations/:id/rollback` | Rollback timeline to a previous turn | Owner only |
| `PATCH` | `/api/investigations/:id/resolution` | Mark investigation resolved/abandoned | Owner only |
| `DELETE` | `/api/investigations/:id` | Delete investigation and history | Owner only |
| `POST` | `/api/auth/register` | Register new user with bcrypt hash | Public |
| `POST` | `/api/auth/login` | Authenticate and issue HttpOnly cookie | Public |
| `POST` | `/api/auth/logout` | Revoke session and clear cookie | Authenticated |
| `GET` | `/api/editorial/list` | View all guides across all statuses | Editors |
| `PATCH` | `/api/editorial/:id/status` | Advance guide status with review checklist | Editors |

---

## Deployment Guide

### Deploying on Render / Railway / Fly.io / VPS

1. **Environment Variables:** Set `NODE_ENV=production`, `PORT=3001`, `APP_URL=https://yourdomain.com`, `JWT_SECRET`, `GEMINI_API_KEY`, and `DATABASE_PATH=/data/zelqora.db` (on a persistent disk mount).
2. **Build Command:** `npm run build`
3. **Start Command:** `npm start`
4. **Persistent Storage:** Mount a persistent volume at `./data` so the SQLite database file persists across container deployments.
5. **Backups:** Schedule a simple daily backup of `./data/zelqora.db` using SQLite online backup API or `sqlite3 .backup`.

---

## AdSense Readiness & Search Quality Checklist

Zelqora includes an interactive policy readiness dashboard at `/adsense-readiness` auditing 12 criteria:
1. Valuable original content (not thin AI scraping).
2. Strict human review gatekeepers for public guides.
3. Accessible navigation & responsive design.
4. Transparent privacy policy covering data flow.
5. Institutional pages (About, Contact, Terms).
6. Distinguishable and isolated ad slots (disabled by default).
7. Prohibition of ads on private investigation screens.
8. Zero click-incentivization or deceptive layouts.
9. Dynamic sitemap & robots.txt.
10. Grounding in official documentation manuals only.
11. Clean Core Web Vitals performance.
12. Multi-pattern sensitive secret redaction.

---

## License

Copyright &copy; 2026 Zelqora Engineering. All rights reserved.
