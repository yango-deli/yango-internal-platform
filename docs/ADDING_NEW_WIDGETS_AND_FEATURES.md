# Adding New Widgets, Integrations & Features

This document explains the infrastructure for easily extending the adaptive workspace ("My Workspace").

## Core Philosophy
- Everything is a **Widget** or **Custom Element**.
- Widgets are declared in a central registry (`src/lib/widgets/registry.ts`).
- New things should be addable with minimal changes and no breakage to existing users.
- Admins control availability globally (or per-role) from Admin Settings.
- Users control their personal layout and which things appear via the + button and User Settings.

## Step-by-step: Add a New Built-in Widget

1. **Type**
   - (Optional) Add a stable key to `WidgetKey` in `src/types/dashboard.ts` if you want strong typing.
   - Or just use a string key — the registry is flexible.

2. **Component**
   - Create `src/components/dashboard/widgets/MyNewWidget.tsx`
   - Accept props: `{ editMode?, onRemove?, config?, onConfigChange? }`
   - Use `<DashboardWidget>` wrapper for consistent chrome (loading, error, remove button in edit mode).

3. **Registry**
   - Import your component in `src/lib/widgets/registry.ts`
   - Add it to `WIDGET_COMPONENTS` map.
   - Add a full `WidgetDefinition` entry:
     ```ts
     {
       key: "my_new_widget",
       titleKey: "widgets.my_new_widget.title",
       descriptionKey: "...",
       defaultSize: "medium",
       minW: 4, minH: 3,
       resizable: true,
       roles: ["admin", "manager", "analyst", "viewer"],
       category: "productivity" | "microsoft" | "core" | "custom",
       requiresIntegration?: "microsoft",   // auto-hides if not connected
     }
     ```

4. **Translations**
   - Add keys under `widgets.my_new_widget` in all three locale files (`he`, `en`, `ru`).

5. **Auto-shortcuts (if applicable)**
   - If this is a system page (e.g. new /crm page), add it to `getSystemShortcutSuggestions` in the registry.

6. **Admin Control**
   - The key will automatically appear in Admin → Manage Widgets.
   - Toggling updates `SystemConfig` "enabledWidgets".

7. **Resize Rules**
   - Use `minW / minH / maxW / maxH / resizable` in the definition. The grid respects them.

## Adding Iframe / Custom Embeds
- Use the prominent **+** button → "Iframe / Embed".
- This creates a `custom:iframe:timestamp` entry.
- Stored in `UserWidgetConfig` with `config: { kind: "iframe", url, title, height }`.
- The generic `IframeWidget` handles rendering and sandboxing.
- Fully resizable like any other element.

## Adding a New Integration
1. Add provider name to `UserIntegration` model if needed.
2. For Microsoft services: they are auto-available after Entra login (see `auth.ts` scopes + `graph.ts`).
3. For others (Google, Slack...): implement OAuth flow + store token in `UserIntegration`.
4. Expose connection status in `/settings` page.
5. In widget definitions, set `requiresIntegration: "google"` so the widget only shows for connected users (future enhancement in registry).

## Admin Settings Surface
- `/admin` (admin role only)
- Widgets toggle (global enabled list)
- AI Providers (add/edit keys + mark Secure vs External)
- Integrations catalog (future)

## User Settings Surface
- `/settings`
- Background (color / image url / gradient)
- AI mode preference (Secure vs External)
- Search preference (Internal CRM vs Google)
- Integrations status + "Sync Microsoft"

## AI Bar
- Fixed bottom bar on the dashboard.
- Toggle affects which `AiProviderConfig` (isSecure) the `/api/ai/ask` route should prefer.
- The backend route is intentionally a stub — replace the mock with real calls using the stored keys (never expose keys to browser).

## Search Bar
- Lives in Topbar.
- Internal mode: hook into your CRM / announcements / user search (easy extension point).
- Google mode: direct external search (opens new tab).

## Auto Shortcuts
- `getSystemShortcutSuggestions(role)` in the registry returns role-appropriate internal links.
- ShortcutsWidget can call this to offer "Suggested for you" buttons.

## Plugin / Future Extensibility Ideas
- Dynamic component loading (next/dynamic + plugin bundle).
- Feature flags stored in `SystemConfig`.
- Per-widget required scopes (enforced at add time).
- Versioned widget config schemas.

This structure keeps the UI composable and the addition of new Microsoft integrations, internal tools, or even third-party embeds very low-friction.
