export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
}

export interface InventoryUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  position?: string | null;
  department?: string | null;
  employeeId?: string | null;
  avatarUrl?: string | null;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
}

export interface CreateInventoryUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  position?: string;
  department?: string;
  employeeId?: string;
  avatarUrl?: string;
}

export interface UpdateInventoryUserDto {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  position?: string;
  department?: string;
  employeeId?: string;
  avatarUrl?: string;
  status?: UserStatus;
}

export interface Role {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface AssignRoleDto {
  userId: string;
  roleId: string;
  expiresAt?: string;
}

export interface RemoveRoleDto {
  userId: string;
  roleId: string;
}

export interface UserRole {
  userId: string;
  roleId: string;
  assignedAt: string;
  expiresAt?: string | null;
  role: Role;
}
