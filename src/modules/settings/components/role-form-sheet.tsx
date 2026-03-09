import { useEffect, useMemo, useState } from 'react';
import { useCreateRole, useUpdateRole } from '../hooks/use-roles';
import {
  usePermissions,
  useRolePermissions,
  useSetRolePermissions,
} from '../hooks/use-permissions';
import type { Permission, Role } from '../types';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { Separator } from '@/shared/components/ui/separator';
import { toast } from 'sonner';

interface RoleFormSheetProps {
  mode: 'new' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role;
  onSuccess?: () => void;
}

export function RoleFormSheet({
  mode,
  open,
  onOpenChange,
  role,
  onSuccess,
}: RoleFormSheetProps) {
  const isNewMode = mode === 'new';
  const isEditMode = mode === 'edit';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(
    new Set(),
  );

  const { data: allPermissions = [] } = usePermissions();
  const { data: rolePermissions = [], isLoading: isLoadingRolePermissions } =
    useRolePermissions(isEditMode && role ? role.id : undefined);

  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const setPermissionsMutation = useSetRolePermissions();

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    setPermissionsMutation.isPending;

  // Group permissions by section
  const permissionsBySection = useMemo(() => {
    const grouped: Record<string, Permission[]> = {};
    for (const perm of allPermissions) {
      if (!grouped[perm.section]) {
        grouped[perm.section] = [];
      }
      grouped[perm.section].push(perm);
    }
    return grouped;
  }, [allPermissions]);

  // Load role data when editing
  useEffect(() => {
    if (!open) return;

    if (isEditMode && role) {
      setName(role.name);
      setDescription(role.description || '');
    }
  }, [isEditMode, role, open]);

  // Load role permissions when editing
  useEffect(() => {
    if (isEditMode && rolePermissions.length > 0) {
      setSelectedPermissionIds(
        new Set(rolePermissions.map((rp) => rp.permissionId)),
      );
    }
  }, [isEditMode, rolePermissions]);

  // Reset form when closed
  useEffect(() => {
    if (!open) {
      setName('');
      setDescription('');
      setSelectedPermissionIds(new Set());
    }
  }, [open]);

  const togglePermission = (permissionId: string) => {
    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }
      return next;
    });
  };

  const toggleSection = (section: string) => {
    const sectionPerms = permissionsBySection[section] || [];
    const allSelected = sectionPerms.every((p) =>
      selectedPermissionIds.has(p.id),
    );

    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      for (const perm of sectionPerms) {
        if (allSelected) {
          next.delete(perm.id);
        } else {
          next.add(perm.id);
        }
      }
      return next;
    });
  };

  const isSectionFullySelected = (section: string) => {
    const sectionPerms = permissionsBySection[section] || [];
    return (
      sectionPerms.length > 0 &&
      sectionPerms.every((p) => selectedPermissionIds.has(p.id))
    );
  };

  const isSectionPartiallySelected = (section: string) => {
    const sectionPerms = permissionsBySection[section] || [];
    const selectedCount = sectionPerms.filter((p) =>
      selectedPermissionIds.has(p.id),
    ).length;
    return selectedCount > 0 && selectedCount < sectionPerms.length;
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Role name is required');
      return;
    }

    try {
      let roleId = role?.id;

      if (isNewMode) {
        const created = await createMutation.mutateAsync({
          name: name.trim(),
          description: description.trim() || undefined,
        });
        roleId = created.id;
        toast.success('Role created successfully');
      } else if (isEditMode && roleId) {
        await updateMutation.mutateAsync({
          id: roleId,
          data: {
            name: name.trim(),
            description: description.trim() || undefined,
          },
        });
        toast.success('Role updated successfully');
      }

      // Set permissions for the role
      if (roleId) {
        await setPermissionsMutation.mutateAsync({
          roleId,
          data: { permissionIds: Array.from(selectedPermissionIds) },
        });
      }

      onSuccess?.();
      onOpenChange(false);
    } catch {
      toast.error(
        isNewMode ? 'Failed to create role' : 'Failed to update role',
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 w-[500px] p-0 inset-5 border start-auto h-auto rounded-lg [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b py-4 px-6">
          <SheetTitle className="font-medium">
            {isNewMode ? 'Create Role' : 'Edit Role'}
          </SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0 grow pt-5">
          <ScrollArea
            className="h-[calc(100dvh-14rem)] mx-1.5 px-3.5 grow"
            viewportClassName="[&>div]:h-full [&>div>div]:h-full"
          >
            <div className="space-y-6">
              {/* Role Name */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Name *</Label>
                <Input
                  placeholder="e.g. INVENTORY_MANAGER"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Description</Label>
                <Input
                  placeholder="Brief description of this role"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <Separator />

              {/* Permissions Matrix */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Permissions</Label>
                <p className="text-xs text-muted-foreground">
                  Select the permissions this role should have.
                </p>

                {isLoadingRolePermissions && isEditMode ? (
                  <div className="flex items-center justify-center py-6">
                    <span className="text-sm text-muted-foreground">
                      Loading permissions...
                    </span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(permissionsBySection)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([section, perms]) => (
                        <div
                          key={section}
                          className="rounded-md border border-border p-3 space-y-3"
                        >
                          {/* Section header with select all */}
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={
                                isSectionFullySelected(section)
                                  ? true
                                  : isSectionPartiallySelected(section)
                                    ? 'indeterminate'
                                    : false
                              }
                              onCheckedChange={() => toggleSection(section)}
                              disabled={isLoading}
                            />
                            <span className="text-sm font-medium capitalize">
                              {section.replace(/_/g, ' ')}
                            </span>
                          </div>

                          {/* Individual permissions */}
                          <div className="grid grid-cols-2 gap-2 pl-6">
                            {perms
                              .sort((a, b) => a.action.localeCompare(b.action))
                              .map((perm) => (
                                <div
                                  key={perm.id}
                                  className="flex items-center gap-2"
                                >
                                  <Checkbox
                                    checked={selectedPermissionIds.has(perm.id)}
                                    onCheckedChange={() =>
                                      togglePermission(perm.id)
                                    }
                                    disabled={isLoading}
                                  />
                                  <span className="text-xs capitalize">
                                    {perm.action}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {allPermissions.length === 0 && !isLoadingRolePermissions && (
                  <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                    No permissions available
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </SheetBody>

        <SheetFooter className="border-t p-5">
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-muted-foreground">
              {selectedPermissionIds.size} permission
              {selectedPermissionIds.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button variant="mono" onClick={handleSave} disabled={isLoading}>
                {isLoading
                  ? 'Saving...'
                  : isNewMode
                    ? 'Create Role'
                    : 'Save Changes'}
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
