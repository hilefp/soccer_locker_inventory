import { Badge } from '@/shared/components/ui/badge';
import {
  EmailCampaignRecipientStatus,
  EmailCampaignStatus,
} from '@/modules/shop/types/email-campaign.type';

type BadgeVariant = 'success' | 'warning' | 'destructive' | 'secondary' | 'info';

const CAMPAIGN_STATUS: Record<EmailCampaignStatus, { label: string; variant: BadgeVariant }> = {
  SENDING: { label: 'Sending', variant: 'info' },
  COMPLETED: { label: 'Sent', variant: 'success' },
  COMPLETED_WITH_ERRORS: { label: 'Sent with errors', variant: 'warning' },
  FAILED: { label: 'Failed', variant: 'destructive' },
};

const RECIPIENT_STATUS: Record<
  EmailCampaignRecipientStatus,
  { label: string; variant: BadgeVariant }
> = {
  PENDING: { label: 'Queued', variant: 'secondary' },
  SENDING: { label: 'Sending', variant: 'info' },
  SENT: { label: 'Sent', variant: 'success' },
  FAILED: { label: 'Failed', variant: 'destructive' },
};

export function EmailCampaignStatusBadge({ status }: { status: EmailCampaignStatus }) {
  const { label, variant } = CAMPAIGN_STATUS[status];
  return (
    <Badge variant={variant} appearance="light" className="rounded-full">
      {label}
    </Badge>
  );
}

export function EmailRecipientStatusBadge({ status }: { status: EmailCampaignRecipientStatus }) {
  const { label, variant } = RECIPIENT_STATUS[status];
  return (
    <Badge variant={variant} appearance="light" className="rounded-full">
      {label}
    </Badge>
  );
}
