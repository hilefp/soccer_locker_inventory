export type EmailCampaignStatus =
  | 'SENDING'
  | 'COMPLETED'
  | 'COMPLETED_WITH_ERRORS'
  | 'FAILED';

export type EmailCampaignRecipientStatus = 'PENDING' | 'SENDING' | 'SENT' | 'FAILED';

export interface EmailCampaignCounts {
  /** Includes recipients currently being sent. */
  pending: number;
  sent: number;
  failed: number;
}

export interface EmailCampaign {
  id: string;
  subject: string;
  status: EmailCampaignStatus;
  attachmentFilename: string | null;
  attachmentContentType: string | null;
  attachmentSize: number | null;
  totalRecipients: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  createdBy: { id: string; email: string } | null;
  counts: EmailCampaignCounts;
}

export interface EmailCampaignDetail extends EmailCampaign {
  bodyHtml: string;
}

export interface EmailCampaignRecipient {
  id: string;
  email: string;
  firstName: string | null;
  status: EmailCampaignRecipientStatus;
  attempts: number;
  error: string | null;
  sentAt: string | null;
  userId: string | null;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface EmailCampaignInput {
  subject: string;
  /** HTML from the rich text editor */
  message: string;
  file?: File | null;
}

export interface EmailCampaignRecipientParams {
  page?: number;
  limit?: number;
  status?: EmailCampaignRecipientStatus;
  search?: string;
}

export const CAMPAIGN_ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024;
export const CAMPAIGN_ATTACHMENT_ACCEPT = '.pdf,.jpg,.jpeg,.png,.gif';
export const CAMPAIGN_ATTACHMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
];
