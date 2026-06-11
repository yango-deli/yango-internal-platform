# Yango Deli — Internal Platform

An internal, SSO-protected platform for Yango Deli staff. It bundles two products
behind one Microsoft Outlook login:

1. **Promo Simulator** — upload supplier sellout Excel files, simulate promotion
   scenarios, and generate ready-to-send Hebrew email proposals.
2. **Recruitment CRM** — a Kanban-based applicant tracking system for couriers,
   pickers, support, and shift managers, with **automatic lead intake from the
   public recruitment website**.

The UI is trilingual (Hebrew / English / Russian, RTL-aware) and styled with the
Yango Deli design language.

---

## Tech Stack

| Layer        | Technology                                          |
|--------------|-----------------------------------------------------|
| Frontend     | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Auth         | Microsoft Azure AD SSO via NextAuth.js v4           |
| Database     | Supabase (PostgreSQL) via Prisma ORM                |
| Promo engine | Python FastAPI (serverless on Vercel)               |
| Hosting      | Vercel                                              |

---

## Modules

### Recruitment CRM (`/recruitment`)

- **Kanban board** with drag-and-drop across 10 pipeline stages (New → Hired,
  plus Rejected / Irrelevant / On Hold).
- **Candidate cards** with at-a-glance *stickers*: the **profession** they applied
  for, the lead **source**, worker type, city, and **when the lead arrived**.
- **Side panel** with full candidate detail, including a **Lead details** block
  (profession, vehicle, tax-authority registration, language, received date) for
  leads that came from the website.
- **Table view**, bulk actions, recruiter assignment, notes, activity log, and
  stage-change history.
- **Import** candidates from CSV / Excel with duplicate detection.
- **Statistics** dashboard (funnel, leads per source, conversion, recruiter
  performance).

### Website lead intake (the integration)

The public recruitment website
(`yango-deli/recruiters_website_for_couriers_pickers_cs_sm`) collects applicant
leads through its forms. Every submission is now forwarded to this CRM **in
parallel with the existing Telegram notification** — Telegram delivery is never
blocked by the CRM.

Flow:

```
Website form  ──►  website /api/submit-lead  ──┬──►  Telegram (unchanged)
                                               └──►  CRM POST /api/recruitment/webhook
                                                         │
                                                         ├─ creates / dedupes a Candidate
                                                         │   (mapped to a RecruitmentPosition by slug)
                                                         └─ records a WebsiteLead row (audit + status)
```

- **Endpoint:** `POST /api/recruitment/webhook` (public, exempt from NextAuth).
- **Auth:** `X-Webhook-Secret` header must equal `RECRUITMENT_WEBHOOK_SECRET`.
- **Payload:**
  ```json
  {
    "role": "couriers | pickers | support | manager",
    "firstName": "string",
    "lastName": "string",
    "phone": "string",
    "city": "string (optional)",
    "vehicle": "ebike | scooter | car (optional, couriers)",
    "taxRegistered": "yes | no (optional, couriers)",
    "locale": "he | en | ru (optional)"
  }
  ```
- **Result:** `{ imported, duplicates, errors, candidateIds }`.
- Positions are matched to website roles via `RecruitmentPosition.slug`
  (`couriers`, `pickers`, `support`, `manager`), seeded in `prisma/seed.mjs`.
- The `WebsiteLead.status` stays in sync with its linked `Candidate.stage` as
  recruiters move cards (both single and bulk stage changes).

### Promo Simulator (`/simulation`)

Unchanged. See [`WHAT_WAS_BUILT.md`](./WHAT_WAS_BUILT.md) for the full feature
breakdown and the Python engine description.

---

## Roles & Permissions

| Role    | Dashboard | Simulation | Recruitment | Users |
|---------|-----------|------------|-------------|-------|
| admin   | ✓         | ✓          | ✓           | ✓     |
| manager | ✓         | ✓          | ✓           | ✗     |
| analyst | ✓         | ✓          | ✓           | ✗     |
| viewer  | ✓         | ✗          | ✗           | ✗     |

New users default to `viewer`. Emails in `ADMIN_EMAILS` are auto-elevated to
`admin` on first login.

---

## Environment Variables

See [`.env.example`](./.env.example) for the full annotated list. Key recruitment
variable:

| Variable                      | Where    | Purpose                                                        |
|-------------------------------|----------|----------------------------------------------------------------|
| `RECRUITMENT_WEBHOOK_SECRET`  | CRM      | Shared secret for the public intake webhook. Must equal the website's `CRM_WEBHOOK_SECRET`. |

On the **website** side, set:

| Variable             | Purpose                                                     |
|----------------------|------------------------------------------------------------|
| `CRM_INTAKE_URL`     | Full URL of `…/api/recruitment/webhook` for this CRM.      |
| `CRM_WEBHOOK_SECRET` | Must match the CRM's `RECRUITMENT_WEBHOOK_SECRET`.         |

---

## Database (Supabase / Prisma)

Recruitment-related models in `frontend/prisma/schema.prisma`:

- **RecruitmentPosition** — open positions; `slug` maps website roles to CRM
  positions.
- **Candidate** — applicants in the pipeline (stage, source, worker type,
  vehicle, position, assignee, notes, activity, stage history).
- **WebsiteLead** — *new.* A dedicated audit table for every website submission:
  role, name, phone, city, vehicle, tax status, locale, `source`, `status`
  (mirrors the candidate stage), a link to the created `Candidate`, the raw JSON
  payload, and timestamps.

Apply schema changes locally:

```bash
cd frontend
npx prisma db push
npx prisma db seed   # seeds the 4 website-aligned positions + intake system user
```

---

## Local Development

```bash
cd frontend
npm install
cp ../.env.example .env.local   # then fill in values
npx prisma db push
npx prisma db seed
npm run dev                      # http://localhost:3000
```

Test the intake webhook without the website:

```bash
curl -X POST http://localhost:3000/api/recruitment/webhook \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: $RECRUITMENT_WEBHOOK_SECRET" \
  -d '{"role":"couriers","firstName":"Dan","lastName":"Rider","phone":"053-444-5566","city":"Tel Aviv","vehicle":"scooter","taxRegistered":"no","locale":"he"}'
```

A new card appears in the **New** column and a `WebsiteLead` row is recorded.

For SSO setup and the Promo Simulator stack, see [`SETUP.md`](./SETUP.md).

---

## Branding

Official Yango Deli logos extracted from the recruitment website live in
`frontend/public/brand/` (`logotype-white.svg`, `logotype-black.svg`,
`logo-yellow-button.png`) and power the sidebar, login, and favicon.

---

## Repository Layout

```
yango-internal-platform/
├── frontend/                       # Next.js app
│   ├── src/app/api/recruitment/
│   │   ├── webhook/route.ts        # public website lead intake
│   │   └── candidates/…            # CRM candidate APIs (with status sync)
│   ├── src/lib/recruitment/
│   │   └── website-intake.ts       # role mapping, intake user, status sync
│   ├── src/components/recruitment/ # Kanban, cards, side panel
│   ├── public/brand/               # official logos
│   └── prisma/schema.prisma        # includes the WebsiteLead model
├── python-vercel/                  # Promo Simulator FastAPI (serverless)
├── .env.example
├── SETUP.md
└── WHAT_WAS_BUILT.md
```
