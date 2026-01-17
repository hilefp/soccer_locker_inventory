'use client';

import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  FileText,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Ban,
  Clock,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useCustomer, useActivateCustomer, useDeactivateCustomer, useSuspendCustomer } from '@/modules/shop/hooks/use-customers';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { formatDate } from '@/shared/lib/helpers';
import { CustomerStatus } from '@/modules/shop/types/customer.type';

const getStatusBadgeVariant = (status: CustomerStatus): 'success' | 'warning' | 'destructive' | 'secondary' => {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'INACTIVE':
      return 'secondary';
    case 'SUSPENDED':
      return 'destructive';
    case 'PENDING_VERIFICATION':
      return 'warning';
    default:
      return 'secondary';
  }
};

const getStatusLabel = (status: CustomerStatus): string => {
  switch (status) {
    case 'ACTIVE':
      return 'Active';
    case 'INACTIVE':
      return 'Inactive';
    case 'SUSPENDED':
      return 'Suspended';
    case 'PENDING_VERIFICATION':
      return 'Pending Verification';
    default:
      return status;
  }
};

export function CustomerDetailPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();

  const { data: customer, isLoading, error } = useCustomer(customerId || '');
  const activateMutation = useActivateCustomer();
  const deactivateMutation = useDeactivateCustomer();
  const suspendMutation = useSuspendCustomer();

  useDocumentTitle(
    customer?.customerProfile
      ? `${customer.customerProfile.firstName} ${customer.customerProfile.lastName} - Customer`
      : 'Customer Details'
  );

  if (isLoading) {
    return (
      <div className="container-fluid space-y-5 lg:space-y-9">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="container-fluid space-y-5">
        <Button variant="ghost" onClick={() => navigate('/shop/customers')}>
          <ArrowLeft className="size-4 mr-2" />
          Back to Customers
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              {error ? `Error loading customer: ${error.message}` : 'Customer not found'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profile = customer.customerProfile;
  const fullName = profile
    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
    : 'N/A';

  const handleActivate = () => {
    if (customerId) {
      activateMutation.mutate(customerId);
    }
  };

  const handleDeactivate = () => {
    if (customerId) {
      deactivateMutation.mutate(customerId);
    }
  };

  const handleSuspend = () => {
    if (customerId) {
      suspendMutation.mutate(customerId);
    }
  };

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/shop/customers')}>
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-full bg-accent h-12 w-12">
              {customer.avatarUrl ? (
                <img
                  src={customer.avatarUrl}
                  alt={fullName}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <User className="size-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{fullName}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-3" />
                {customer.email}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={getStatusBadgeVariant(customer.status)}
            appearance="light"
            className="rounded-full"
          >
            {getStatusLabel(customer.status)}
          </Badge>
          {customer.status !== 'ACTIVE' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleActivate}
              disabled={activateMutation.isPending}
            >
              <UserCheck className="size-4 mr-1" />
              Activate
            </Button>
          )}
          {customer.status !== 'INACTIVE' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeactivate}
              disabled={deactivateMutation.isPending}
            >
              <UserX className="size-4 mr-1" />
              Deactivate
            </Button>
          )}
          {customer.status !== 'SUSPENDED' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleSuspend}
              disabled={suspendMutation.isPending}
            >
              <Ban className="size-4 mr-1" />
              Suspend
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="size-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-medium">{customer.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Email Verified</span>
              <span className="flex items-center gap-1">
                {customer.emailVerified ? (
                  <>
                    <CheckCircle className="size-4 text-green-500" />
                    <span className="text-sm text-green-600">Verified</span>
                  </>
                ) : (
                  <>
                    <XCircle className="size-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Not Verified</span>
                  </>
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge
                variant={getStatusBadgeVariant(customer.status)}
                appearance="light"
                size="sm"
              >
                {getStatusLabel(customer.status)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Last Login</span>
              <span className="text-sm font-medium flex items-center gap-1">
                <Clock className="size-3" />
                {customer.lastLoginAt ? formatDate(new Date(customer.lastLoginAt)) : 'Never'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Created</span>
              <span className="text-sm font-medium flex items-center gap-1">
                <Calendar className="size-3" />
                {formatDate(new Date(customer.createdAt))}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="size-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Full Name</span>
              <span className="text-sm font-medium">{fullName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Phone</span>
              <span className="text-sm font-medium flex items-center gap-1">
                {profile?.phone ? (
                  <>
                    <Phone className="size-3" />
                    {profile.phone}
                  </>
                ) : (
                  'N/A'
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Birth Date</span>
              <span className="text-sm font-medium">
                {profile?.birthDate ? formatDate(new Date(profile.birthDate)) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Newsletter</span>
              <Badge
                variant={profile?.newsletter ? 'success' : 'secondary'}
                appearance="outline"
                size="sm"
              >
                {profile?.newsletter ? 'Subscribed' : 'Not subscribed'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="size-5" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Street Address</span>
              <span className="text-sm font-medium">{profile?.address || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">City</span>
              <span className="text-sm font-medium">{profile?.city || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">State</span>
              <span className="text-sm font-medium">{profile?.state || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Country</span>
              <span className="text-sm font-medium">{profile?.country || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Postal Code</span>
              <span className="text-sm font-medium">{profile?.postalCode || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="size-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Company Name</span>
              <span className="text-sm font-medium">{profile?.companyName || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tax ID</span>
              <span className="text-sm font-medium">{profile?.taxId || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roles */}
      {customer.userRoles && customer.userRoles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {customer.userRoles.map((userRole) => (
                <Badge key={userRole.id} variant="outline" className="rounded-full">
                  {userRole.role.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
