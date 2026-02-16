# Getting Started

Welcome to **Soccer Locker Inventory** — a web app for managing inventory, orders, products, clubs, and customers for a soccer equipment business.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build tool | Vite 7 |
| Routing | React Router v7 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| State management | Zustand (auth) + React Query v5 (server state) |
| Forms | React Hook Form + Zod |
| HTTP client | Axios |
| Charts | Recharts + ApexCharts |
| PWA | vite-plugin-pwa + Workbox |

## Prerequisites

- Node.js (LTS recommended)
- npm
- A running backend API (default: `http://localhost:4000/api`)

## Setup

```bash
# 1. Clone the repo and install dependencies
npm install

# 2. Create your .env file (or use the existing one)
# Required variables:
#   VITE_API_BASE_URL=http://localhost:4000/api
#   VITE_APP_NAME="Soccer Locker Management"

# 3. Start the dev server
npm run dev
```

## Available Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Type-check with `tsc` then build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Environment Variables

All env variables must be prefixed with `VITE_` to be accessible in the browser.

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:4000/api` |
| `VITE_APP_NAME` | App name shown in titles | `Soccer Locker Management` |
| `VITE_APP_VERSION` | App version number | `1` |

Access them in code:

```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

## Path Aliases

Always use aliases instead of relative imports:

```typescript
// Good
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/modules/auth/hooks/use-auth';

// Bad
import { Button } from '../../../shared/components/ui/button';
```

| Alias | Maps to |
|-------|---------|
| `@/*` | `./src/*` |
| `@/modules/*` | `./src/modules/*` |
| `@/authModules/*` | `./src/modules/auth/*` |

## Next Steps

- [02-architecture.md](./02-architecture.md) — Understand the project structure
- [03-modules-guide.md](./03-modules-guide.md) — How modules work and how to create new ones
- [04-data-layer.md](./04-data-layer.md) — API client, React Query, and state management
- [05-ui-patterns.md](./05-ui-patterns.md) — Component library, forms, and layouts
- [06-auth-flow.md](./06-auth-flow.md) — Authentication and route protection
