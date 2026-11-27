import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { PaginatedMeta } from '@/modules/shop/types/email-campaign.type';

/** Prev/next pager for server-paginated lists. */
export function SimplePagination({
  meta,
  onPageChange,
}: {
  meta?: PaginatedMeta;
  onPageChange: (page: number) => void;
}) {
  if (!meta || meta.total === 0) return null;
  const from = (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="flex w-full items-center justify-between gap-2 text-sm text-muted-foreground">
      <span>
        {from}–{to} of {meta.total}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          mode="icon"
          disabled={!meta.hasPreviousPage}
          onClick={() => onPageChange(meta.page - 1)}
          title="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="px-2">
          Page {meta.page} of {Math.max(meta.totalPages, 1)}
        </span>
        <Button
          variant="outline"
          size="sm"
          mode="icon"
          disabled={!meta.hasNextPage}
          onClick={() => onPageChange(meta.page + 1)}
          title="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
