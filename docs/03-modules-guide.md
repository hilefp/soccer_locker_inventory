# Modules Guide

## What Is a Module?

A module is a self-contained folder inside `src/modules/` that groups everything related to one business domain. Each module has the same predictable structure.

## Module Structure

```
src/modules/[module-name]/
├── pages/          # Routable page components
├── components/     # UI components specific to this module
├── hooks/          # React Query hooks for data fetching
├── services/       # API call functions
├── types/          # TypeScript interfaces and types
├── schemas/        # Zod validation schemas (optional)
└── routes.tsx      # Module route definitions
```

## Current Modules

| Module | Path | What it manages |
|--------|------|-----------------|
| `auth` | `/auth/*` | Login, forgot password, session |
| `dashboard` | `/dashboard/*` | Home page with quick access cards |
| `products` | `/products/*` | Products, categories, brands, attributes, variants |
| `inventory` | `/inventory/*` | Warehouses, stock levels, stock entries, movements |
| `orders` | `/orders/*` | Order list, detail, tracking (kanban), invoices, QR codes |
| `clubs` | `/clubs/*` | Club/team management, club-specific pricing |
| `reports` | `/reports/*` | Analytics dashboards and charts |
| `settings` | `/settings/*` | User management, roles |
| `shop` | `/shop/*` | Customer list and details |

## How to Create a New Module

### Step 1: Create the folder structure

```bash
mkdir -p src/modules/shipping/{pages,components,hooks,services,types}
```

### Step 2: Define your types

```typescript
// src/modules/shipping/types/shipment.ts
export interface Shipment {
  id: string;
  orderId: string;
  carrier: string;
  trackingNumber: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED';
  createdAt: string;
}

export interface CreateShipmentRequest {
  orderId: string;
  carrier: string;
}
```

### Step 3: Create the service

```typescript
// src/modules/shipping/services/shipment.service.ts
import apiClient from '@/shared/lib/api-client';
import type { Shipment, CreateShipmentRequest } from '../types/shipment';

const BASE = '/inventory/shipments';

export const shipmentService = {
  getAll: async (): Promise<Shipment[]> => {
    const { data } = await apiClient.get(BASE);
    return data;
  },

  getById: async (id: string): Promise<Shipment> => {
    const { data } = await apiClient.get(`${BASE}/${id}`);
    return data;
  },

  create: async (payload: CreateShipmentRequest): Promise<Shipment> => {
    const { data } = await apiClient.post(BASE, payload);
    return data;
  },
};
```

### Step 4: Create the hook

```typescript
// src/modules/shipping/hooks/use-shipments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shipmentService } from '../services/shipment.service';
import { toast } from 'sonner';

// Query key factory — keeps cache invalidation predictable
export const shipmentKeys = {
  all: ['shipments'] as const,
  list: () => [...shipmentKeys.all, 'list'] as const,
  detail: (id: string) => [...shipmentKeys.all, id] as const,
};

export function useShipments() {
  return useQuery({
    queryKey: shipmentKeys.list(),
    queryFn: () => shipmentService.getAll(),
  });
}

export function useShipment(id: string) {
  return useQuery({
    queryKey: shipmentKeys.detail(id),
    queryFn: () => shipmentService.getById(id),
    enabled: !!id,
  });
}

export function useCreateShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: shipmentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.all });
      toast.success('Shipment created');
    },
    onError: () => {
      toast.error('Failed to create shipment');
    },
  });
}
```

### Step 5: Create a page

```typescript
// src/modules/shipping/pages/shipment-list-page.tsx
import { useShipments } from '../hooks/use-shipments';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';

export default function ShipmentListPage() {
  useDocumentTitle('Shipments');
  const { data: shipments, isLoading } = useShipments();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Shipments</h1>
      {/* your table or list here */}
    </div>
  );
}
```

### Step 6: Define module routes

```typescript
// src/modules/shipping/routes.tsx
import { RouteObject } from 'react-router';
import ShipmentListPage from './pages/shipment-list-page';

export const shippingRoutes: RouteObject = {
  path: '',
  children: [
    { index: true, element: <ShipmentListPage /> },
    // add more routes here
  ],
};
```

### Step 7: Register in the modules provider

Open `src/routing/modules-provider.tsx` and add your module:

```typescript
import { shippingRoutes } from '@/modules/shipping/routes';
import { RenderRouteTree } from '@/shared/lib/router-helper';

// Inside the route tree, add:
<Route
  path="shipping/*"
  element={
    <ProtectedRoute>
      <DefaultLayout>
        <RenderRouteTree route={shippingRoutes} />
      </DefaultLayout>
    </ProtectedRoute>
  }
/>
```

### Step 8: Add to sidebar menu (optional)

Edit `src/config/app.config.tsx` to add your module to the sidebar navigation.

---

## Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Page files | `kebab-case-page.tsx` | `shipment-list-page.tsx` |
| Component files | `kebab-case.tsx` | `shipment-form-sheet.tsx` |
| Hook files | `use-kebab-case.ts` | `use-shipments.ts` |
| Service files | `kebab-case.service.ts` | `shipment.service.ts` |
| Type files | `kebab-case.type.ts` or `kebab-case.ts` | `shipment.ts` |
| Schema files | `kebab-case-schema.ts` | `shipment-schema.ts` |
| Route files | `routes.tsx` | `routes.tsx` |

## Legacy Pages

There are still pages in `src/pages/` that haven't been migrated to modules yet. When migrating:

1. Identify which module the page belongs to
2. Move the page file into `src/modules/[module]/pages/`
3. Add the route to the module's `routes.tsx`
4. Update `modules-provider.tsx` (add new route, remove old one)
5. Delete the old file from `src/pages/`
