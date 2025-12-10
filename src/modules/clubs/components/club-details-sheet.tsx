'use client';

import { useState } from 'react';
import { useClub, useDeleteClub } from '../hooks/use-clubs';
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
import { ImageIcon } from 'lucide-react';
import { ClubFormSheet } from './club-form-sheet';

interface ClubDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clubId?: string;
}

export function ClubDetailsSheet({
  open,
  onOpenChange,
  clubId,
}: ClubDetailsSheetProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: club, isLoading } = useClub(clubId);
  const deleteMutation = useDeleteClub();

  const handleDelete = async () => {
    if (!clubId) return;

    if (!confirm('Are you sure you want to delete this club?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(clubId);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting club:', error);
    }
  };

  const handleEdit = () => {
    setIsEditOpen(true);
  };

  if (!club && !isLoading) {
    return null;
  }

  const statusVariant: 'primary' | 'destructive' | 'secondary' | 'outline' | 'success' | 'warning' | 'info' = club?.isActive
    ? 'success'
    : 'secondary';

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="gap-0 lg:w-[900px] sm:max-w-none inset-5 border start-auto h-auto rounded-lg p-0 [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
          <SheetHeader className="border-b py-3.5 px-5 border-border">
            <SheetTitle className="font-medium">Club Details</SheetTitle>
          </SheetHeader>

          <SheetBody className="p-0 grow">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <span className="text-muted-foreground">
                  Loading club details...
                </span>
              </div>
            ) : club ? (
              <>
                {/* Header Section */}
                <div className="flex justify-between flex-wrap gap-2 border-b border-border px-5 py-4">
                  <div className="flex gap-4 items-center">
                    <div className="flex items-center justify-center rounded-md bg-accent/50 h-[60px] w-[60px] shrink-0 border">
                      {club.logoUrl ? (
                        <img
                          src={club.logoUrl}
                          className="h-[50px] object-contain"
                          alt={club.name}
                        />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="lg:text-[22px] font-semibold text-foreground leading-none">
                          {club.name}
                        </span>
                        <Badge
                          size="sm"
                          variant={statusVariant}
                          appearance="light"
                        >
                          {club.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center flex-wrap gap-2 text-2sm">
                        {club.city && club.country && (
                          <>
                            <span className="font-normal text-muted-foreground">
                              Location
                            </span>
                            <span className="font-medium text-foreground">
                              {club.city}, {club.country}
                            </span>
                            <BadgeDot className="bg-muted-foreground size-1" />
                          </>
                        )}
                        <span className="font-normal text-muted-foreground">
                          Created
                        </span>
                        <span className="font-medium text-foreground">
                          {new Date(club.createdAt).toLocaleDateString()}
                        </span>
                        <BadgeDot className="bg-muted-foreground size-1" />
                        <span className="font-normal text-muted-foreground">
                          Last Updated
                        </span>
                        <span className="font-medium text-foreground">
                          {new Date(club.updatedAt).toLocaleDateString()}
                        </span>
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
                      Edit Club
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
                      {/* Description */}
                      {club.description && (
                        <Card className="rounded-md">
                          <CardHeader className="min-h-[34px] bg-accent/50">
                            <CardTitle className="text-2sm">Description</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-foreground whitespace-pre-wrap">
                              {club.description}
                            </p>
                          </CardContent>
                        </Card>
                      )}

                      {/* Contact Information */}
                      {(club.email || club.phone || club.websiteUrl) && (
                        <Card className="rounded-md">
                          <CardHeader className="min-h-[34px] bg-accent/50">
                            <CardTitle className="text-2sm">Contact Information</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {club.email && (
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground">Email</span>
                                <span className="text-sm font-medium">{club.email}</span>
                              </div>
                            )}
                            {club.phone && (
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground">Phone</span>
                                <span className="text-sm font-medium">{club.phone}</span>
                              </div>
                            )}
                            {club.websiteUrl && (
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground">Website</span>
                                <a
                                  href={club.websiteUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-medium text-primary hover:underline"
                                >
                                  {club.websiteUrl}
                                </a>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Address */}
                      {(club.address || club.city || club.state || club.country || club.postalCode) && (
                        <Card className="rounded-md">
                          <CardHeader className="min-h-[34px] bg-accent/50">
                            <CardTitle className="text-2sm">Address</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm space-y-1">
                              {club.address && <div>{club.address}</div>}
                              <div>
                                {[club.city, club.state, club.postalCode]
                                  .filter(Boolean)
                                  .join(', ')}
                              </div>
                              {club.country && <div>{club.country}</div>}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Person in Charge */}
                      {(club.personInCharge || club.personInChargeEmail || club.personInChargePhone) && (
                        <Card className="rounded-md">
                          <CardHeader className="min-h-[34px] bg-accent/50">
                            <CardTitle className="text-2sm">Person in Charge</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {club.personInCharge && (
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground">Name</span>
                                <span className="text-sm font-medium">{club.personInCharge}</span>
                              </div>
                            )}
                            {club.personInChargeEmail && (
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground">Email</span>
                                <span className="text-sm font-medium">{club.personInChargeEmail}</span>
                              </div>
                            )}
                            {club.personInChargePhone && (
                              <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground">Phone</span>
                                <span className="text-sm font-medium">{club.personInChargePhone}</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Club Logo */}
                      {club.logoUrl && (
                        <Card className="rounded-md">
                          <CardHeader className="min-h-[34px] bg-accent/50">
                            <CardTitle className="text-2sm">Club Logo</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-center p-6 bg-accent/20 rounded-md">
                              <img
                                src={club.logoUrl}
                                alt={club.name}
                                className="max-h-[200px] object-contain"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Right Column - Metadata */}
                    <div className="w-full shrink-0 lg:w-[300px] py-5 lg:ps-5 space-y-4">
                      <Card className="rounded-md">
                        <CardHeader className="min-h-[34px] bg-accent/50">
                          <CardTitle className="text-2sm">Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">
                              Club ID
                            </span>
                            <span className="text-sm font-medium font-mono">
                              {club.id}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">
                              Status
                            </span>
                            <div>
                              <Badge variant={statusVariant} appearance="light">
                                {club.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">
                              Created
                            </span>
                            <span className="text-sm font-medium">
                              {new Date(club.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">
                              Last Updated
                            </span>
                            <span className="text-sm font-medium">
                              {new Date(club.updatedAt).toLocaleString()}
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

      {/* Edit Club Sheet */}
      <ClubFormSheet
        mode="edit"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        clubId={clubId}
        onSuccess={() => {
          // Refetch will happen automatically via React Query
        }}
      />
    </>
  );
}
