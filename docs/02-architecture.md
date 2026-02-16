# Architecture

## Screaming Architecture

This project uses **Screaming Architecture** — the folder structure tells you what the app *does*, not what framework it uses. When you open `src/modules/`, you immediately see: `auth`, `products`, `inventory`, `orders`, `clubs`, etc.

Each business domain is a self-contained module with its own pages, components, hooks, services, types, and routes.

## Folder Structure

```
src/
├── modules/           # Where business logic lives (one folder per domain)
│   ├── auth/
│   ├── products/
│   ├── inventory/
│   ├── orders/
│   ├── clubs/
│   ├── reports/
│   ├── settings/
│   ├── shop/
│   └── dashboard/
│
├── routing/           # Global routing configuration
│   ├── modules-provider.tsx   # Assembles all module routes
│   └── AuthRedirect.tsx       # Redirects based on auth state
│
├── layout/            # App shell (sidebar, header, footer)
│   ├── DefaultLayout.tsx      # Authenticated pages layout
│   ├── branded.tsx            # Auth pages layout (login, etc.)
│   └── components/            # Header, sidebar, breadcrumb, etc.
│
├── shared/            # Code used across multiple modules
│   ├── components/ui/         # shadcn/ui component library (120+ components)
│   ├── hooks/                 # Reusable hooks (use-mobile, use-document-title, etc.)
│   ├── lib/                   # Utilities (api-client, query-client, helpers)
│   ├── stores/                # Zustand stores (auth-store)
│   └── services/              # Shared services (file-upload, pwa)
│
├── config/            # App-wide configuration
│   └── app.config.tsx         # Sidebar menu structure
│
├── pages/             # LEGACY — old pages not yet migrated to modules
│
├── App.tsx            # Root component, wraps everything with providers
└── main.tsx           # Entry point, renders App into the DOM
```

## How the App Boots

```
main.tsx
  └── App.tsx
        ├── QueryClientProvider    (React Query)
        └── BrowserRouter
              └── ModulesProvider   (all routes assembled here)
                    ├── /auth/*         → BrandedLayout → Login, ForgotPassword
                    ├── /dashboard/*    → DefaultLayout → Dashboard
                    ├── /products/*     → DefaultLayout → Product pages
                    ├── /inventory/*    → DefaultLayout → Inventory pages
                    ├── /orders/*       → DefaultLayout → Order pages
                    ├── /clubs/*        → DefaultLayout → Club pages
                    ├── /reports/*      → DefaultLayout → Report pages
                    ├── /settings/*     → DefaultLayout → Settings pages
                    └── /shop/*         → DefaultLayout → Shop pages
```

## Two Layouts

| Layout | Used for | What it shows |
|--------|----------|---------------|
| `DefaultLayout` | All authenticated pages | Sidebar + Header + Content + Footer |
| `BrandedLayout` | Login, forgot password | Clean two-column layout with branding |

## Key Architectural Decisions

1. **Modules own their routes** — Each module has a `routes.tsx` that defines its own route tree. The central `modules-provider.tsx` just imports and mounts them.

2. **React Query for server state, Zustand for client state** — API data is managed by React Query (caching, invalidation, refetching). Only truly client-side state (like auth tokens) lives in Zustand.

3. **Services abstract API calls** — Components never call Axios directly. They use hooks, which call services, which call the API client.

4. **shadcn/ui for components** — All UI primitives come from shadcn/ui (built on Radix). They live in `src/shared/components/ui/` and are customized with Tailwind.

## Data Flow

```
Page Component
  └── uses a hook (e.g., useProducts)
        └── calls React Query (useQuery / useMutation)
              └── calls a service (e.g., productService.getAll)
                    └── calls apiClient (Axios)
                          └── hits the backend API
```

This separation keeps each layer focused:
- **Pages** handle layout and user interaction
- **Hooks** handle data fetching logic and cache management
- **Services** handle HTTP request/response mapping
- **API Client** handles auth headers and error interception
