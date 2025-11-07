# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Commands

### Development
```bash
npm run dev        # Start Vite dev server
npm run build      # Type check with tsc and build for production
npm run preview    # Preview production build locally
npm run lint       # Run ESLint on the codebase
```

## Architecture Overview

This project is transitioning to a **Screaming Architecture** pattern with a modular structure. The architecture is being implemented step-by-step to organize the codebase by business capabilities (modules) rather than technical layers.

**Technology Stack**: React 19 + TypeScript + Vite + React Router v7 + Tailwind CSS 4 + shadcn/ui

## Current Module Structure

```
src/
├── modules/              # Business domain modules (screaming architecture)
│   └── auth/            # Authentication module
│       ├── pages/       # UI pages for authentication
│       ├── schemas/     # Validation schemas
│       └── routes.tsx   # Module-specific routing
├── routing/             # Global routing configuration
│   └── modules-provider.tsx  # Main routing provider
├── shared/              # Shared utilities and helpers
│   ├── hooks/          # Shared React hooks
│   └── lib/            # Shared libraries (router-helper, utils)
├── layout/             # Layout components
├── components/         # Shared UI components
└── pages/              # Legacy pages (to be migrated to modules)
```

## Modules Pattern

### Auth Module (`src/modules/auth/`)

The auth module follows this structure:

- **pages/**: Contains page components (LoginPage, ForgotPasswordPage)
- **schemas/**: Contains validation schemas using Zod
  - `signin-schema.ts`
  - `reset-password-schema.ts`
- **routes.tsx**: Defines module routes using React Router's RouteObject

Example route structure:
```typescript
export const authRoutes: RouteObject = {
  path: "",
  element: <BrandedLayout />,
  children: [
    { path: "login", element: <LoginPage /> },
    { path: "forgot-password", element: <ResetPasswordPage /> },
  ],
};
```

## Path Aliases

Configured in both `tsconfig.json` and `vite.config.ts`:
- `@/*` → `./src/*`
- `@/modules/*` → `./src/modules/*`
- `@/authModules/*` → `./src/modules/auth/*`

Always use path aliases instead of relative imports (e.g., `@/components/ui/button` not `../../components/ui/button`).

## Routing Strategy

The routing system uses a **hybrid approach** during migration:

1. **Module-based routes**: Each module exports its own `routes.tsx` using React Router's `RouteObject` type
2. **RenderRouteTree helper**: `src/shared/lib/router-helper.tsx` recursively renders route trees from module definitions, supporting nested routes, index routes, and layouts
3. **ModulesProvider**: `src/routing/modules-provider.tsx` is the central routing provider that:
   - Imports module routes (e.g., `authRoutes`)
   - Uses `<RenderRouteTree route={authRoutes} />` to render module routes
   - Currently contains legacy routes that need to be migrated to modules

**Key insight**: The app is in active migration. New routes should be added to module `routes.tsx` files, not directly to `modules-provider.tsx`.

## Migration Progress

### Completed
- Auth module structure created
- Route helper utility implemented
- Module provider configured

### In Progress
- Moving legacy pages from `src/pages/` to appropriate modules

### Planned Modules
Based on existing pages, potential future modules include:
- **inventory/** - Stock management (all-stock, current-stock, inbound-stock, outbound-stock)
- **products/** - Product management (product-list, product-details, create-product)
- **orders/** - Order management (order-list, order-details, order-tracking)
- **customers/** - Customer management (customer-list, customer-list-details)
- **categories/** - Category management (category-list, create-category)
- **shipping/** - Shipping operations (create-shipping-label, track-shipping)

## Development Guidelines

### Creating a New Module

1. Create module directory: `src/modules/[module-name]/`
2. Add subdirectories as needed:
   - `pages/` - Page components
   - `schemas/` - Zod validation schemas (use factory functions like `getSigninSchema()`)
   - `components/` - Module-specific components
   - `hooks/` - Module-specific hooks
   - `services/` - API/business logic
   - `types/` - TypeScript types
3. Create `routes.tsx` with RouteObject definition
4. Import and register in `src/routing/modules-provider.tsx`:

```typescript
import { authRoutes } from '@/modules/auth/routes';
import { RenderRouteTree } from '@/shared/lib/router-helper';

// Inside the Routes component:
<Route path="auth/*" element={<RenderRouteTree route={authRoutes} />} />
```

### Schema Pattern

Schemas use factory functions to enable future runtime configuration:

```typescript
export const getSigninSchema = () => {
  return z.object({
    email: z.string().email().min(1),
    password: z.string().min(1),
    rememberMe: z.boolean().optional(),
  });
};

export type SigninSchemaType = z.infer<ReturnType<typeof getSigninSchema>>;
```

## Key Architectural Patterns

### RenderRouteTree Pattern
`src/shared/lib/router-helper.tsx` contains a utility that recursively renders route trees from `RouteObject` definitions. This enables:
- Nested routes with children
- Index routes
- Layouts wrapping multiple routes

### Form Validation Pattern
- Forms use React Hook Form with Zod resolvers via `@hookform/resolvers/zod`
- Schemas are created with factory functions (not direct exports) to allow runtime configuration
- Type inference: `type SchemaType = z.infer<ReturnType<typeof getSchema>>`

### Shared Resources Organization
- **Hooks**: `src/shared/hooks/` - Reusable React hooks (e.g., `use-mobile.tsx`, `use-viewport.ts`)
- **Utils**: `src/shared/lib/` - Helper functions and utilities
- **Components**: `src/components/` - Global UI components (shadcn/ui based)
- **Layouts**: `src/layout/` - Shared layouts (`DefaultLayout`, `BrandedLayout`)

## Migration State

**Current**: Auth module is the reference implementation. Legacy pages in `src/pages/` need migration.

**When migrating a page**:
1. Identify the appropriate module (or create new one)
2. Move page to `src/modules/[module]/pages/`
3. Add route to module's `routes.tsx`
4. Update imports in `modules-provider.tsx`
5. Remove legacy route from `modules-provider.tsx`
6. Delete old page file
