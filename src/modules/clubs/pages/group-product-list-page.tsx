import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  Package,
  Plus,
  Pencil,
  Trash2,
  Star,
  Building2,
  Group,
} from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useClub } from '../hooks/use-clubs';
import { useClubProductGroups } from '../hooks/use-club-products';
import { DeleteGroupDialog } from '../components/delete-group-dialog';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';

export function GroupProductListPage() {
  useDocumentTitle('Group Products');
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();

  const { data: club, isLoading: clubLoading } = useClub(clubId);
  const { data: groups = [], isLoading: groupsLoading } = useClubProductGroups(clubId);

  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);
  const [deleteGroupName, setDeleteGroupName] = useState('');

  const isLoading = clubLoading || groupsLoading;

  const handleDelete = (groupId: string, name: string) => {
    setDeleteGroupId(groupId);
    setDeleteGroupName(name);
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Building2 className="size-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Club not found</h2>
          <Button onClick={() => navigate('/clubs')}>Back to Clubs</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/clubs/${clubId}`)}
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to Club
          </Button>
          <div className="flex items-center gap-3">
            {club.logoUrl && (
              <div className="flex items-center justify-center rounded-md bg-accent/50 h-[40px] w-[50px]">
                <img
                  src={club.logoUrl}
                  alt={club.name}
                  className="h-[30px] w-full object-contain"
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">Group Products</h1>
              <p className="text-sm text-muted-foreground">{club.name}</p>
            </div>
          </div>
        </div>
        <Button
          variant="mono"
          onClick={() => navigate(`/clubs/${clubId}/groups/create`)}
        >
          <Plus className="size-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* Group List */}
      {groups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <Group className="size-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">No group products yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Group multiple product variants together so they appear as a single listing in the shop.
              </p>
            </div>
            <Button
              variant="mono"
              onClick={() => navigate(`/clubs/${clubId}/groups/create`)}
            >
              <Plus className="size-4 mr-2" />
              Create Your First Group
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => {
            const primary = group.primary;
            const displayName = group.packageName || primary?.name || primary?.product?.name || 'Unnamed Group';
            const imageUrl =
              primary?.imageUrls?.[0] || primary?.product?.imageUrl || primary?.product?.imageUrls?.[0];
            const memberCount = group.memberCount ?? group.members?.length ?? 0;
            const isActive = primary?.isActive !== false;
            const groupPrice = group.packagePrice;

            return (
              <Card
                key={group.groupId}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  {/* Image */}
                  <div className="flex items-center justify-center bg-accent/30 h-[160px]">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={displayName}
                        className="h-full w-full object-contain p-4"
                      />
                    ) : (
                      <Package className="size-12 text-muted-foreground" />
                    )}
                  </div>
                  {/* Status badge */}
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant={isActive ? 'success' : 'secondary'}
                      appearance="light"
                      className="text-xs"
                    >
                      {isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  {/* Group name */}
                  <div>
                    <h3 className="font-semibold text-base line-clamp-1">{displayName}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {memberCount} product{memberCount !== 1 ? 's' : ''} in group
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground">Group Price</span>
                      <p className="text-lg font-bold text-foreground">
                        {formatCurrency(groupPrice)}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {group.packageDescription && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {group.packageDescription}
                    </p>
                  )}

                  {/* Member thumbnails */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {group.members?.slice(0, 5).map((member) => {
                      const memberImg =
                        member.imageUrls?.[0] || member.product?.imageUrl || member.product?.imageUrls?.[0];
                      const isPrimary = member.isGroupPrimary;
                      return (
                        <div
                          key={member.id}
                          className={`flex items-center justify-center rounded-md bg-accent/50 h-[32px] w-[38px] shrink-0 ${
                            isPrimary ? 'ring-2 ring-primary ring-offset-1' : ''
                          }`}
                          title={member.name || member.product?.name}
                        >
                          {memberImg ? (
                            <img
                              src={memberImg}
                              className="h-[24px] w-full object-contain"
                              alt={member.name || member.product?.name}
                            />
                          ) : (
                            <Package className="size-3.5 text-muted-foreground" />
                          )}
                          {isPrimary && (
                            <Star className="size-2.5 text-primary absolute -top-1 -right-1" />
                          )}
                        </div>
                      );
                    })}
                    {memberCount > 5 && (
                      <span className="text-xs text-muted-foreground">
                        +{memberCount - 5} more
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/clubs/${clubId}/groups/${group.groupId}/edit`)}
                    >
                      <Pencil className="size-3.5 mr-1.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(group.groupId, displayName)}
                    >
                      <Trash2 className="size-3.5 mr-1.5" />
                      Dissolve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteGroupDialog
        clubId={clubId!}
        groupId={deleteGroupId}
        groupName={deleteGroupName}
        open={!!deleteGroupId}
        onOpenChange={(open) => {
          if (!open) setDeleteGroupId(null);
        }}
      />
    </div>
  );
}
