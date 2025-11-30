'use client';

import { useEffect, useState } from 'react';
import {
  useCreateInventoryUser,
  useDeleteInventoryUser,
  useInventoryUser,
  useInventoryUsers,
  useUpdateInventoryUser,
} from '../hooks/use-inventory-users';
import { UserStatus } from '../types';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { toast } from 'sonner';
import { ImageIcon, X, UserCircle } from 'lucide-react';

function UserAvatarUpload({
  avatarUrl,
  onAvatarChange,
}: {
  avatarUrl: string | null;
  onAvatarChange: (url: string | null) => void;
}) {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(avatarUrl);

  useEffect(() => {
    setSelectedAvatar(avatarUrl);
  }, [avatarUrl]);

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedAvatar(result);
        onAvatarChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="w-[120px] h-[120px] mx-auto bg-accent/50 border border-border rounded-full flex items-center justify-center">
          {selectedAvatar ? (
            <div className="relative flex items-center justify-center w-full h-full">
              <img
                src={selectedAvatar}
                alt="Avatar"
                className="w-full h-full object-cover rounded-full"
              />
              <Button
                variant="outline"
                size="icon"
                className="absolute top-0 right-0 size-6 rounded-full"
                onClick={() => {
                  setSelectedAvatar(null);
                  onAvatarChange(null);
                }}
              >
                <X className="size-3" />
              </Button>
            </div>
          ) : (
            <UserCircle className="size-[60px] text-muted-foreground" />
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          className="hidden"
          id="user-avatar-upload"
        />
        <label htmlFor="user-avatar-upload" className="block mt-3 text-center">
          <Button size="sm" variant="outline" asChild>
            <span>{selectedAvatar ? 'Change Avatar' : 'Upload Avatar'}</span>
          </Button>
        </label>
      </div>
    </div>
  );
}

export function UserFormSheet({
  mode,
  open,
  onOpenChange,
  userId,
  onSuccess,
}: {
  mode: 'new' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
  onSuccess?: () => void;
}) {
  const isNewMode = mode === 'new';
  const isEditMode = mode === 'edit';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<UserStatus>(UserStatus.ACTIVE);

  // React Query hooks
  const { data: user, isLoading: isFetchingUser } = useInventoryUser(
    isEditMode ? userId : undefined,
  );
  const createMutation = useCreateInventoryUser();
  const updateMutation = useUpdateInventoryUser();
  const deleteMutation = useDeleteInventoryUser();

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  // Load user data when editing
  useEffect(() => {
    if (!isEditMode || !userId || !open || !user) {
      return;
    }

    setEmail(user.email);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setPhone(user.phone || '');
    setPosition(user.position || '');
    setDepartment(user.department || '');
    setEmployeeId(user.employeeId || '');
    setAvatarUrl(user.avatarUrl || null);
    setStatus(user.status);
  }, [isEditMode, userId, open, user]);

  // Reset form when closed
  useEffect(() => {
    if (!open) {
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setPhone('');
      setPosition('');
      setDepartment('');
      setEmployeeId('');
      setAvatarUrl(null);
      setStatus(UserStatus.ACTIVE);
    }
  }, [open]);

  const handleSave = async () => {
    if (!email.trim() || !firstName.trim() || !lastName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isNewMode && !password.trim()) {
      toast.error('Password is required');
      return;
    }

    if (isNewMode && password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    const userData = {
      email: email.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim() || undefined,
      position: position.trim() || undefined,
      department: department.trim() || undefined,
      employeeId: employeeId.trim() || undefined,
      avatarUrl: avatarUrl || undefined,
      status,
      ...(isNewMode && { password }),
    };

    try {
      if (isNewMode) {
        await createMutation.mutateAsync(userData);
        toast.success('User created successfully');
      } else if (userId) {
        await updateMutation.mutateAsync({
          id: userId,
          data: userData,
        });
        toast.success('User updated successfully');
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(
        isNewMode ? 'Failed to create user' : 'Failed to update user',
      );
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
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 w-[500px] p-0 inset-5 border start-auto h-auto rounded-lg [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b py-4 px-6">
          <SheetTitle className="font-medium">
            {isNewMode ? 'Add User' : 'Edit User'}
          </SheetTitle>
        </SheetHeader>

        <SheetBody className="p-0 grow pt-5">
          <ScrollArea
            className="h-[calc(100dvh-14rem)] mx-1.5 px-3.5 grow"
            viewportClassName="[&>div]:h-full [&>div>div]:h-full"
          >
            <div className="space-y-6">
              {/* Avatar Upload */}
              <UserAvatarUpload
                avatarUrl={avatarUrl}
                onAvatarChange={setAvatarUrl}
              />

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Email *</Label>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || isFetchingUser}
                />
              </div>

              {/* Password (only for new users) */}
              {isNewMode && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Password *</Label>
                  <Input
                    type="password"
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <span className="text-xs text-muted-foreground">
                    Minimum 8 characters
                  </span>
                </div>
              )}

              {/* First Name */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">First Name *</Label>
                <Input
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isLoading || isFetchingUser}
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Last Name *</Label>
                <Input
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoading || isFetchingUser}
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Phone</Label>
                <Input
                  type="tel"
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading || isFetchingUser}
                />
              </div>

              {/* Position */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Position</Label>
                <Input
                  placeholder="Warehouse Manager"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  disabled={isLoading || isFetchingUser}
                />
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Department</Label>
                <Input
                  placeholder="Logistics"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={isLoading || isFetchingUser}
                />
              </div>

              {/* Employee ID */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Employee ID</Label>
                <Input
                  placeholder="EMP-001"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  disabled={isLoading || isFetchingUser}
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Status</Label>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as UserStatus)}
                  disabled={isLoading || isFetchingUser}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserStatus.ACTIVE}>Active</SelectItem>
                    <SelectItem value={UserStatus.INACTIVE}>
                      Inactive
                    </SelectItem>
                    <SelectItem value={UserStatus.PENDING}>Pending</SelectItem>
                    <SelectItem value={UserStatus.SUSPENDED}>
                      Suspended
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ScrollArea>
        </SheetBody>

        <SheetFooter className="border-t p-5">
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
              Close
            </Button>
            {isEditMode && (
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={isLoading || isFetchingUser}
              >
                Delete
              </Button>
            )}
            <Button
              variant="mono"
              onClick={handleSave}
              disabled={isLoading || isFetchingUser}
            >
              {isLoading
                ? 'Saving...'
                : isFetchingUser
                  ? 'Loading...'
                  : isNewMode
                    ? 'Create'
                    : 'Save'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
