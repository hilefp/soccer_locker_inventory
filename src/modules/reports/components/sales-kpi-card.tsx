import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface SalesKpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  className?: string;
  iconClassName?: string;
  loading?: boolean;
}

export function SalesKpiCard({
  title,
  value,
  icon: Icon,
  description,
  className,
  iconClassName,
  loading = false,
}: SalesKpiCardProps) {
  return (
    <Card className={cn('transition-all hover:shadow-md', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn('h-4 w-4 text-muted-foreground', iconClassName)} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-8 w-24 animate-pulse rounded bg-muted" />
            {description && <div className="h-4 w-32 animate-pulse rounded bg-muted" />}
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
