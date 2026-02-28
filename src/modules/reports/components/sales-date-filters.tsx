import { useState, useEffect } from 'react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { Calendar, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

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

type DatePeriod = 'today' | 'week' | 'month' | '6months' | 'year' | 'custom';

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
  const [selectedPeriod, setSelectedPeriod] = useState<DatePeriod>('custom');

  useEffect(() => {
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setDateError('End date cannot be before start date');
    } else {
      setDateError('');
    }
  }, [startDate, endDate]);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handlePeriodClick = (period: DatePeriod) => {
    setSelectedPeriod(period);
    const today = new Date();
    const endDateValue = formatDate(today);
    let startDateValue = '';

    switch (period) {
      case 'today':
        startDateValue = endDateValue;
        break;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        startDateValue = formatDate(weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        startDateValue = formatDate(monthAgo);
        break;
      case '6months':
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        startDateValue = formatDate(sixMonthsAgo);
        break;
      case 'year':
        const yearAgo = new Date(today);
        yearAgo.setFullYear(today.getFullYear() - 1);
        startDateValue = formatDate(yearAgo);
        break;
      case 'custom':
        return;
    }

    onStartDateChange(startDateValue);
    onEndDateChange(endDateValue);
  };

  const handleCustomDateChange = () => {
    setSelectedPeriod('custom');
  };

  const hasActiveFilters = startDate || endDate || clubId;

  const periodButtons: { label: string; value: DatePeriod }[] = [
    { label: 'Hoy', value: 'today' },
    { label: 'Esta semana', value: 'week' },
    { label: 'Este mes', value: 'month' },
    { label: '6 meses', value: '6months' },
    { label: 'Este año', value: 'year' },
    { label: 'Personalizado', value: 'custom' },
  ];

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Calendar className="h-4.5 w-4.5 text-primary" />
          </div>
          <span>Filtros de Fecha</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 block">
            Período
          </Label>
          <div className="flex flex-wrap gap-2">
            {periodButtons.map((button) => (
              <Button
                key={button.value}
                variant="outline"
                size="sm"
                onClick={() => handlePeriodClick(button.value)}
                className={cn(
                  'rounded-lg font-medium text-sm px-4 py-2 transition-all duration-200 border-2',
                  selectedPeriod === button.value
                    ? 'bg-yellow-400 text-black hover:bg-yellow-500 hover:text-black border-yellow-400 shadow-sm'
                    : 'bg-background hover:bg-muted/50 border-border hover:border-muted-foreground/30'
                )}
              >
                {button.label}
              </Button>
            ))}
          </div>
        </div>

        {selectedPeriod === 'custom' && (
          <div className="space-y-4 pt-2 border-t">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block">
              Rango Personalizado
            </Label>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-medium">
                  Fecha Inicio
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    onStartDateChange(e.target.value);
                    handleCustomDateChange();
                  }}
                  className="rounded-lg border-2 focus:border-primary"
                  aria-label="Start date filter"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-medium">
                  Fecha Fin
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    onEndDateChange(e.target.value);
                    handleCustomDateChange();
                  }}
                  className="rounded-lg border-2 focus:border-primary"
                  aria-label="End date filter"
                />
              </div>
            </div>
          </div>
        )}

        {showClubFilter && onClubIdChange && (
          <div className="space-y-3 pt-2 border-t">
            <Label htmlFor="clubId" className="text-sm font-medium">
              Club ID <span className="text-muted-foreground font-normal">(Opcional)</span>
            </Label>
            <Input
              id="clubId"
              type="text"
              placeholder="Ingresa el ID del club..."
              value={clubId}
              onChange={(e) => onClubIdChange(e.target.value)}
              className="rounded-lg border-2 focus:border-primary"
              aria-label="Club ID filter"
            />
          </div>
        )}

        {dateError && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
            <p className="text-sm text-destructive font-medium flex items-center gap-2" role="alert">
              <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
              {dateError}
            </p>
          </div>
        )}

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="w-full rounded-lg border-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-200"
          >
            <X className="mr-2 h-4 w-4" />
            Limpiar Filtros
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
