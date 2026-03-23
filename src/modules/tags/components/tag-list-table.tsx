'use client';

import { useCallback, useMemo, useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { type DragEndEvent } from '@dnd-kit/core';
import { TagFormSheet } from './tag-form-sheet';
import { useDeleteTag, useReorderTags } from '../hooks/use-tags';
import { Tag } from '../types/tag';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardFooter,
  CardHeader,
  CardTable,
  CardToolbar,
} from '@/shared/components/ui/card';
import { DataGrid } from '@/shared/components/ui/data-grid';
import { DataGridColumnHeader } from '@/shared/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/shared/components/ui/data-grid-pagination';
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from '@/shared/components/ui/data-grid-table';
import {
  DataGridTableDndRowHandle,
  DataGridTableDndRows,
} from '@/shared/components/ui/data-grid-table-dnd-rows';
import { Input, InputWrapper } from '@/shared/components/ui/input';
import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area';
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Search, SquarePen, Trash, X } from 'lucide-react';
import { toast } from 'sonner';

interface TagListTableProps {
  tags?: Tag[];
  isLoading?: boolean;
  error?: string | null;
}

export function TagListTable({
  tags = [],
  isLoading = false,
  error = null,
}: TagListTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);

  const deleteMutation = useDeleteTag();
  const reorderMutation = useReorderTags();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState<string | undefined>(
    undefined,
  );

  const handleEdit = useCallback((tag: Tag) => {
    setSelectedTagId(tag.id);
    setIsEditOpen(true);
  }, []);

  const columns = useMemo<ColumnDef<Tag>[]>(
    () => [
      {
        id: 'drag',
        header: () => '',
        cell: ({ row }) => <DataGridTableDndRowHandle rowId={row.id} />,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        size: 40,
      },
      // {
      //   accessorKey: 'id',
      //   accessorFn: (row) => row.id,
      //   header: () => <DataGridTableRowSelectAll />,
      //   cell: ({ row }) => <DataGridTableRowSelect row={row} />,
      //   enableSorting: false,
      //   enableHiding: false,
      //   enableResizing: false,
      //   size: 23,
      // },
      {
        id: 'name',
        accessorFn: (row) => row.name,
        header: ({ column }) => (
          <DataGridColumnHeader title="Name" column={column} />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium">{row.original.name}</span>
        ),
        enableSorting: true,
        size: 300,
      },
      {
        id: 'status',
        accessorFn: (row) => row.isActive,
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        cell: ({ row }) => (
          <Badge
            variant={row.original.isActive ? 'success' : 'secondary'}
            appearance="light"
          >
            {row.original.isActive ? 'Active' : 'Inactive'}
          </Badge>
        ),
        enableSorting: true,
        size: 100,
      },
      {
        id: 'actions',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => {
          const tag = row.original;

          const handleDelete = async () => {
            if (!tag.id) return;
            if (!confirm('Are you sure you want to delete this tag?')) return;

            try {
              await deleteMutation.mutateAsync(tag.id);
              toast.success('Tag deleted successfully');
            } catch (error) {
              console.error('Delete error:', error);
              toast.error('Failed to delete tag');
            }
          };

          return (
            <div className="flex items-center gap-1">
              <Button
                variant="dim"
                mode="icon"
                size="sm"
                onClick={() => handleEdit(tag)}
                title="Edit tag"
              >
                <SquarePen />
              </Button>
              <Button
                variant="dim"
                mode="icon"
                size="sm"
                onClick={handleDelete}
                title="Delete tag"
              >
                <Trash />
              </Button>
            </div>
          );
        },
        size: 60,
      },
    ],
    [handleEdit, deleteMutation.mutateAsync],
  );

  const filteredData = useMemo(() => {
    if (!searchQuery) return tags;
    const query = searchQuery.toLowerCase();
    return tags.filter((tag) => tag.name.toLowerCase().includes(query));
  }, [tags, searchQuery]);

  const dataIds = useMemo(
    () => filteredData.map((_, index) => index.toString()),
    [filteredData],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getRowId: (_, index) => index.toString(),
    state: {
      pagination,
      sorting,
      rowSelection,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = parseInt(active.id as string, 10);
      const newIndex = parseInt(over.id as string, 10);

      const reordered = arrayMove(filteredData, oldIndex, newIndex);
      const ids = reordered.map((tag) => tag.id);

      reorderMutation.mutate({ ids });
    },
    [filteredData, reorderMutation],
  );

  return (
    <>
      <DataGrid
        table={table}
        recordCount={filteredData?.length || 0}
        tableLayout={{
          columnsPinnable: true,
          columnsMovable: true,
          columnsVisibility: true,
          cellBorder: true,
        }}
      >
        <Card>
          <CardHeader className="py-3.5">
            <CardToolbar className="flex items-center gap-2">
              <InputWrapper className="w-full lg:w-[250px]">
                <Search />
                <Input
                  placeholder="Search tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="dim"
                    size="sm"
                    className="-me-3.5"
                    onClick={() => setSearchQuery('')}
                  >
                    <X />
                  </Button>
                )}
              </InputWrapper>
            </CardToolbar>
          </CardHeader>
          <CardTable>
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <span className="text-muted-foreground">Loading tags...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <span className="text-destructive">Error loading tags</span>
                <span className="text-sm text-muted-foreground">{error}</span>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <span className="text-muted-foreground">
                  {searchQuery
                    ? 'No tags found matching your search'
                    : 'No tags yet'}
                </span>
              </div>
            ) : (
              <ScrollArea>
                <DataGridTableDndRows
                  handleDragEnd={handleDragEnd}
                  dataIds={dataIds}
                />
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}
          </CardTable>
          <CardFooter>
            <DataGridPagination />
          </CardFooter>
        </Card>
      </DataGrid>

      <TagFormSheet
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        tagId={selectedTagId}
      />
    </>
  );
}
