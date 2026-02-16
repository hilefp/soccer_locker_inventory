# Data Layer

This doc covers how data flows from the backend API into your components.

## Overview

```
Component → Hook → React Query → Service → API Client → Backend
```

Each layer has one job:
- **Component**: renders UI, calls hooks
- **Hook**: wraps React Query, manages cache keys
- **Service**: maps API calls to typed functions
- **API Client**: Axios instance with auth headers and error handling

## API Client

File: `src/shared/lib/api-client.ts`

A pre-configured Axios instance that:

1. **Adds auth headers** — Every request automatically gets `Authorization: Bearer {token}` from the auth store.
2. **Handles 401 errors** — If the API returns 401, it clears the auth state and dispatches an `auth:unauthorized` event. The auth store listens for this event and logs the user out.

```typescript
import apiClient from '@/shared/lib/api-client';

// You rarely use this directly — services wrap it
const { data } = await apiClient.get('/inventory/products');
```

The base URL comes from `VITE_API_BASE_URL` in your `.env` file.

## React Query Configuration

File: `src/shared/lib/query-client.ts`

Default settings:

| Setting | Value | Meaning |
|---------|-------|---------|
| `staleTime` | 5 minutes | Data is considered fresh for 5 min (no refetch) |
| `gcTime` | 10 minutes | Unused cache is garbage collected after 10 min |
| `retry` | 1 | Failed queries retry once |
| `refetchOnWindowFocus` | false | Switching tabs doesn't trigger refetches |
| Mutation `retry` | 0 | Mutations never auto-retry |

## Services Pattern

Every module has a `services/` folder. Services are plain objects with async methods that call the API client.

```typescript
// src/modules/products/services/product.service.ts
const BASE = '/inventory/product';

export const productService = {
  getAll: async (params?: ProductFilters) => {
    const { data } = await apiClient.get(BASE, { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get(`${BASE}/${id}`);
    return data;
  },

  create: async (payload: CreateProductRequest) => {
    const { data } = await apiClient.post(BASE, payload);
    return data;
  },

  update: async (id: string, payload: UpdateProductRequest) => {
    const { data } = await apiClient.patch(`${BASE}/${id}`, payload);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await apiClient.delete(`${BASE}/${id}`);
    return data;
  },
};
```

**API endpoint convention**: All endpoints start with `/inventory/` followed by the resource name.

## React Query Hooks Pattern

Every module has a `hooks/` folder. Hooks wrap React Query and expose data to components.

### Query Key Factory

Each hook file starts with a key factory. This keeps cache keys consistent and makes invalidation easy.

```typescript
export const productKeys = {
  all: ['products'] as const,
  list: (filters?: ProductFilters) => [...productKeys.all, 'list', filters] as const,
  detail: (id: string) => [...productKeys.all, id] as const,
};
```

Why this matters:
- `queryClient.invalidateQueries({ queryKey: productKeys.all })` invalidates **everything** (lists + details)
- `queryClient.invalidateQueries({ queryKey: productKeys.list() })` invalidates only lists
- Keys with filters mean changing a filter triggers a new fetch automatically

### Query Hook (reading data)

```typescript
export function useProducts(params?: ProductFilters) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productService.getAll(params),
  });
}
```

In your component:

```typescript
const { data, isLoading, error } = useProducts({ category: 'shoes' });
```

### Mutation Hook (writing data)

```typescript
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) => productService.create(data),
    onSuccess: () => {
      // Invalidate the list so it refetches with the new item
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success('Product created');
    },
    onError: (error) => {
      toast.error('Failed to create product');
    },
  });
}
```

In your component:

```typescript
const createProduct = useCreateProduct();

const handleSubmit = (data: CreateProductRequest) => {
  createProduct.mutate(data);
};
```

## State Management (Zustand)

File: `src/shared/stores/auth-store.ts`

Only **auth state** uses Zustand. Everything else is server state managed by React Query.

```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;    // true once localStorage data is loaded

  login(credentials): Promise<void>;
  logout(): void;
  validateSession(): Promise<boolean>;
}
```

Key features:
- **Persisted to localStorage** — The auth state survives page refreshes
- **Hydration flag** — `_hasHydrated` prevents rendering protected content before the store loads from localStorage
- **Event-driven logout** — When the API client gets a 401, it fires `auth:unauthorized`, and the store auto-clears

Usage:

```typescript
import { useAuthStore } from '@/shared/stores/auth-store';

// In a component
const user = useAuthStore((state) => state.user);
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
```

## Notifications (Toast)

The app uses **Sonner** for toast notifications. You'll see this pattern across all mutation hooks:

```typescript
import { toast } from 'sonner';

toast.success('Product saved');
toast.error('Something went wrong');
toast.custom((t) => <CustomAlert id={t} />);
```
