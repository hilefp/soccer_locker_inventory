import { useMemo, useState } from 'react';
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
import { Search, SquarePen, Trash, X, FileText } from 'lucide-react';
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
  DataGridTable,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from '@/shared/components/ui/data-grid-table';
import { Input, InputWrapper } from '@/shared/components/ui/input';
import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area';
import { CatalogFormSheet } from '@/modules/catalogs/components/catalog-form-sheet';
import { Catalog } from '@/modules/catalogs/types/catalog.types';
import { useDeleteCatalog } from '@/modules/catalogs/hooks/use-catalogs';

interface CatalogListTableProps {
  catalogs?: Catalog[];
  isLoading?: boolean;
  error?: string | null;
}

interface ICatalogData {
  id: string;
  catalogInfo: {
    brand: string;
    year: number;
    hasPdf: boolean;
  };
  sortPosition: number;
  status: {
    label: string;
    variant: string;
  };
}

const convertCatalogToData = (catalog: Catalog): ICatalogData => ({
  id: catalog.id,
  catalogInfo: {
    brand: catalog.brand,
    year: catalog.year,
    hasPdf: !!catalog.pdfUrl,
  },
  sortPosition: catalog.sortPosition,
  status: {
    label: catalog.isActive ? 'Active' : 'Inactive',
    variant: catalog.isActive ? 'success' : 'destructive',
  },
});

export function CatalogListTable({
  catalogs,
  isLoading = false,
  error = null,
}: CatalogListTableProps) {
  const data = useMemo(() => {
    if (!catalogs || catalogs.length === 0) return [];
    return catalogs.map(convertCatalogToData);
  }, [catalogs]);

  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'sortPosition', desc: false },
  ]);

  const deleteMutation = useDeleteCatalog();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | undefined>(undefined);

  const columns = useMemo<ColumnDef<ICatalogData>[]>(
    () => [
      {
        accessorKey: 'id',
        accessorFn: (row) => row.id,
        header: () => <DataGridTableRowSelectAll />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} />,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        size: 23,
      },
      {
        id: 'catalogInfo',
        accessorFn: (row) => row.catalogInfo,
        header: ({ column }) => (
          <DataGridColumnHeader title="Catalog" column={column} />
        ),
        cell: (info) => {
          const catalogInfo = info.row.getValue('catalogInfo') as ICatalogData['catalogInfo'];
          return (
            <div className="flex items-center gap-2.5">
              <Card className="flex items-center justify-center rounded-md bg-accent/50 h-[50px] w-[40px] shadow-none shrink-0 overflow-hidden">
                <FileText className={`size-5 ${catalogInfo.hasPdf ? 'text-primary' : 'text-muted-foreground'}`} />
              </Card>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">{catalogInfo.brand}</span>
                <span className="text-xs text-muted-foreground">{catalogInfo.year}</span>
              </div>
            </div>
          );
        },
        enableSorting: true,
        size: 200,
      },
      {
        id: 'sortPosition',
        accessorFn: (row) => row.sortPosition,
        header: ({ column }) => (
          <DataGridColumnHeader title="Sort Position" column={column} />
        ),
        cell: (info) => (
          <span className="text-sm">{info.getValue() as number}</span>
        ),
        enableSorting: true,
        size: 100,
      },
      {
        id: 'status',
        accessorFn: (row) => row.status,
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        cell: (info) => {
          const status = info.row.original.status;
          const variant = status.variant as 'success' | 'destructive';
          return (
            <Badge variant={variant} appearance="light">
              {status.label}
            </Badge>
          );
        },
        enableSorting: true,
        size: 80,
      },
      {
        id: 'actions',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => {
          const catalogId = row.getValue('id') as string;

          const handleEdit = () => {
            setSelectedCatalogId(catalogId);
            setIsEditOpen(true);
          };

          const handleDelete = async () => {
            if (!catalogId) return;
            try {
              await deleteMutation.mutateAsync(catalogId);
            } catch (error) {
              console.error('Delete error:', error);
            }
          };

          return (
            <div className="flex items-center gap-1">
              <Button
                variant="dim"
                mode="icon"
                size="sm"
                onClick={handleEdit}
                title="Edit catalog"
              >
                <SquarePen />
              </Button>
              <Button
                variant="dim"
                mode="icon"
                size="sm"
                onClick={handleDelete}
                title="Delete catalog"
              >
                <Trash />
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
    if (!searchQuery) return data;
    const query = searchQuery.toLowerCase();
    return data.filter(
      (item) =>
        item.catalogInfo.brand.toLowerCase().includes(query) ||
        String(item.catalogInfo.year).includes(query),
    );
  }, [data, searchQuery]);

  const table = useReactTable({
    data: filteredData,
    columns,
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
              <InputWrapper className="w-full lg:w-[200px]">
                <Search />
                <Input
                  placeholder="Search..."
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
                    {searchQuery && <X />}
                  </Button>
                )}
              </InputWrapper>
            </CardToolbar>
          </CardHeader>
          <CardTable>
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <span className="text-muted-foreground">Loading catalogs...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <span className="text-destructive">Error loading catalogs</span>
                <span className="text-sm text-muted-foreground">{error}</span>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <span className="text-muted-foreground">
                  {searchQuery ? 'No catalogs found matching your search' : 'No catalogs yet'}
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

      <CatalogFormSheet
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        catalogId={selectedCatalogId}
      />
    </>
  );
}
