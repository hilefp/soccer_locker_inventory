import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Download, Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTable,
  CardTitle,
  CardToolbar,
} from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { sanitizeRichText } from '@/shared/lib/sanitize-html';
import {
  useEmailCampaign,
  useEmailCampaignRecipients,
} from '@/modules/shop/hooks/use-email-campaigns';
import { emailCampaignService } from '@/modules/shop/services/email-campaign.service';
import {
  EmailCampaignStatusBadge,
  EmailRecipientStatusBadge,
} from '@/modules/shop/components/email-campaign-status-badge';
import { SimplePagination } from '@/modules/shop/components/simple-pagination';
import { formatBytes } from '@/modules/shop/components/email-campaign-dialog';
import { EmailCampaignRecipientStatus } from '@/modules/shop/types/email-campaign.type';

const PAGE_SIZE = 20;

function Stat({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <div className="rounded-md border border-border p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={`text-2xl font-semibold ${className ?? 'text-foreground'}`}>{value}</div>
    </div>
  );
}

export function EmailCampaignDetailPage() {
  const { campaignId = '' } = useParams();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<EmailCampaignRecipientStatus | 'ALL'>('ALL');
  const [downloading, setDownloading] = useState(false);

  const { data: campaign, isLoading, error } = useEmailCampaign(campaignId);
  const isSending = campaign?.status === 'SENDING';
  const recipients = useEmailCampaignRecipients(
    campaignId,
    { page, limit: PAGE_SIZE, status: status === 'ALL' ? undefined : status },
    isSending,
  );

  useDocumentTitle(campaign ? `${campaign.subject} - Email Campaigns` : 'Email Campaign');

  const handleDownload = async () => {
    if (!campaign?.attachmentFilename) return;
    try {
      setDownloading(true);
      const blob = await emailCampaignService.downloadAttachment(campaign.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = campaign.attachmentFilename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download the attachment.');
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return <div className="container-fluid text-sm text-muted-foreground">Loading campaign…</div>;
  }
  if (error || !campaign) {
    return (
      <div className="container-fluid space-y-4">
        <p className="text-sm text-destructive">
          {error?.message ?? 'Campaign not found.'}
        </p>
        <Button variant="outline" asChild>
          <Link to="/shop/email-campaigns">
            <ArrowLeft className="size-4" />
            Back to campaigns
          </Link>
        </Button>
      </div>
    );
  }

  const { sent, failed, pending } = campaign.counts;
  const total = campaign.totalRecipients || 1;

  return (
    <div className="container-fluid space-y-5 lg:space-y-7">
      <div className="space-y-3">
        <Link
          to="/shop/email-campaigns"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Email campaigns
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-foreground">{campaign.subject}</h1>
          <EmailCampaignStatusBadge status={campaign.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          Sent by {campaign.createdBy?.email ?? 'unknown'} on{' '}
          {format(new Date(campaign.createdAt), 'MMM d, yyyy h:mm a')}
          {campaign.completedAt &&
            ` · finished ${format(new Date(campaign.completedAt), 'h:mm a')}`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Recipients" value={campaign.totalRecipients} />
        <Stat label="Sent" value={sent} className="text-green-600" />
        <Stat label="Failed" value={failed} className={failed ? 'text-destructive' : undefined} />
        <Stat label="Queued" value={pending} />
      </div>

      {isSending && (
        <div className="space-y-1.5">
          <Progress value={((sent + failed) / total) * 100} />
          <p className="text-xs text-muted-foreground">
            Sending in the background. You can leave this page; it keeps going.
          </p>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Message */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="text-sm [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(campaign.bodyHtml) }}
            />
            {campaign.attachmentFilename && (
              <div className="flex items-center gap-3 rounded-md border border-border p-3">
                <Paperclip className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{campaign.attachmentFilename}</p>
                  {campaign.attachmentSize != null && (
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(campaign.attachmentSize)}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={downloading}
                >
                  <Download className="size-4" />
                  {downloading ? 'Downloading…' : 'Download'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recipients */}
        <Card className="lg:col-span-3">
          <CardHeader className="py-3">
            <CardTitle>Recipients</CardTitle>
            <CardToolbar>
              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(v as EmailCampaignRecipientStatus | 'ALL');
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="SENT">Sent</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="PENDING">Queued</SelectItem>
                </SelectContent>
              </Select>
            </CardToolbar>
          </CardHeader>
          <CardTable>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipients.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : (recipients.data?.data.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                      No recipients with this status.
                    </TableCell>
                  </TableRow>
                ) : (
                  recipients.data!.data.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{r.firstName ?? '—'}</div>
                        {r.userId ? (
                          <Link
                            to={`/shop/customers/${r.userId}`}
                            className="text-xs text-muted-foreground hover:underline"
                          >
                            {r.email}
                          </Link>
                        ) : (
                          <div className="text-xs text-muted-foreground">{r.email}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <EmailRecipientStatusBadge status={r.status} />
                      </TableCell>
                      <TableCell className="max-w-xs text-xs text-muted-foreground">
                        {r.status === 'SENT' && r.sentAt
                          ? format(new Date(r.sentAt), 'MMM d, h:mm:ss a')
                          : r.status === 'FAILED'
                            ? <span className="text-destructive">{r.error ?? 'Unknown error'}</span>
                            : '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardTable>
          <CardFooter>
            <SimplePagination meta={recipients.data?.meta} onPageChange={setPage} />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
