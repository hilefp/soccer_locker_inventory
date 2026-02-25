import { useState, useEffect } from 'react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { Calendar, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

interface SalesDateFiltersProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClearFilters: () => void;
  showClubFilter?: boolean;
  clubId?: string;
  onClubIdChange?: (clubId: string) => void;
}

export function SalesDateFilters({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClearFilters,
  showClubFilter = false,
  clubId = '',
  onClubIdChange,
}: SalesDateFiltersProps) {
  const [dateError, setDateError] = useState<string>('');

  useEffect(() => {
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setDateError('End date cannot be before start date');
    } else {
      setDateError('');
    }
  }, [startDate, endDate]);

  const hasActiveFilters = startDate || endDate || clubId;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              aria-label="Start date filter"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              aria-label="End date filter"
            />
          </div>
        </div>

        {showClubFilter && onClubIdChange && (
          <div className="space-y-2">
            <Label htmlFor="clubId">Club ID (Optional)</Label>
            <Input
              id="clubId"
              type="text"
              placeholder="Enter club ID..."
              value={clubId}
              onChange={(e) => onClubIdChange(e.target.value)}
              aria-label="Club ID filter"
            />
          </div>
        )}

        {dateError && (
          <p className="text-sm text-destructive" role="alert">
            {dateError}
          </p>
        )}

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="w-full"
          >
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
