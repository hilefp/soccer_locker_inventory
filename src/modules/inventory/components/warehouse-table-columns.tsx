import { ColumnDef } from '@tanstack/react-table';
import { Warehouse } from '../types/warehouse.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, BarChart3, Power, PowerOff, Trash2 } from 'lucide-react';
import { Link } from 'react-router';

interface WarehouseTableColumnsProps {
  onEdit: (warehouse: Warehouse) => void;
  onViewStatistics: (warehouse: Warehouse) => void;
  onActivate: (warehouse: Warehouse) => void;
  onDeactivate: (warehouse: Warehouse) => void;
  onDelete: (warehouse: Warehouse) => void;
}

export const getWarehouseTableColumns = ({
  onEdit,
  onViewStatistics,
  onActivate,
  onDeactivate,
  onDelete,
}: WarehouseTableColumnsProps): ColumnDef<Warehouse>[] => [
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => (
      <Link
        to={`/inventory/warehouses/${row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {row.getValue('code')}
      </Link>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'warehouseType',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('warehouseType') as string;
      const colorMap: Record<string, string> = {
        MAIN: 'bg-blue-100 text-blue-800',
        SECONDARY: 'bg-purple-100 text-purple-800',
        STORE: 'bg-green-100 text-green-800',
        VIRTUAL: 'bg-yellow-100 text-yellow-800',
        PRODUCTION: 'bg-orange-100 text-orange-800',
        TRANSIT: 'bg-gray-100 text-gray-800',
      };
      return (
        <Badge variant="secondary" className={colorMap[type] || ''}>
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'city',
    header: 'City',
    cell: ({ row }) => row.getValue('city') || '-',
  },
  {
    accessorKey: 'state',
    header: 'State',
    cell: ({ row }) => row.getValue('state') || '-',
  },
  {
    accessorKey: 'country',
    header: 'Country',
    cell: ({ row }) => row.getValue('country') || '-',
  },
  {
    accessorKey: 'capacity',
    header: 'Capacity',
    cell: ({ row }) => {
      const capacity = row.getValue('capacity') as number | undefined;
      return capacity ? capacity.toLocaleString() : '-';
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean;
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const warehouse = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(warehouse)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewStatistics(warehouse)}>
              <BarChart3 className="mr-2 h-4 w-4" />
              View Statistics
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {warehouse.isActive ? (
              <DropdownMenuItem onClick={() => onDeactivate(warehouse)}>
                <PowerOff className="mr-2 h-4 w-4" />
                Deactivate
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => onActivate(warehouse)}>
                <Power className="mr-2 h-4 w-4" />
                Activate
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(warehouse)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
