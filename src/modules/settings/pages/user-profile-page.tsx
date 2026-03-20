import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  IdCard,
  Calendar,
  Pencil,
  Save,
  X,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { useAuthStore } from '@/shared/stores/auth-store';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { formatDate } from '@/shared/lib/helpers';
import { usersService } from '@/modules/settings/services/users.service';
import { toast } from 'sonner';
import { UpdateInventoryUserDto } from '@/modules/settings/types/user';

export function UserProfilePage() {
  useDocumentTitle('My Profile');
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<UpdateInventoryUserDto>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    position: user?.position || '',
    department: user?.department || '',
    employeeId: user?.employeeId || '',
    avatarUrl: user?.avatarUrl || '',
  });

  if (!user) {
    return (
      <div className="container-fluid space-y-5">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Please login to view your profile</p>
            <Button className="mt-4" onClick={() => navigate('/auth/login')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fullName = `${user.firstName} ${user.lastName}`.trim();

  const handleEdit = () => {
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      position: user.position || '',
      department: user.department || '',
      employeeId: user.employeeId || '',
      avatarUrl: user.avatarUrl || '',
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      position: user.position || '',
      department: user.department || '',
      employeeId: user.employeeId || '',
      avatarUrl: user.avatarUrl || '',
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedUser = await usersService.update(user.id, formData);
      setUser({ ...user, ...updatedUser });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof UpdateInventoryUserDto, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'destructive' | 'secondary' => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'SUSPENDED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center rounded-full bg-accent h-16 w-16">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={fullName}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <User className="size-8 text-muted-foreground" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{fullName}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="size-3" />
              {user.email}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={getStatusBadgeVariant(user.status)}
            appearance="light"
            className="rounded-full"
          >
            {user.status}
          </Badge>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Pencil className="size-4 mr-1" />
              Edit Profile
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
                <X className="size-4 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                <Save className="size-4 mr-1" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="size-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    placeholder="Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatarUrl">Avatar URL</Label>
                  <Input
                    id="avatarUrl"
                    type="url"
                    value={formData.avatarUrl}
                    onChange={(e) => handleChange('avatarUrl', e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">First Name</span>
                  <span className="text-sm font-medium">{user.firstName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last Name</span>
                  <span className="text-sm font-medium">{user.lastName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="text-sm font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Phone</span>
                  <span className="text-sm font-medium flex items-center gap-1">
                    {user.phone ? (
                      <>
                        <Phone className="size-3" />
                        {user.phone}
                      </>
                    ) : (
                      'N/A'
                    )}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Work Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="size-5" />
              Work Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleChange('position', e.target.value)}
                    placeholder="Manager"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    placeholder="Sales"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Position</span>
                  <span className="text-sm font-medium flex items-center gap-1">
                    {user.position ? (
                      <>
                        <Briefcase className="size-3" />
                        {user.position}
                      </>
                    ) : (
                      'N/A'
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Department</span>
                  <span className="text-sm font-medium flex items-center gap-1">
                    {user.department ? (
                      <>
                        <Building2 className="size-3" />
                        {user.department}
                      </>
                    ) : (
                      'N/A'
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge
                    variant={getStatusBadgeVariant(user.status)}
                    appearance="light"
                    size="sm"
                  >
                    {user.status}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="size-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">User ID</span>
              <span className="text-sm font-medium font-mono">{user.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Created</span>
              <span className="text-sm font-medium">
                {formatDate(new Date(user.createdAt))}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Last Login</span>
              <span className="text-sm font-medium">
                {user.lastLoginAt ? formatDate(new Date(user.lastLoginAt)) : 'Never'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
