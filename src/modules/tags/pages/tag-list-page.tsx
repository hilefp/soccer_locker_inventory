'use client';

import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { TagListTable } from '../components/tag-list-table';
import { TagFormSheet } from '../components/tag-form-sheet';
import { useTags } from '../hooks/use-tags';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';

export function TagListPage() {
  useDocumentTitle('Tags');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: tags = [], isLoading, error } = useTags(true);

  const activeTags = tags.filter((t) => t.isActive);
  const totalTags = tags.length;

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-xl font-semibold text-foreground">Tags</h3>
          <span className="text-sm text-muted-foreground">
            {isLoading
              ? 'Loading tags...'
              : error
                ? `Error loading tags: ${error.message}`
                : `${totalTags} tags found. ${activeTags.length} active.`}
          </span>
        </div>

        <Button variant="mono" onClick={() => setIsCreateOpen(true)}>
          <PlusIcon />
          Add Tag
        </Button>
      </div>

      <TagListTable
        tags={tags}
        isLoading={isLoading}
        error={error?.message || null}
      />

      <TagFormSheet
        mode="new"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  );
}
