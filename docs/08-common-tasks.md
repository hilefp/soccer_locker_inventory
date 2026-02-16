# Common Tasks

Quick reference for the things you'll do most often.

## Add a New Page to an Existing Module

1. Create the page component in `src/modules/[module]/pages/`
2. Add the route to the module's `routes.tsx`
3. That's it — the module is already registered in `modules-provider.tsx`

```typescript
// src/modules/products/routes.tsx
export const productsRoutes: RouteObject = {
  path: '',
  children: [
    // existing routes...
    { path: 'my-new-page', element: <MyNewPage /> },
  ],
};
```

## Add a New API Endpoint

1. Add the TypeScript types in `types/`
2. Add the service method in `services/`
3. Add the React Query hook in `hooks/`

## Add a New Form

1. Create a Zod schema in `schemas/` using the factory pattern
2. Create the form component using React Hook Form + shadcn/ui Form components
3. Wire it to a mutation hook

See [05-ui-patterns.md](./05-ui-patterns.md) for the full form example.

## Add a Sidebar Menu Item

Edit `src/config/app.config.tsx` and add your item to the menu configuration array.

## Add a New shadcn/ui Component

```bash
npx shadcn@latest add [component-name]
```

This will add the component to `src/shared/components/ui/`.

## Debug API Issues

1. Check the browser Network tab for the request/response
2. Verify `VITE_API_BASE_URL` in `.env` points to a running backend
3. Check if the auth token is being sent (look for `Authorization` header)
4. If you get 401 errors, the token may be expired — try logging out and back in

## Understand a Module Quickly

Every module follows the same structure. To understand a module:

1. Start with `types/` — see the data shape
2. Read `services/` — see what API endpoints it calls
3. Read `hooks/` — see how data is fetched and cached
4. Read `pages/` — see how the UI is composed
5. Read `routes.tsx` — see the URL structure

## Shared Hooks Reference

| Hook | File | Purpose |
|------|------|---------|
| `useIsMobile()` | `shared/hooks/use-mobile.tsx` | Returns `true` below 1024px |
| `useDocumentTitle(title)` | `shared/hooks/use-document-title.ts` | Sets the browser tab title |
| `useViewport()` | `shared/hooks/use-viewport.ts` | Tracks viewport dimensions |
| `useFileUpload()` | `shared/hooks/use-file-upload.tsx` | File upload with progress |
| `useCopyToClipboard()` | `shared/hooks/use-copy-to-clipboard.ts` | Copy text to clipboard |
| `useScrollPosition()` | `shared/hooks/use-scroll-position.ts` | Track/restore scroll position |

## Shared Helpers Reference

File: `src/shared/lib/helpers.ts`

| Helper | Purpose |
|--------|---------|
| `cn()` | Merge Tailwind classes (from `utils.ts`) |
| `throttle(fn, ms)` | Throttle function calls |
| `debounce(fn, ms)` | Debounce function calls |
| `uid()` | Generate a unique ID |
| `getInitials(name)` | Get initials from a name ("John Doe" → "JD") |
| `toAbsoluteUrl(path)` | Convert relative path to absolute URL |
| `timeAgo(date)` | Format as "2 hours ago" |
| `formatDate(date)` | Format a date string |
| `formatDateTime(date)` | Format a date + time string |

## File Upload

Use the shared file upload service:

```typescript
import { fileUploadService } from '@/shared/services/file-upload.service';
import { useFileUpload } from '@/shared/hooks/use-file-upload';
```

## Quick Debugging Checklist

- **Blank page?** Check the browser console for errors. Common cause: missing import or route misconfiguration.
- **Data not loading?** Check Network tab. Is the API call being made? Is it returning data?
- **Stale data after mutation?** Make sure the mutation's `onSuccess` invalidates the correct query keys.
- **Auth redirect loop?** Check `_hasHydrated` and localStorage. Try clearing localStorage and logging in again.
- **Style not applying?** Make sure you're using `cn()` for conditional classes. Check for Tailwind class conflicts.
