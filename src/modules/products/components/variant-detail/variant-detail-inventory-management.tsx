import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Input } from '@/shared/components/ui/input';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';

interface VariantDetailInventoryManagementProps {
  trackInventory: boolean;
  setTrackInventory: (value: boolean) => void;
  allowBackorder: boolean;
  setAllowBackorder: (value: boolean) => void;
  lowStockThreshold?: number;
  setLowStockThreshold: (value: number | undefined) => void;
  isSaving: boolean;
}

export function VariantDetailInventoryManagement({
  trackInventory,
  setTrackInventory,
  allowBackorder,
  setAllowBackorder,
  lowStockThreshold,
  setLowStockThreshold,
  isSaving,
}: VariantDetailInventoryManagementProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Inventory Management
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="size-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  Configure how this variant handles stock availability and customer purchases
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Track Inventory */}
        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-0.5">
            <Label htmlFor="track-inventory" className="text-sm font-medium">
              Track Inventory
            </Label>
            <p className="text-xs text-muted-foreground">
              Monitor stock levels for this variant
            </p>
          </div>
          <Switch
            id="track-inventory"
            checked={trackInventory}
            onCheckedChange={setTrackInventory}
            disabled={isSaving}
          />
        </div>

        {/* Allow Backorder - Only show if tracking inventory */}
        {trackInventory && (
          <div className="flex items-center justify-between space-x-2 pt-2 border-t">
            <div className="space-y-0.5">
              <Label htmlFor="allow-backorder" className="text-sm font-medium">
                Allow Backorder
              </Label>
              <p className="text-xs text-muted-foreground">
                {allowBackorder
                  ? 'Customers can purchase even when out of stock (with notification)'
                  : 'Prevent purchases when out of stock'}
              </p>
            </div>
            <Switch
              id="allow-backorder"
              checked={allowBackorder}
              onCheckedChange={setAllowBackorder}
              disabled={isSaving}
            />
          </div>
        )}

        {/* Low Stock Threshold - Only show if tracking inventory */}
        {trackInventory && (
          <div className="space-y-2 pt-2 border-t">
            <Label htmlFor="low-stock-threshold" className="text-sm font-medium">
              Low Stock Threshold
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Alert when stock falls below this quantity
            </p>
            <Input
              id="low-stock-threshold"
              type="number"
              min="0"
              step="1"
              placeholder="e.g., 10"
              value={lowStockThreshold || ''}
              onChange={(e) =>
                setLowStockThreshold(e.target.value ? parseInt(e.target.value) : undefined)
              }
              disabled={isSaving}
            />
          </div>
        )}

        {/* Information Box */}
        {trackInventory && (
          <div className="bg-muted/50 rounded-md p-3 mt-4">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> When inventory tracking is enabled:
            </p>
            <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
              <li>
                Stock levels will be checked before allowing purchases
              </li>
              {allowBackorder ? (
                <li className="text-orange-600 dark:text-orange-400">
                  Customers will be notified if item is on backorder
                </li>
              ) : (
                <li className="text-red-600 dark:text-red-400">
                  Purchases will be blocked when out of stock
                </li>
              )}
              {lowStockThreshold && (
                <li>
                  Low stock alerts will trigger at {lowStockThreshold} units
                </li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
