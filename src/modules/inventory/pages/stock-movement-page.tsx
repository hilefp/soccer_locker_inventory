import { useState } from 'react';
import { StockMovementTable } from '../components/stock-movement-table';
import { Button } from '@/shared/components/ui/button';
import { Input, InputWrapper } from '@/shared/components/ui/input';
import { Search, X, Calendar } from 'lucide-react';
import { Card, CardHeader, CardToolbar } from '@/shared/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { MovementType } from '../types/stock-movement.types';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';

export function StockMovementPage() {
  useDocumentTitle('Stock Movements');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovementType, setSelectedMovementType] = useState<MovementType | 'ALL'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedMovementType('ALL');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters =
    searchQuery ||
    selectedMovementType !== 'ALL' ||
    startDate ||
    endDate;

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Movements</h1>
          <p className="text-base text-muted-foreground">
            Track all inventory movements - entries, exits, adjustments, and transfers
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <Card>
        <CardHeader className="py-4">
          <CardToolbar className="flex flex-col gap-4">
            {/* First Row: Search and Movement Type */}
            <div className="flex items-center gap-4 w-full">
              {/* Search */}
              <InputWrapper className="flex-1 lg:max-w-[400px] py-4 h-12 rounded-xl">
                <Search className="h-5 w-5" />
                <Input
                  placeholder="Search by product, SKU, or reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-base py-4 h-12 rounded-xl"
                />
                {searchQuery && (
                  <Button
                    variant="dim"
                    size="sm"
                    className="-me-3.5"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </InputWrapper>

              {/* Movement Type Filter */}
              <Select
                value={selectedMovementType}
                onValueChange={(value) => setSelectedMovementType(value as MovementType | 'ALL')}
              >
                <SelectTrigger className="w-[200px] h-12">
                  <SelectValue placeholder="Movement Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value={MovementType.PURCHASE}>Purchase</SelectItem>
                  <SelectItem value={MovementType.SALE}>Sale</SelectItem>
                  <SelectItem value={MovementType.ADJUSTMENT}>Adjustment</SelectItem>
                  <SelectItem value={MovementType.TRANSFER_IN}>Transfer In</SelectItem>
                  <SelectItem value={MovementType.TRANSFER_OUT}>Transfer Out</SelectItem>
                  <SelectItem value={MovementType.RETURN}>Return</SelectItem>
                  <SelectItem value={MovementType.RESERVATION}>Reservation</SelectItem>
                  <SelectItem value={MovementType.RELEASE}>Release</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="gap-2 h-12 px-4"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Second Row: Date Range */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Date Range:</span>
              </div>

              <InputWrapper className="w-[180px] h-10 rounded-lg">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-sm h-10 rounded-lg"
                  placeholder="Start Date"
                />
              </InputWrapper>

              <span className="text-sm text-muted-foreground">to</span>

              <InputWrapper className="w-[180px] h-10 rounded-lg">
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-sm h-10 rounded-lg"
                  placeholder="End Date"
                />
              </InputWrapper>
            </div>
          </CardToolbar>
        </CardHeader>
      </Card>

      {/* Stock Movement Table */}
      <StockMovementTable
        movementType={selectedMovementType !== 'ALL' ? selectedMovementType : undefined}
        startDate={startDate || undefined}
        endDate={endDate || undefined}
      />
    </div>
  );
}
