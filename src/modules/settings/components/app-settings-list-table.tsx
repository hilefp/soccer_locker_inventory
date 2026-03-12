'use client';

import { useMemo, useState } from 'react';
import { AppSettingsFormSheet } from './app-settings-form-sheet';
import type { AppSetting } from '../types';
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
import { DataGridTable } from '@/shared/components/ui/data-grid-table';
import { Input, InputWrapper } from '@/shared/components/ui/input';
import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area';
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Search, SquarePen, X } from 'lucide-react';

interface AppSettingsListTableProps {
  settings?: AppSetting[];
  isLoading?: boolean;
  error?: string | null;
}

export function AppSettingsListTable({
  settings = [],
  isLoading = false,
  error = null,
}: AppSettingsListTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'key', desc: false },
  ]);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<AppSetting | undefined>(undefined);

  const columns = useMemo<ColumnDef<AppSetting>[]>(
    () => [
      {
        id: 'key',
        accessorFn: (row) => row.key,
        header: ({ column }) => (
          <DataGridColumnHeader title="Key" column={column} />
        ),
        cell: (info) => (
          <span className="text-sm font-medium font-mono">
            {info.getValue() as string}
          </span>
        ),
        enableSorting: true,
        size: 250,
      },
      {
        id: 'value',
        accessorFn: (row) => row.value,
        header: ({ column }) => (
          <DataGridColumnHeader title="Value" column={column} />
        ),
        cell: (info) => (
          <span className="text-sm">{info.getValue() as string}</span>
        ),
        enableSorting: true,
        size: 300,
      },
      {
        id: 'description',
        accessorFn: (row) => row.description || '-',
        header: ({ column }) => (
          <DataGridColumnHeader title="Description" column={column} />
        ),
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {info.getValue() as string}
          </span>
        ),
        enableSorting: false,
        size: 250,
      },
      {
        id: 'actions',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => {
          const setting = row.original;

          const handleEdit = () => {
            setSelectedSetting(setting);
            setIsEditOpen(true);
          };

          return (
            <div className="flex items-center gap-1">
              <Button
                variant="dim"
                mode="icon"
                size="sm"
                onClick={handleEdit}
                title="Edit setting"
              >
                <SquarePen />
              </Button>
            </div>
          );
        },
        size: 60,
      },
    ],
    [],
  );

  const filteredData = useMemo(() => {
    if (!searchQuery) {
      return settings;
    }
    const query = searchQuery.toLowerCase();
    return settings.filter(
      (setting) =>
        setting.key.toLowerCase().includes(query) ||
        setting.value.toLowerCase().includes(query) ||
        setting.description?.toLowerCase().includes(query),
    );
  }, [settings, searchQuery]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

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
                  placeholder="Search settings..."
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
                <span className="text-muted-foreground">Loading settings...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <span className="text-destructive">Error loading settings</span>
                <span className="text-sm text-muted-foreground">{error}</span>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <span className="text-muted-foreground">
                  {searchQuery
                    ? 'No settings found matching your search'
                    : 'No settings configured'}
                </span>
              </div>
            ) : (
              <ScrollArea>
                <DataGridTable />
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}
          </CardTable>
          <CardFooter>
            <DataGridPagination />
          </CardFooter>
        </Card>
      </DataGrid>

      <AppSettingsFormSheet
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        setting={selectedSetting}
      />
    </>
  );
}
