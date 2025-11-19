import { Control, Controller, UseFormRegister, FieldErrors } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { Badge } from '@/shared/components/ui/badge';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { EntryType } from '../types/stock-entry.types';
import { StockEntrySchemaType } from '../schemas/stock-entry-schema';
import { Warehouse } from '../types/warehouse.types';

interface StockEntryInformationCardProps {
  register: UseFormRegister<StockEntrySchemaType>;
  control: Control<StockEntrySchemaType>;
  errors: FieldErrors<StockEntrySchemaType>;
  warehouses?: Warehouse[];
  loadingWarehouses: boolean;
}

const entryTypeLabels: Record<EntryType, { label: string; description: string }> = {
  [EntryType.PURCHASE]: { label: 'Purchase', description: 'Purchase from supplier' },
  [EntryType.TRANSFER_IN]: { label: 'Transfer In', description: 'Transfer from another warehouse' },
  [EntryType.RETURN]: { label: 'Return', description: 'Return from customer' },
  [EntryType.PRODUCTION]: { label: 'Production', description: 'Produced internally' },
  [EntryType.ADJUSTMENT]: { label: 'Adjustment', description: 'Manual adjustment (increase)' },
  [EntryType.INITIAL]: { label: 'Initial', description: 'Initial stock load' },
};

export function StockEntryInformationCard({
  register,
  control,
  errors,
  warehouses,
  loadingWarehouses,
}: StockEntryInformationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Entry Information</CardTitle>
        <CardDescription>Basic details about the stock entry</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="entryNumber">Entry Number *</Label>
            <Input
              id="entryNumber"
              {...register('entryNumber')}
              placeholder="ENT-2024-001"
              className="font-mono"
              readOnly
            />
            {errors.entryNumber && (
              <p className="text-sm text-destructive">{errors.entryNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="entryType">Entry Type *</Label>
            <Controller
              name="entryType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="entryType">
                    <SelectValue placeholder="Select entry type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(entryTypeLabels).map(([value, { label, description }]) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{label}</span>
                          <span className="text-xs text-muted-foreground">{description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.entryType && (
              <p className="text-sm text-destructive">{errors.entryType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="warehouseId">Warehouse *</Label>
            <Controller
              name="warehouseId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="warehouseId">
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses?.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{warehouse.name}</span>
                          <Badge variant="outline" size="sm">{warehouse.code}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.warehouseId && (
              <p className="text-sm text-destructive">{errors.warehouseId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="entryDate">Entry Date *</Label>
            <Controller
              name="entryDate"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <Input
                    type="date"
                    value={format(field.value, 'yyyy-MM-dd')}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                    className="pr-10"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              )}
            />
            {errors.entryDate && (
              <p className="text-sm text-destructive">{errors.entryDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="referenceDocument">Reference Document</Label>
            <Input
              id="referenceDocument"
              {...register('referenceDocument')}
              placeholder="INV-2024-12345"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Additional notes about this entry..."
              rows={3}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
