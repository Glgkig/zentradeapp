# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on port 8080
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # ESLint
npm run test         # Run tests once (Vitest)
npm run test:watch   # Run tests in watch mode
npm run preview      # Preview production build
```

Run a single test file:
```bash
npx vitest run src/test/SomeFile.test.tsx
```

## Architecture

**ZenTrade** is a React 18 + TypeScript SPA for trading journal and analysis. Backend is Supabase (PostgreSQL + Auth + Edge Functions). UI is RTL (Hebrew).

### Stack
- **Build**: Vite 5 + SWC, path alias `@` → `src/`
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI primitives)
- **Routing**: React Router v6
- **Data fetching**: TanStack React Query 5
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts (stats/analytics) + Lightweight Charts (financial candlestick)
- **Auth/DB**: Supabase (`src/integrations/supabase/`)
- **Payments**: Polar.sh (subscription management via Supabase Edge Function)
- **Testing**: Vitest + Testing Library + Playwright (E2E)

### App Structure

```
src/
├── App.tsx                    # Root: providers + React Router routes
├── pages/                     # Route-level components (Index, Dashboard, auth pages, Pricing, etc.)
├── components/
│   ├── dashboard/             # Main app shell: DashboardLayout, sidebar navigation, page routing
│   ├── ui/                    # shadcn/ui components (generated — don't edit manually)
│   └── [feature]/             # Feature components (journal, setups, stats, mentor, etc.)
├── contexts/                  # AuthContext, UserProfileContext, SubscriptionContext
├── hooks/                     # Custom hooks (data fetching, UI state)
├── integrations/supabase/     # Supabase client, generated DB types
├── lib/                       # Shared utilities (cn helper, etc.)
└── utils/                     # Feature utilities (calculations, formatters)
```

### Routing & Navigation
- `/` redirects authenticated users to `/dashboard`
- `/dashboard` is wrapped in `ProtectedRoute` (redirects unauthenticated to `/login`)
- All app pages render inside `DashboardLayout`, which owns the sidebar and page-switch logic
- Dashboard sub-pages (journal, setups, stats, mentor, etc.) are rendered by `DashboardLayout` based on a `currentPage` state — they are **not** separate URL routes

### State & Data Flow
- **Auth state**: `AuthContext` — session, user, profile; use `useAuth()` hook
- **Subscription/Pro gating**: `SubscriptionContext` — `useSubscription()` returns `isPro`; paywall shown via `SubscriptionPaywall` component
- **Server state**: React Query for async data; Supabase client used directly inside hooks
- **Supabase types**: Auto-generated in `src/integrations/supabase/types.ts` — regenerate with `npx supabase gen types typescript`

### Key Conventions
- UI is RTL (`dir="rtl"` on `<html>`) and Hebrew-language; all user-facing text is in Hebrew
- Dark mode via `next-themes`; custom Tailwind tokens: `profit`, `loss`, `gold`, `sidebar-*`
- shadcn/ui components live in `src/components/ui/` — add new ones via `npx shadcn-ui@latest add <component>`
- Supabase Edge Functions live in `supabase/functions/`; deploy with `supabase functions deploy`
- TypeScript is configured leniently (no strict null checks, allows implicit any)
