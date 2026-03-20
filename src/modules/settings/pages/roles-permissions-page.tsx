import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { useRoles } from '../hooks/use-roles';
import { usePermissions } from '../hooks/use-permissions';
import { RolesListTable } from '../components/roles-list-table';
import { PermissionsListTable } from '../components/permissions-list-table';
import { RoleFormSheet } from '../components/role-form-sheet';
import { RoleDetailsSheet } from '../components/role-details-sheet';
import type { Role } from '../types';

export function RolesPermissionsPage() {
  useDocumentTitle('Roles & Permissions');

  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [isViewRoleOpen, setIsViewRoleOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | undefined>(undefined);

  const {
    data: roles = [],
    isLoading: isLoadingRoles,
    error: rolesError,
  } = useRoles(true);
  const {
    data: permissions = [],
    isLoading: isLoadingPermissions,
    error: permissionsError,
  } = usePermissions();

  const handleViewRole = (role: Role) => {
    setSelectedRole(role);
    setIsViewRoleOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setIsEditRoleOpen(true);
  };

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-xl font-semibold text-foreground">
            Roles & Permissions
          </h3>
          <span className="text-sm text-muted-foreground">
            Manage roles and their permissions for user access control.
          </span>
        </div>

        <Button variant="mono" onClick={() => setIsCreateRoleOpen(true)}>
          <PlusIcon />
          Add Role
        </Button>
      </div>

      <Tabs defaultValue="roles">
        <TabsList>
          <TabsTrigger value="roles">
            Roles ({roles.length})
          </TabsTrigger>
          <TabsTrigger value="permissions">
            Permissions ({permissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="mt-5">
          <RolesListTable
            roles={roles}
            isLoading={isLoadingRoles}
            error={rolesError?.message || null}
            onViewRole={handleViewRole}
            onEditRole={handleEditRole}
          />
        </TabsContent>

        <TabsContent value="permissions" className="mt-5">
          <PermissionsListTable
            permissions={permissions}
            isLoading={isLoadingPermissions}
            error={permissionsError?.message || null}
          />
        </TabsContent>
      </Tabs>

      {/* Create Role Sheet */}
      <RoleFormSheet
        mode="new"
        open={isCreateRoleOpen}
        onOpenChange={setIsCreateRoleOpen}
      />

      {/* Edit Role Sheet */}
      <RoleFormSheet
        mode="edit"
        open={isEditRoleOpen}
        onOpenChange={setIsEditRoleOpen}
        role={selectedRole}
      />

      {/* View Role Details Sheet */}
      <RoleDetailsSheet
        open={isViewRoleOpen}
        onOpenChange={setIsViewRoleOpen}
        role={selectedRole}
      />
    </div>
  );
}
