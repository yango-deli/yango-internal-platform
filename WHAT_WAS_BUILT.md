# Yango Deli Supplier Promo Simulator — What Was Built

## Live URLs

| Service | URL |
|---|---|
| **Web App** | https://supplier-promo-simulation.vercel.app |
| **Python API** | https://yango-promo-python-api.vercel.app |

---

## What It Does

A full-stack internal platform that lets Yango Deli staff upload supplier sellout Excel files, simulate promotion scenarios, and generate ready-to-send Hebrew email proposals — all secured behind Microsoft Outlook SSO.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| Backend API | Python FastAPI (serverless on Vercel) |
| Database | Supabase (PostgreSQL) |
| Auth | Microsoft Azure AD SSO via NextAuth.js v4 |
| Hosting | Vercel (two separate projects) |

---

## Pages & Features

### 🔐 Login (`/login`)
- Microsoft Outlook Business SSO — employees sign in with their company account, no passwords
- Blocked to non-company accounts
- Branded Yango Deli login card

### 📊 Dashboard (`/dashboard`)
- Landing page after login
- Shows the logged-in user's name, role, and a quick summary

### 🧪 Simulation (`/simulation`)
- **Multi-file upload** — drag & drop one or more `.xlsx` sellout files at once
- **Per-file configuration** — each file has its own collapsible card with:
  - Supplier name
  - Contact name
  - Column mapping (date, order ID, basket value, units, GMV, brand) — accepts column letters (A, B…) or exact header names
- **Global settings** panel (shared across all files):
  - Basket value tiers (NIS) — toggle buttons (20, 25, 30, 35, 40, 50 ₪)
  - Unit quantity tiers — toggle buttons (1–5 units)
  - Uplift scenarios — toggle buttons (10%–75%)
  - Delivery cost per order (NIS)
  - Fixed operational cost (NIS)
  - Lookback window (days)
- All fields are optional — only a file is required to run
- **Parallel execution** — all simulations run simultaneously
- **Tabbed results** — one tab per file, with live status indicators (spinner / green / red)
- Results include:
  - Tier results table (forecasted redemptions, delivery budget, activity cost per scenario)
  - Brand summary table
  - Hebrew email preview (ready to copy/send to supplier)
  - Download output `.xlsx`

### 👥 Users (`/users`) — Admin only
- Table of all users who have signed in
- Change any user's role: `admin`, `manager`, `analyst`, `viewer`
- Activate / deactivate accounts
- Delete users

---

## Role Permissions

| Role | Run simulations | Manage users |
|---|---|---|
| **admin** | ✅ | ✅ |
| **manager** | ✅ | ❌ |
| **analyst** | ✅ | ❌ |
| **viewer** | ❌ | ❌ |

- New users default to `viewer` on first login
- Admin emails defined in `ADMIN_EMAILS` env var are auto-elevated to `admin` on first sign-in

---

## How the Simulation Works (Python Engine)

1. Reads the uploaded `.xlsx` using pandas
2. Filters rows to the last N days (lookback window)
3. For each **basket value tier**: counts unique orders where basket value ≥ threshold
4. For each **unit quantity tier**: groups by order ID, sums units, counts orders ≥ threshold
5. For each tier × uplift rate combination: forecasts redemptions and computes activity cost
6. Generates a Hebrew email proposal addressed to the supplier contact
7. Returns results as JSON + a base64-encoded output `.xlsx`

---

## Project Structure

```
supplier-promo-simulation/
├── frontend/                  # Next.js app (deployed to Vercel)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/login/          # Login page
│   │   │   ├── (app)/dashboard/       # Dashboard
│   │   │   ├── (app)/simulation/      # Simulation page
│   │   │   ├── (app)/users/           # User management (admin)
│   │   │   └── api/
│   │   │       ├── auth/[...nextauth]/ # Azure AD SSO
│   │   │       ├── simulate/           # Proxy to Python API
│   │   │       └── users/             # User management API
│   │   ├── components/
│   │   │   ├── simulation/            # Upload, config form, results, email preview
│   │   │   ├── users/                 # Users table
│   │   │   └── layout/                # Sidebar, topbar
│   │   └── lib/
│   │       ├── auth.ts                # NextAuth + Azure AD config
│   │       └── prisma.ts              # Database client
│   └── prisma/schema.prisma           # DB schema (User, Account, SimulationRun)
│
├── python-vercel/             # FastAPI app (deployed to Vercel as separate project)
│   ├── api/simulate.py        # Serverless entry point
│   └── services/
│       ├── simulation_engine.py  # Core pandas processing
│       └── email_generator.py    # Hebrew email generation
│
├── python-api/                # Original local FastAPI app (for Docker/local dev)
├── docker-compose.yml         # Local development stack
├── .env.example               # All required environment variables documented
└── SETUP.md                   # Setup guide including Azure AD registration steps
```

---

## Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | Frontend (Vercel) | Supabase pooled connection |
| `DIRECT_URL` | Frontend (Vercel) | Supabase direct connection |
| `NEXTAUTH_SECRET` | Frontend (Vercel) | JWT signing secret |
| `NEXTAUTH_URL` | Frontend (Vercel) | App's public URL |
| `AZURE_AD_CLIENT_ID` | Frontend (Vercel) | Azure app registration ID |
| `AZURE_AD_CLIENT_SECRET` | Frontend (Vercel) | Azure client secret |
| `AZURE_AD_TENANT_ID` | Frontend (Vercel) | Azure directory (tenant) ID |
| `ADMIN_EMAILS` | Frontend (Vercel) | Comma-separated emails auto-elevated to admin |
| `PYTHON_API_URL` | Frontend (Vercel) | URL of the Python API |
| `PYTHON_INTERNAL_SECRET` | Both Vercel projects | HMAC secret for inter-service auth |

---

## Database Schema (Supabase)

- **User** — id, email, name, role (admin/manager/analyst/viewer), isActive, createdAt
- **Account** — OAuth account links (Azure AD provider records)
- **Session** — NextAuth session records
- **VerificationToken** — NextAuth tokens
- **SimulationRun** — id, userId, fileName, config (JSON), summary (JSON), createdAt
