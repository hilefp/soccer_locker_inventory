# Authentication Flow

## How Auth Works

The app uses **JWT token-based authentication**. The token is stored in localStorage and sent with every API request.

## Login Flow

```
1. User submits email + password on /auth/login
2. authService.login() → POST /inventory/auth/login
3. API returns { accessToken, user }
4. Auth store saves token + user to Zustand (persisted in localStorage)
5. User is redirected to /dashboard
```

## Session Persistence (Page Refresh)

```
1. App loads → Zustand hydrates from localStorage
2. _hasHydrated flag flips to true
3. ProtectedRoute checks:
   - Is store hydrated? (wait if not)
   - Is there an accessToken?
   - Validates session by calling GET /profile
4. If valid → render the page
5. If 401 → clear auth state → redirect to /auth/login
```

## Route Protection

### ProtectedRoute

Wraps all authenticated routes. If you're not logged in, you can't access them.

```
/dashboard/*    → ProtectedRoute → DefaultLayout → Page
/products/*     → ProtectedRoute → DefaultLayout → Page
/orders/*       → ProtectedRoute → DefaultLayout → Page
...
```

What it does:
1. Waits for store hydration (`_hasHydrated`)
2. Checks `isAuthenticated` from the auth store
3. If not authenticated → redirect to `/auth/login`
4. If authenticated → render children

### GuestRoute

Wraps auth pages (login, forgot password). If you're already logged in, it redirects you away.

```
/auth/login           → GuestRoute → BrandedLayout → LoginPage
/auth/forgot-password → GuestRoute → BrandedLayout → ForgotPasswordPage
```

### AuthRedirect

Handles the root path (`/`):
- Authenticated → redirect to `/dashboard`
- Not authenticated → redirect to `/auth/login`

## Token Management

The API client (`src/shared/lib/api-client.ts`) handles tokens automatically:

**Request interceptor** — Adds the token to every request:
```
Authorization: Bearer {accessToken}
```

**Response interceptor** — On 401 errors:
1. Dispatches a custom `auth:unauthorized` DOM event
2. The auth store listens for this event
3. Clears user state and token
4. User is implicitly redirected by ProtectedRoute

## Logout

```typescript
const { logout } = useAuth();

// What logout() does:
// 1. Clears Zustand state (user, token, isAuthenticated)
// 2. Clears localStorage
// 3. ProtectedRoute detects the change → redirects to /auth/login
```

## Auth Store

File: `src/shared/stores/auth-store.ts`

```typescript
// Key state
user: User | null
accessToken: string | null
isAuthenticated: boolean
_hasHydrated: boolean

// Key methods
login(credentials)     // POST to API, save response
logout()               // Clear everything
validateSession()      // GET /profile to check if token is still valid
```

## Using Auth in Components

```typescript
import { useAuthStore } from '@/shared/stores/auth-store';

function MyComponent() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return <span>Hello, {user?.name}</span>;
}
```

Or using the auth hook:

```typescript
import { useAuth } from '@/modules/auth/hooks/use-auth';

function MyComponent() {
  const { user, login, logout } = useAuth();
}
```

## Important: Hydration Race Condition

When the page refreshes, Zustand loads data from localStorage asynchronously. The `_hasHydrated` flag prevents rendering protected content before the store is ready.

**Never check `isAuthenticated` without first checking `_hasHydrated`.**

The `ProtectedRoute` component handles this for you — just make sure all authenticated pages are wrapped by it.
