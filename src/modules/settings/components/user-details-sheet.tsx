'use client';

import { useEffect, useState } from 'react';
import { useInventoryUser, useUserRoles } from '../hooks/use-inventory-users';
import { useUpdateUserStatus, useDeleteInventoryUser } from '../hooks/use-inventory-users';
import { UserStatus } from '../types';
import { Badge, BadgeDot, BadgeProps } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { UserCircle, Mail, Phone, Briefcase, Building2, IdCard } from 'lucide-react';
import { toast } from 'sonner';
import { UserFormSheet } from './user-form-sheet';

interface UserDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
}

const getStatusVariant = (status: UserStatus): 'primary' | 'destructive' | 'secondary' | 'outline' | 'success' | 'warning' | 'info' => {
  switch (status) {
    case UserStatus.ACTIVE:
      return 'success';
    case UserStatus.INACTIVE:
      return 'secondary';
    case UserStatus.PENDING:
      return 'warning';
    case UserStatus.SUSPENDED:
      return 'destructive';
    default:
      return 'secondary';
  }
};

export function UserDetailsSheet({
  open,
  onOpenChange,
  userId,
}: UserDetailsSheetProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: user, isLoading } = useInventoryUser(userId);
  const { data: userRoles = [], isLoading: isLoadingRoles } = useUserRoles(userId);
  const updateStatusMutation = useUpdateUserStatus();
  const deleteMutation = useDeleteInventoryUser();

  const handleStatusChange = async (newStatus: UserStatus) => {
    if (!userId) return;

    try {
      await updateStatusMutation.mutateAsync({ id: userId, status: newStatus });
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!userId) return;

    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(userId);
      toast.success('User deleted successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleEdit = () => {
    setIsEditOpen(true);
  };

  if (!user && !isLoading) {
    return null;
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="gap-0 lg:w-[900px] sm:max-w-none inset-5 border start-auto h-auto rounded-lg p-0 [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
          <SheetHeader className="border-b py-3.5 px-5 border-border">
            <SheetTitle className="font-medium">User Details</SheetTitle>
          </SheetHeader>

          <SheetBody className="p-0 grow">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <span className="text-muted-foreground">Loading user details...</span>
              </div>
            ) : user ? (
              <>
                {/* Header Section */}
                <div className="flex justify-between flex-wrap gap-2 border-b border-border px-5 py-4">
                  <div className="flex gap-4 items-center">
                    <div className="flex items-center justify-center rounded-full bg-accent/50 h-[60px] w-[60px] shrink-0">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          className="rounded-full h-[60px] w-[60px] object-cover"
                          alt={`${user.firstName} ${user.lastName}`}
                        />
                      ) : (
                        <UserCircle className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="lg:text-[22px] font-semibold text-foreground leading-none">
                          {user.firstName} {user.lastName}
                        </span>
                        <Badge
                          size="sm"
                          variant={getStatusVariant(user.status)}
                          appearance="light"
                        >
                          {user.status}
                        </Badge>
                      </div>
                      <div className="flex items-center flex-wrap gap-2 text-2sm">
                        <span className="font-normal text-muted-foreground">
                          Email
                        </span>
                        <span className="font-medium text-foreground">
                          {user.email}
                        </span>
                        <BadgeDot className="bg-muted-foreground size-1" />
                        <span className="font-normal text-muted-foreground">
                          Employee ID
                        </span>
                        <span className="font-medium text-foreground">
                          {user.employeeId || 'N/A'}
                        </span>
                        {user.lastLoginAt && (
                          <>
                            <BadgeDot className="bg-muted-foreground size-1" />
                            <span className="font-normal text-muted-foreground">
                              Last Login
                            </span>
                            <span className="font-medium text-foreground">
                              {new Date(user.lastLoginAt).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                      Close
                    </Button>
                    <Button variant="outline" onClick={handleDelete}>
                      Delete
                    </Button>
                    <Button variant="mono" onClick={handleEdit}>
                      Edit User
                    </Button>
                  </div>
                </div>

                <ScrollArea
                  className="flex flex-col h-[calc(100dvh-15.8rem)] mx-1.5"
                  viewportClassName="[&>div]:h-full [&>div>div]:h-full"
                >
                  <div className="flex flex-wrap lg:flex-nowrap px-3.5 grow">
                    {/* Left Column - Main Info */}
                    <div className="grow lg:border-e border-border lg:pe-5 space-y-5 py-5">
                      {/* Contact Information */}
                      <Card className="rounded-md">
                        <CardHeader className="min-h-[34px] bg-accent/50">
                          <CardTitle className="text-2sm">
                            Contact Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">
                                  Email
                                </span>
                                <span className="text-sm font-medium">
                                  {user.email}
                                </span>
                              </div>
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <div className="flex flex-col">
                                  <span className="text-xs text-muted-foreground">
                                    Phone
                                  </span>
                                  <span className="text-sm font-medium">
                                    {user.phone}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Work Information */}
                      <Card className="rounded-md">
                        <CardHeader className="min-h-[34px] bg-accent/50">
                          <CardTitle className="text-2sm">
                            Work Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {user.position && (
                              <div className="flex items-center gap-3">
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                <div className="flex flex-col">
                                  <span className="text-xs text-muted-foreground">
                                    Position
                                  </span>
                                  <span className="text-sm font-medium">
                                    {user.position}
                                  </span>
                                </div>
                              </div>
                            )}
                            {user.department && (
                              <div className="flex items-center gap-3">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <div className="flex flex-col">
                                  <span className="text-xs text-muted-foreground">
                                    Department
                                  </span>
                                  <span className="text-sm font-medium">
                                    {user.department}
                                  </span>
                                </div>
                              </div>
                            )}
                            {user.employeeId && (
                              <div className="flex items-center gap-3">
                                <IdCard className="h-4 w-4 text-muted-foreground" />
                                <div className="flex flex-col">
                                  <span className="text-xs text-muted-foreground">
                                    Employee ID
                                  </span>
                                  <span className="text-sm font-medium">
                                    {user.employeeId}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* User Roles */}
                      <Card className="rounded-md">
                        <CardHeader className="min-h-[34px] bg-accent/50">
                          <CardTitle className="text-2sm">Assigned Roles</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          {isLoadingRoles ? (
                            <div className="flex items-center justify-center py-8">
                              <span className="text-sm text-muted-foreground">
                                Loading roles...
                              </span>
                            </div>
                          ) : userRoles.length === 0 ? (
                            <div className="flex items-center justify-center py-8">
                              <span className="text-sm text-muted-foreground">
                                No roles assigned
                              </span>
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow className="text-secondary-foreground font-normal text-2sm bg-accent/50">
                                    <TableHead className="h-8.5 border-e border-border ps-3.5">
                                      Role Name
                                    </TableHead>
                                    <TableHead className="h-8.5 border-e border-border">
                                      Assigned At
                                    </TableHead>
                                    <TableHead className="h-8.5">
                                      Expires At
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {userRoles.map((userRole) => (
                                    <TableRow key={userRole.roleId}>
                                      <TableCell className="py-2.5 border-e border-border ps-3.5">
                                        <div className="flex flex-col gap-1">
                                          <span className="text-sm font-medium">
                                            {userRole.role.name}
                                          </span>
                                          {userRole.role.description && (
                                            <span className="text-xs text-muted-foreground">
                                              {userRole.role.description}
                                            </span>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell className="py-2.5 border-e border-border">
                                        <span className="text-sm">
                                          {new Date(
                                            userRole.assignedAt,
                                          ).toLocaleDateString()}
                                        </span>
                                      </TableCell>
                                      <TableCell className="py-2.5">
                                        <span className="text-sm">
                                          {userRole.expiresAt
                                            ? new Date(
                                                userRole.expiresAt,
                                              ).toLocaleDateString()
                                            : 'Never'}
                                        </span>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Right Column - Quick Actions */}
                    <div className="w-full shrink-0 lg:w-[300px] py-5 lg:ps-5 space-y-4">
                      <Card className="rounded-md">
                        <CardHeader className="min-h-[34px] bg-accent/50">
                          <CardTitle className="text-2sm">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            size="sm"
                            onClick={() => handleStatusChange(UserStatus.ACTIVE)}
                            disabled={user.status === UserStatus.ACTIVE}
                          >
                            Activate User
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            size="sm"
                            onClick={() => handleStatusChange(UserStatus.INACTIVE)}
                            disabled={user.status === UserStatus.INACTIVE}
                          >
                            Deactivate User
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            size="sm"
                            onClick={() => handleStatusChange(UserStatus.SUSPENDED)}
                            disabled={user.status === UserStatus.SUSPENDED}
                          >
                            Suspend User
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="rounded-md">
                        <CardHeader className="min-h-[34px] bg-accent/50">
                          <CardTitle className="text-2sm">Account Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">
                              Created
                            </span>
                            <span className="text-sm font-medium">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">
                              Last Updated
                            </span>
                            <span className="text-sm font-medium">
                              {new Date(user.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </ScrollArea>
              </>
            ) : null}
          </SheetBody>
        </SheetContent>
      </Sheet>

      {/* Edit User Sheet */}
      <UserFormSheet
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        userId={userId}
        onSuccess={() => {
          // Refetch will happen automatically via React Query
        }}
      />
    </>
  );
}
