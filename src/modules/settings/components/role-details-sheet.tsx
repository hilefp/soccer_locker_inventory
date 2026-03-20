import { useMemo, useState } from 'react';
import { useDeleteRole, useRoleUsers } from '../hooks/use-roles';
import { useRolePermissions } from '../hooks/use-permissions';
import type { Role } from '../types';
import { Badge } from '@/shared/components/ui/badge';
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
import { Shield, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { RoleFormSheet } from './role-form-sheet';

interface RoleDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role;
}

export function RoleDetailsSheet({
  open,
  onOpenChange,
  role,
}: RoleDetailsSheetProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: rolePermissions = [], isLoading: isLoadingPerms } =
    useRolePermissions(role?.id);
  const { data: roleUsers = [], isLoading: isLoadingUsers } = useRoleUsers(
    role?.id,
  );
  const deleteMutation = useDeleteRole();

  // Group permissions by section
  const permissionsBySection = useMemo(() => {
    const grouped: Record<string, string[]> = {};
    for (const rp of rolePermissions) {
      const section = rp.permission.section;
      if (!grouped[section]) {
        grouped[section] = [];
      }
      grouped[section].push(rp.permission.action);
    }
    return grouped;
  }, [rolePermissions]);

  const handleDelete = async () => {
    if (!role) return;
    if (!confirm(`Are you sure you want to delete the role "${role.name}"?`))
      return;

    try {
      await deleteMutation.mutateAsync(role.id);
      toast.success('Role deleted successfully');
      onOpenChange(false);
    } catch {
      toast.error('Failed to delete role');
    }
  };

  if (!role) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="gap-0 w-[500px] p-0 inset-5 border start-auto h-auto rounded-lg [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
          <SheetHeader className="border-b py-4 px-6">
            <SheetTitle className="font-medium">Role Details</SheetTitle>
          </SheetHeader>

          <SheetBody className="p-0 grow">
            <ScrollArea
              className="h-[calc(100dvh-14rem)] mx-1.5 px-3.5 grow"
              viewportClassName="[&>div]:h-full [&>div>div]:h-full"
            >
              <div className="space-y-5 py-5">
                {/* Role Info */}
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center rounded-full bg-accent/50 h-[48px] w-[48px] shrink-0">
                    <Shield className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">{role.name}</span>
                      <Badge
                        variant={role.isActive ? 'success' : 'secondary'}
                        appearance="light"
                        size="sm"
                      >
                        {role.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {role.description && (
                      <span className="text-sm text-muted-foreground">
                        {role.description}
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Created {new Date(role.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="mono"
                    size="sm"
                    onClick={() => setIsEditOpen(true)}
                  >
                    Edit Role
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDelete}>
                    Delete
                  </Button>
                </div>

                {/* Permissions */}
                <Card className="rounded-md">
                  <CardHeader className="min-h-[34px] bg-accent/50">
                    <CardTitle className="text-2sm">
                      Permissions ({rolePermissions.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingPerms ? (
                      <div className="flex items-center justify-center py-4">
                        <span className="text-sm text-muted-foreground">
                          Loading...
                        </span>
                      </div>
                    ) : Object.keys(permissionsBySection).length === 0 ? (
                      <div className="flex items-center justify-center py-4">
                        <span className="text-sm text-muted-foreground">
                          No permissions assigned
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(permissionsBySection)
                          .sort(([a], [b]) => a.localeCompare(b))
                          .map(([section, actions]) => (
                            <div key={section} className="flex flex-col gap-1.5">
                              <span className="text-xs font-medium capitalize text-muted-foreground">
                                {section.replace(/_/g, ' ')}
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {actions.sort().map((action) => (
                                  <Badge
                                    key={action}
                                    variant="secondary"
                                    appearance="light"
                                    size="sm"
                                  >
                                    {action}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Users with this role */}
                <Card className="rounded-md">
                  <CardHeader className="min-h-[34px] bg-accent/50">
                    <CardTitle className="text-2sm flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      Users ({roleUsers.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingUsers ? (
                      <div className="flex items-center justify-center py-4">
                        <span className="text-sm text-muted-foreground">
                          Loading...
                        </span>
                      </div>
                    ) : roleUsers.length === 0 ? (
                      <div className="flex items-center justify-center py-4">
                        <span className="text-sm text-muted-foreground">
                          No users assigned to this role
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {roleUsers.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center gap-2.5 py-1.5"
                          >
                            <div className="flex items-center justify-center rounded-full bg-accent/50 h-[32px] w-[32px] shrink-0">
                              <span className="text-xs font-medium text-muted-foreground">
                                {user.firstName?.[0]}
                                {user.lastName?.[0]}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {user.firstName} {user.lastName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {user.email}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </SheetBody>
        </SheetContent>
      </Sheet>

      {/* Edit Role Sheet */}
      <RoleFormSheet
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        role={role}
      />
    </>
  );
}
