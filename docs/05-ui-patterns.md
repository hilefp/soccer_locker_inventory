# UI Patterns

## Component Library: shadcn/ui

All UI primitives live in `src/shared/components/ui/`. They are **shadcn/ui** components — built on Radix UI and styled with Tailwind CSS.

These are not a dependency you install. They are actual source files in your project that you can read and modify.

### Most Used Components

| Component | Import | Use for |
|-----------|--------|---------|
| `Button` | `@/shared/components/ui/button` | Actions and CTAs |
| `Input` | `@/shared/components/ui/input` | Text inputs |
| `Card` | `@/shared/components/ui/card` | Content containers |
| `Table` | `@/shared/components/ui/table` | Simple tables |
| `DataGrid` | `@/shared/components/ui/data-grid` | Complex tables with sorting/filtering |
| `Sheet` | `@/shared/components/ui/sheet` | Side panels (forms, details) |
| `Dialog` | `@/shared/components/ui/dialog` | Modal dialogs |
| `Select` | `@/shared/components/ui/select` | Dropdowns |
| `Tabs` | `@/shared/components/ui/tabs` | Tabbed content |
| `Badge` | `@/shared/components/ui/badge` | Status labels |
| `Tooltip` | `@/shared/components/ui/tooltip` | Hover hints |
| `ScrollArea` | `@/shared/components/ui/scroll-area` | Custom scrollbars |

### Usage Example

```tsx
import { Button } from '@/shared/components/ui/button';
import { Card, CardHeader, CardContent } from '@/shared/components/ui/card';

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <h2>Title</h2>
      </CardHeader>
      <CardContent>
        <Button variant="primary">Save</Button>
        <Button variant="outline">Cancel</Button>
      </CardContent>
    </Card>
  );
}
```

### Button Variants

```tsx
<Button variant="primary">Primary action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outlined</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="mono">Monochrome</Button>
<Button mode="icon"><IconComponent /></Button>
<Button shape="circle">O</Button>
```

## Tailwind CSS Utility

File: `src/shared/lib/utils.ts`

The `cn()` function merges Tailwind classes and resolves conflicts:

```typescript
import { cn } from '@/shared/lib/utils';

<div className={cn('p-4 bg-white', isActive && 'bg-blue-500')} />
```

## Forms

Forms use **React Hook Form** + **Zod** for validation.

### Schema Pattern

Schemas use factory functions. This allows adding runtime configuration later (like i18n error messages).

```typescript
// src/modules/[module]/schemas/my-schema.ts
import { z } from 'zod';

export const getMyFormSchema = () => {
  return z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    quantity: z.number().min(0),
  });
};

// Infer the TypeScript type from the schema
export type MyFormSchemaType = z.infer<ReturnType<typeof getMyFormSchema>>;
```

### Form Component Pattern

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getMyFormSchema, type MyFormSchemaType } from '../schemas/my-schema';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';

export function MyForm() {
  const form = useForm<MyFormSchemaType>({
    resolver: zodResolver(getMyFormSchema()),
    defaultValues: {
      name: '',
      email: '',
      quantity: 0,
    },
  });

  const onSubmit = (data: MyFormSchemaType) => {
    // call your mutation hook here
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage /> {/* Shows Zod validation errors */}
            </FormItem>
          )}
        />

        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
}
```

## Layouts

### DefaultLayout

Used for all authenticated pages. Provides:
- Sidebar navigation (collapsible on mobile)
- Top header with breadcrumbs, search, notifications, user menu
- Main content area via `<Outlet />`
- Footer

### BrandedLayout

Used for auth pages (login, forgot password). Provides:
- Two-column layout
- Left side: form content
- Right side: branded background image with logo
- Responsive: stacks on mobile

### Layout Context

The `DefaultLayout` uses a React context to share sidebar state:

```typescript
// src/layout/components/context.tsx
// Provides: sidebarCollapsed, toggleSidebar
```

## Sidebar Menu Configuration

The sidebar menu is defined in `src/config/app.config.tsx`. It's a data structure — not hardcoded JSX.

Each menu item has:
- `title` — Display text
- `icon` — Lucide icon component
- `path` — Route path
- `children` — Nested sub-items (for accordion groups)

To add a new sidebar item, edit `app.config.tsx`.

## Icons

The project uses **Lucide React** icons:

```tsx
import { Package, ShoppingCart, Users } from 'lucide-react';

<Package className="h-4 w-4" />
```

Browse all icons at: https://lucide.dev/icons

## Responsive Design

Use the `useIsMobile()` hook to conditionally render based on viewport:

```typescript
import { useIsMobile } from '@/shared/hooks/use-mobile';

function MyComponent() {
  const isMobile = useIsMobile(); // true below 1024px

  return isMobile ? <MobileView /> : <DesktopView />;
}
```

## Page Titles

Use `useDocumentTitle()` to set the browser tab title:

```typescript
import { useDocumentTitle } from '@/shared/hooks/use-document-title';

function ProductListPage() {
  useDocumentTitle('Products');
  // Tab shows: "Products | Soccer Locker Management"
}
```

## Common Page Layout

Most pages follow this structure:

```tsx
export default function MyListPage() {
  useDocumentTitle('My Items');
  const { data, isLoading } = useMyItems();

  return (
    <div className="p-6 space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Items</h1>
        <Button onClick={handleCreate}>Add New</Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <Skeleton />
      ) : (
        <MyItemsTable data={data} />
      )}
    </div>
  );
}
```

## Sheets (Side Panels)

The app uses `Sheet` components heavily for forms and detail views instead of navigating to a new page:

```tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';

<Sheet open={isOpen} onOpenChange={setIsOpen}>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Create Item</SheetTitle>
    </SheetHeader>
    <MyForm onSuccess={() => setIsOpen(false)} />
  </SheetContent>
</Sheet>
```
