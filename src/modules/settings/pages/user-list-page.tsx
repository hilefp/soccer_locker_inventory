'use client';

import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { UserListTable } from '../components/user-list-table';
import { UserFormSheet } from '../components/user-form-sheet';
import { useInventoryUsers } from '../hooks/use-inventory-users';

export function UserListPage() {
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);

  // Use React Query hook for data fetching
  const { data: users = [], isLoading, error } = useInventoryUsers();

  const activeUsers = users.filter((user) => user.status === 'ACTIVE');
  const totalUsers = users.length;
  const inactivePercentage =
    totalUsers > 0
      ? Math.round(((totalUsers - activeUsers.length) / totalUsers) * 100)
      : 0;

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-xl font-semibold text-foreground">Users</h3>
          <span className="text-sm text-muted-foreground">
            {isLoading
              ? 'Loading users...'
              : error
                ? `Error loading users: ${error.message}`
                : `${totalUsers} users found. ${inactivePercentage}% needs your attention.`}
          </span>
        </div>

        <Button variant="mono" onClick={() => setIsCreateUserOpen(true)}>
          <PlusIcon />
          Add User
        </Button>
      </div>

      <UserListTable users={users} isLoading={isLoading} error={error?.message || null} />

      <UserFormSheet
        mode="new"
        open={isCreateUserOpen}
        onOpenChange={setIsCreateUserOpen}
      />
    </div>
  );
}
