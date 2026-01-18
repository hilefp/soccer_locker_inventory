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
  },
  {
    title: 'Module Inventory',
    imageUrl: '/media/misc/inventory.png',
    badge: '100',
    href: '/inventory',
  },
  {
    title: 'Module Clubs',
    imageUrl: '/media/misc/clubs.png',
    badge: '100',
    href: '/clubs',
  },

  {
    title: 'Module Reports',
    imageUrl: '/media/misc/reports.png',
    badge: '100',
    href: '/reports',
  },
  {
    title: 'Module Shop',
    imageUrl: '/media/misc/reports.png',
    badge: '100',
    href: '/Shop',
  },
  
];

export function DashboardPage() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const name = user?.email || 'Guest';
  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hi, {name}</h1>
          <p className="text-muted-foreground">Welcome to your dashboard</p>
        </div>
      </div>

      <Card className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-4 p-0 bg-transparent">
        {cards.map((card) => (
          <Link
            to={card.href}
            className="group relative flex flex-col items-center justify-between rounded-2xl p-0 transition-all bg-white"
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
