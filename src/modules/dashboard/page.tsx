import { Card } from '@/shared/components/ui/card';
import { useAuth } from '../auth/hooks/use-auth';
import { Link } from 'react-router';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';

const cards = [
  {
    title: 'Module Products',
    imageUrl: '/media/misc/products_dashboard.png',
    badge: '100',
    href: '/products',
    permission: 'products:read',
  },
  {
    title: 'Module Inventory',
    imageUrl: '/media/misc/inventory.png',
    badge: '100',
    href: '/inventory',
    permission: 'stock:read',
  },
  {
    title: 'Module Clubs',
    imageUrl: '/media/misc/clubs.png',
    badge: '100',
    href: '/clubs',
    permission: 'clubs:read',
  },
  {
    title: 'Module Reports',
    imageUrl: '/media/misc/reports.png',
    badge: '100',
    href: '/reports',
    permission: 'reports:read',
  },
  {
    title: 'Module Shop',
    imageUrl: '/media/misc/reports.png',
    badge: '100',
    href: '/Shop',
    permission: 'users:read',
  },
  {
    title: 'Module Orders',
    imageUrl: '/media/misc/reports.png',
    badge: '100',
    href: '/orders',
    permission: 'orders:read',
  },
];

export function DashboardPage() {
  useDocumentTitle('Dashboard');
  const { user, hasPermission } = useAuth();
  const name = user?.email || 'Guest';

  const visibleCards = cards.filter((card) => hasPermission(card.permission));

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hi, {name}</h1>
          <p className="text-muted-foreground">Welcome to your dashboard</p>
        </div>
      </div>

      <Card className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-4 p-0 bg-transparent">
        {visibleCards.map((card) => (
          <Link
            to={card.href}
            className="group relative flex flex-col items-center justify-between rounded-2xl p-0 transition-all bg-white dark:bg-zinc-900 dark:text-white"
          >
            {/* Image Container */}
            <div className="relative rounded-2xl overflow-hidden h-64 w-full flex items-center justify-center">
              

              <div className=" text-foreground text-center">
                <h3 className="text-2xl font-light ">{card.title}</h3>
              </div>
            </div>
          </Link>
        ))}
      </Card>
    </div>
  );
}
