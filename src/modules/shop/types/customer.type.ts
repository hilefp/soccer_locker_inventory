export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export interface CustomerProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  taxId?: string;
  companyName?: string;
  newsletter: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerRole {
  id: string;
  name: string;
  description?: string;
}

export interface CustomerUserRole {
  id: string;
  userId: string;
  roleId: string;
  role: CustomerRole;
}

export interface Customer {
  id: string;
  email: string;
  status: CustomerStatus;
  emailVerified: boolean;
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  customerProfile?: CustomerProfile;
  userRoles?: CustomerUserRole[];
}

export interface CustomerListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CustomerListResponse {
  data: Customer[];
  meta: CustomerListMeta;
}

export type CustomerSortBy = 'email' | 'firstName' | 'lastName' | 'createdAt' | 'lastLoginAt';
export type SortOrder = 'asc' | 'desc';

export interface CustomerFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CustomerStatus;
  emailVerified?: boolean;
  newsletter?: boolean;
  city?: string;
  state?: string;
  country?: string;
  createdFrom?: string;
  createdTo?: string;
  sortBy?: CustomerSortBy;
  sortOrder?: SortOrder;
}
