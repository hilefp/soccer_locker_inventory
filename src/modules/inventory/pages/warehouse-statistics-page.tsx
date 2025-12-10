import { useParams, useNavigate } from 'react-router';
import { useWarehouseStatistics } from '../hooks/use-warehouses';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { ArrowLeft, Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

export function WarehouseStatisticsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useWarehouseStatistics(id || '');

  if (isLoading) {
    return (
      <div className="container-fluid space-y-5 lg:space-y-9">
        <p className="text-muted-foreground">Loading statistics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container-fluid space-y-5 lg:space-y-9">
        <Button
          variant="ghost"
          onClick={() => navigate('/inventory/warehouses')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Warehouses
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load warehouse statistics</p>
            {error && <p className="text-sm text-muted-foreground mt-2">{error.message}</p>}
          </CardContent>
        </Card>
      </div>
    );
  }

  const { warehouse, statistics } = data;

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate('/inventory/warehouses')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Warehouses
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {warehouse.name} Statistics
            </h1>
            <p className="text-muted-foreground">
              Code: {warehouse.code} • Type: {warehouse.warehouseType}
            </p>
          </div>
          <Badge variant={warehouse.isActive ? 'success' : 'secondary'}>
            {warehouse.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Records</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.totalStockRecords.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique items in warehouse
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.totalQuantity.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Units across all items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Quantity</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statistics.totalAvailableQuantity.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Units ready for use
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reserved Quantity</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {statistics.totalReservedQuantity.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Units reserved for orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Low Stock Items
            </CardTitle>
            <CardDescription>
              Items running low on inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {statistics.lowStockItems}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Items below minimum stock level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Out of Stock Items
            </CardTitle>
            <CardDescription>
              Items completely out of stock
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {statistics.outOfStockItems}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Items with zero quantity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Capacity Usage */}
      {warehouse.capacity && (
        <Card>
          <CardHeader>
            <CardTitle>Capacity Utilization</CardTitle>
            <CardDescription>
              Current warehouse capacity usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Capacity Used</p>
                  <p className="text-2xl font-bold">{statistics.capacityUsed}%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Capacity</p>
                  <p className="text-lg font-semibold">
                    {warehouse.capacity.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-secondary rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all ${
                    statistics.capacityUsed >= 90
                      ? 'bg-red-600'
                      : statistics.capacityUsed >= 75
                      ? 'bg-yellow-600'
                      : 'bg-green-600'
                  }`}
                  style={{ width: `${Math.min(statistics.capacityUsed, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {Math.round((statistics.capacityUsed / 100) * warehouse.capacity).toLocaleString()}{' '}
                  units used
                </span>
                <span>
                  {Math.round(
                    ((100 - statistics.capacityUsed) / 100) * warehouse.capacity
                  ).toLocaleString()}{' '}
                  units available
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warehouse Details */}
      <Card>
        <CardHeader>
          <CardTitle>Warehouse Details</CardTitle>
          <CardDescription>
            General information about this warehouse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Created At</dt>
              <dd className="text-sm">
                {new Date(warehouse.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
              <dd className="text-sm">
                {new Date(warehouse.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(`/inventory/warehouses/${id}/edit`)}
        >
          Edit Warehouse
        </Button>
        <Button onClick={() => navigate('/inventory/warehouses')}>
          View All Warehouses
        </Button>
      </div>
    </div>
  );
}
