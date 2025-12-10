'use client';

import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { ClubListTable } from '../components/club-list-table';
import { ClubFormSheet } from '../components/club-form-sheet';
import { useClubs } from '../hooks/use-clubs';

export function ClubListPage() {
  const [isCreateClubOpen, setIsCreateClubOpen] = useState(false);

  // Use React Query hook for data fetching
  const { data: clubs = [], isLoading, error } = useClubs();

  const activeClubs = clubs.filter((club) => club.isActive);
  const totalClubs = clubs.length;
  const inactivePercentage =
    totalClubs > 0
      ? Math.round(((totalClubs - activeClubs.length) / totalClubs) * 100)
      : 0;

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-xl font-semibold text-foreground">Clubs</h3>
          <span className="text-sm text-muted-foreground">
            {isLoading
              ? 'Loading clubs...'
              : error
                ? `Error loading clubs: ${error.message}`
                : `${totalClubs} clubs found. ${inactivePercentage}% inactive.`}
          </span>
        </div>

        <Button variant="mono" onClick={() => setIsCreateClubOpen(true)}>
          <PlusIcon />
          Add Club
        </Button>
      </div>

      <ClubListTable
        clubs={clubs}
        isLoading={isLoading}
        error={error?.message || null}
      />

      <ClubFormSheet
        mode="new"
        open={isCreateClubOpen}
        onOpenChange={setIsCreateClubOpen}
      />
    </div>
  );
}
