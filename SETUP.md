# Yango Deli — Promo Simulator: Setup Guide

## Prerequisites

- Docker + Docker Compose
- Node.js 20+ (for local dev only)
- Python 3.12+ (for local dev only)
- A Microsoft Azure AD (Entra ID) tenant

---

## Step 1 — Azure AD App Registration (Required for SSO)

1. Go to [Azure Portal](https://portal.azure.com) → **Azure Active Directory** → **App registrations**
2. Click **New registration**:
   - Name: `Yango Deli Promo Simulator`
   - Supported account types: **Single tenant** (your organization only)
3. Under **Redirect URI**, select **Web** and add:
   - `http://localhost:3000/api/auth/callback/azure-ad` (dev)
   - `https://yourdomain.com/api/auth/callback/azure-ad` (prod)
4. Click **Register**
5. Copy these values from the **Overview** page:
   - **Application (client) ID** → `AZURE_AD_CLIENT_ID`
   - **Directory (tenant) ID** → `AZURE_AD_TENANT_ID`
6. Go to **Certificates & secrets** → **New client secret** → copy the **Value** → `AZURE_AD_CLIENT_SECRET`

---

## Step 2 — Environment Setup

```bash
cd supplier-promo-simulation
cp .env.example .env
```

Edit `.env` and fill in all values:

```env
POSTGRES_PASSWORD=strong_password_here
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000
AZURE_AD_CLIENT_ID=<from step 1>
AZURE_AD_CLIENT_SECRET=<from step 1>
AZURE_AD_TENANT_ID=<from step 1>
PYTHON_INTERNAL_SECRET=$(openssl rand -hex 32)
ADMIN_EMAILS=your@email.com
```

> **ADMIN_EMAILS**: Your email address here will automatically get `admin` role on first login.

---

## Step 3 — Run with Docker Compose

```bash
docker compose up --build -d
```

Wait ~30 seconds for services to start, then run the database migration:

```bash
docker compose exec nextjs npx prisma migrate deploy
```

Open [http://localhost:3000](http://localhost:3000) and sign in with Microsoft.

---

## Local Development (without Docker)

### Frontend

```bash
cd frontend
npm install
cp ../.env.example .env.local  # then fill in values
npx prisma migrate dev
npm run dev
```

### Python API

```bash
cd python-api
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
PYTHON_INTERNAL_SECRET="" uvicorn app.main:app --reload --port 8000
```

---

## User Roles

| Role    | Dashboard | Simulation | Users |
|---------|-----------|------------|-------|
| admin   | ✓         | ✓          | ✓     |
| manager | ✓         | ✓          | ✗     |
| analyst | ✓         | ✓          | ✗     |
| viewer  | ✓         | ✗          | ✗     |

New users get `viewer` by default. Promote them in the **Users** page (admin only).

---

## Production Deployment

For production (e.g., AWS EC2 or DigitalOcean Droplet):

1. Update `NEXTAUTH_URL` in `.env` to your domain
2. Add your production redirect URI in Azure AD app registration
3. Add an nginx reverse proxy in front (optional but recommended):

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

4. `docker compose up --build -d && docker compose exec nextjs npx prisma migrate deploy`

---

## File Output

Each simulation produces:
- **XLSX download** — Sheet 1: Tier Comparison, Sheet 2: Brand Summary
- **Email .txt download** — Ready-to-send Hebrew email proposal

Simulation history is stored in the database and visible on the Dashboard.
