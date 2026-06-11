# Yango Deli Internal Platform

Yango Deli internal management platform — adaptive workspace, HR, and recruitment.

This monorepo contains the full internal tooling for Yango Deli employees:

- **Frontend** (Next.js 14 + TypeScript + Tailwind + shadcn/ui): The main adaptive "My Workspace" home screen + supporting pages (Simulation, Users, Settings, Admin).
- **Python API** services (for simulation engine and email generation).
- **Vercel / Railway** deployment targets.

## Core Philosophy
- Everything is a **widget** or **custom element**.
- Deep **Microsoft Entra ID (Azure AD)** integration via SSO — many services are **auto-integrated** with zero extra user login.
- Full **trilingual support** (Hebrew default, English, Russian) with complete RTL for Hebrew.
- Highly **extensible** via a central widget registry + documentation (easy to add new integrations, widgets, or plugins).
- Admin controls availability; users control their personal layout and preferences.

## Key Features

### Adaptive Home Screen ("My Workspace" at `/dashboard`)
- **React Grid Layout** (12-col responsive): Drag, resize, and rearrange widgets in Edit mode.
- **Per-widget resize rules**: Defined in the registry (`minW`, `minH`, `maxW`, `maxH`, `resizable`).
- **Prominent "+" button**: Create system widgets **or custom iframes** (any embeddable web content). Multiple custom embeds supported.
- **Auto-suggested shortcuts**: Role- and privilege-aware suggestions for internal tools + Microsoft 365 services (Teams, OneDrive, etc.).
- **Global Searchbar**: Toggle between "Internal" (CRM / announcements / directory) and "Google".
- **Ask AI Bar** (bottom fixed): Ask anything with a **Secure AI / External AI** switch. Providers and keys configured in Admin Settings (never exposed to browser).
- **Per-user Background**: Custom color, image URL, or CSS gradient (set in User Settings; applies live to your workspace).
- **Time-aware header**: Localized greeting ("Good morning" / Hebrew / Russian equivalents), date formatting per locale, role badge.
- **Edit mode**: Pencil icon toggles drag/resize/remove + Add panel. Auto-saves layout + visibility.

### Built-in Widgets (all fully translated + RTL aware)
- Outlook Mail (Graph, unread count, relative times, open in OWA).
- **Microsoft Planner** (replaced legacy To Do; tasks from plans, progress updates).
- Outlook Calendar (7-day timeline with localized day names).
- Announcements (pinned, role-targeted, posting modal for admins/managers).
- Shortcuts (color tiles, emoji picker, dnd-kit reorder, **auto-suggested** M365 + internal links).
- Quick Stats (role-aware metrics).
- Recent Activity (SimulationRun history).
- **OneDrive** (recent files — **auto-synced** via Entra, no extra auth).
- **Custom Iframe** (via the + button).

### Microsoft Auto-Integrations (via Entra SSO)
Because login uses Azure AD / Microsoft Entra, the same `accessToken` (with expanded Graph scopes) powers multiple services **automatically**:

- Mail (Outlook)
- Calendar
- Planner
- **OneDrive** (recent files widget + suggested shortcut)
- **Teams** (presence, joined teams, web links)
- **Directory / User Search** (powers internal search + potential org features)
- SharePoint / Sites (via scopes)

**How it works**:
- Scopes are requested at login (`auth.ts`).
- `src/lib/graph.ts` contains thin wrappers.
- On login or via "Sync Microsoft Services" in Settings, we populate `UserIntegration` records.
- Widgets that require Microsoft (`requiresIntegration: "microsoft"` in registry) only appear for connected users.
- No separate OAuth flows needed for Microsoft services.

Other platforms (Google, Slack, custom CRM) can be added later with explicit OAuth + stored in `UserIntegration`.

### User Settings (`/settings`)
- Language + Theme (light/dark/system).
- **Background** (color / image / gradient) — per-user, saved and applied immediately.
- AI mode preference (Secure vs External).
- Search preference (Internal vs Google).
- **Integrations panel**: Shows auto-connected Microsoft services + "Sync" button. Placeholders for future platforms.

### Admin Settings (`/admin` — admin role only)
- Toggle available widgets globally (or per-role in future) — new widgets from code appear automatically.
- Manage AI providers (add keys/endpoints, mark as "Secure").
- Integrations catalog overview.
- Backed by `SystemConfig` and `AiProviderConfig` models.

### Extensibility & Plugin Infrastructure
See `docs/ADDING_NEW_WIDGETS_AND_FEATURES.md` for the full guide.

Core pieces:
- `src/lib/widgets/registry.ts` — single source of truth for definitions, components, resize rules, categories, suggested shortcuts, and `requiresIntegration`.
- Widgets are simple React components wrapped in `DashboardWidget`.
- Custom elements (iframes) are first-class and stored with their config.
- Admin toggles via `SystemConfig`.
- i18n keys must exist in all three languages.
- Adding a new Microsoft integration usually means: one Graph helper + optional widget + registry entry + suggested shortcut.

