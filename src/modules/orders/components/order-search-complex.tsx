'use client';

import { useRef, useState } from 'react';
import { Search, X, Calendar, Filter } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input, InputWrapper } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { Calendar as CalendarComponent } from '@/shared/components/ui/calendar';
import { format } from 'date-fns';
import { OrderStatus, ORDER_STATUS_LABELS, KANBAN_STATUS_ORDER } from '@/modules/orders/types';

interface OrderSearchComplexProps {
  searchQuery: string;
  onSearchChange: (search: string) => void;
  selectedStatus?: OrderStatus | 'all';
  onStatusChange?: (status: OrderStatus | undefined) => void;
  startDate?: Date;
  endDate?: Date;
  onDateRangeChange?: (start?: Date, end?: Date) => void;
  showStatusFilter?: boolean;
  showDateFilter?: boolean;
  placeholder?: string;
}

export function OrderSearchComplex({
  searchQuery,
  onSearchChange,
  selectedStatus = 'all',
  onStatusChange,
  startDate,
  endDate,
  onDateRangeChange,
  showStatusFilter = true,
  showDateFilter = true,
  placeholder = 'Search by order number, customer name, tracking...',
}: OrderSearchComplexProps) {
  const [inputValue, setInputValue] = useState(searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);

  const handleClearInput = () => {
    setInputValue('');
    onSearchChange('');
    inputRef.current?.focus();
  };

  const handleSearchSubmit = () => {
    onSearchChange(inputValue);
  };

  const handleStatusChange = (value: string) => {
    onStatusChange?.(value === 'all' ? undefined : (value as OrderStatus));
  };

  const handleStartDateChange = (date?: Date) => {
    onDateRangeChange?.(date, endDate);
  };

  const handleEndDateChange = (date?: Date) => {
    onDateRangeChange?.(startDate, date);
  };

  const clearDateRange = () => {
    onDateRangeChange?.(undefined, undefined);
    setIsDatePopoverOpen(false);
  };

  const hasDateFilter = startDate || endDate;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search Input */}
      <div className="w-full max-w-[350px]">
        <InputWrapper>
          <Search />
          <Input
            placeholder={placeholder}
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearchSubmit();
              }
              e.stopPropagation();
            }}
            onMouseDown={(e) => e.stopPropagation()}
          />
          <Button
            onClick={handleClearInput}
            variant="dim"
            className="-me-4"
            disabled={inputValue === ''}
          >
            {inputValue !== '' && <X size={16} />}
          </Button>
        </InputWrapper>
      </div>

      {/* Status Filter */}
      {showStatusFilter && (
        <Select value={selectedStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {KANBAN_STATUS_ORDER.map((status) => (
              <SelectItem key={status} value={status}>
                {ORDER_STATUS_LABELS[status]}
              </SelectItem>
            ))}
            <SelectItem value="MISSING">{ORDER_STATUS_LABELS.MISSING}</SelectItem>
            <SelectItem value="REFUND">{ORDER_STATUS_LABELS.REFUND}</SelectItem>
          </SelectContent>
        </Select>
      )}

      {/* Date Range Filter */}
      {showDateFilter && (
        <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant={hasDateFilter ? 'primary' : 'outline'} className="gap-2">
              <Calendar className="size-4" />
              {hasDateFilter ? (
                <span>
                  {startDate ? format(startDate, 'MMM dd') : 'Start'} -{' '}
                  {endDate ? format(endDate, 'MMM dd') : 'End'}
                </span>
              ) : (
                <span>Date Range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-4 space-y-4">
              <div className="flex gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={handleStartDateChange}
                    initialFocus
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={handleEndDateChange}
                    disabled={(date) => (startDate ? date < startDate : false)}
                  />
                </div>
              </div>
              {hasDateFilter && (
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={clearDateRange}>
                    Clear Dates
                  </Button>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