### Internationalization & RTL
- `next-i18next` style resources in `public/locales/{he,en,ru}/`.
- Every user-facing string translated (no English fallbacks in Hebrew/Russian).
- `dir="rtl"` set on `<html>` for Hebrew (server + client sync).
- Tailwind `rtl:` variants + logical properties used throughout.
- Calendar day names, greetings, relative times, etc. fully localized.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind, shadcn/ui + Radix, react-grid-layout, @dnd-kit, i18next, SWR, sonner (toasts), lucide-react.
- **Auth**: NextAuth v4 + Azure AD (Entra ID) provider. JWT sessions with `accessToken` for Graph.
- **Data**: Prisma + Supabase (PostgreSQL). Models for users, layouts, widgets, shortcuts, announcements, integrations, AI configs, system flags.
- **Graph**: Direct Microsoft Graph calls using the Entra access token (thin wrapper in `graph.ts`).
- **Other**: Vercel hosting, optional Python simulation backend.

## Local Development

1. Clone and install:
   ```bash
   git clone https://github.com/yango-deli/yango-internal-platform.git
   cd yango-internal-platform/frontend
   npm install
   ```

2. Copy and fill `.env.local` (see `.env.example` at root):
   ```env
   NEXTAUTH_SECRET=...
   NEXTAUTH_URL=http://localhost:3000
   AZURE_AD_CLIENT_ID=...
   AZURE_AD_CLIENT_SECRET=...
   AZURE_AD_TENANT_ID=...
   DATABASE_URL=postgresql://...
   DIRECT_URL=postgresql://...
   ADMIN_EMAILS=you@company.com
   ```

3. Database:
   ```bash
   npx prisma generate
   npx prisma db push   # or migrate
   ```

4. Run:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 (login via Microsoft Entra).

   For the adaptive workspace: http://localhost:3000/dashboard (auth bypassed in dev for easy preview).

5. Admin features: Log in with an email listed in `ADMIN_EMAILS` (or manually set role=admin in DB).

## Environment Variables & Scopes
Key vars are in `.env.example`.

**Important Microsoft scopes** (requested at login for auto-integrations):
- Core: `User.Read`, `Mail.Read`, `Tasks.ReadWrite`, `Calendars.Read`
- Auto extras: `Files.Read.All` (OneDrive), `Sites.Read.All`, `Presence.Read`, `Team.ReadBasic.All`, `User.Read.All`, `Directory.Read.All`

Grant admin consent in the Entra app registration for broader directory/teams access.

## Deployment
- Frontend: Vercel (see `vercel.json`).
- Python services: Railway or Vercel serverless.
- Database: Supabase (pooled + direct URLs).

Set the same env vars in production. For production Entra, update redirect URIs.

## Security Notes
- Access tokens are short-lived and come from the identity provider at login (not long-term stored in our DB for Graph calls).
- AI provider keys live in `AiProviderConfig` (admin-only). The `/api/ai/ask` route proxies calls server-side.
- Never expose tokens or keys to the browser.
- Role-based access enforced in middleware + page layouts + widget registry.

## Adding New Features
1. Widgets / custom elements → follow `docs/ADDING_NEW_WIDGETS_AND_FEATURES.md`.
2. New Microsoft integration → add Graph helper in `graph.ts`, optional widget, registry entry, update scopes if needed, enhance the integrations sync.
3. New admin/user setting → extend `UserSettings` or add `SystemConfig` / `AiProviderConfig` entries + UI in the settings pages.
4. Always add translations in all three languages.
5. Test RTL (switch to Hebrew) and role-based visibility.

## Project Structure (relevant parts)
- `frontend/src/app/(app)/dashboard/` — main adaptive workspace.
- `frontend/src/lib/widgets/registry.ts` — the extensibility core.
- `frontend/src/lib/graph.ts` — all Microsoft Graph auto-integrations.
- `frontend/src/app/(app)/settings/page.tsx` + `admin/page.tsx`.
- `frontend/prisma/schema.prisma` — User, UserSettings, UserWidgetConfig, UserIntegration, AiProviderConfig, SystemConfig, etc.
- `docs/ADDING_NEW_WIDGETS_AND_FEATURES.md`.
- `frontend/public/locales/` — full trilingual strings.

## Original Base
This platform was bootstrapped from the `supplier-promo-simulator` codebase (simulation tool + Python backend). The adaptive internal workspace is the primary new surface.

## Contributing / Notes
- Prefer the widget registry pattern.
- Keep i18n complete.
- Microsoft auto-integrations are the preferred path for new M365 features.
- For questions about Entra app registration or scope consent, talk to platform team.

Built for Yango Deli employees. Feedback welcome!

---

*Last updated: 2026 (post initial adaptive workspace rollout with expanded auto Microsoft integrations and full documentation).*