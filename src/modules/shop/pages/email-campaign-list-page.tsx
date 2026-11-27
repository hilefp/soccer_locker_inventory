import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Mail, Paperclip, Send } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardFooter, CardTable } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { useDocumentTitle } from '@/shared/hooks/use-document-title';
import { useEmailCampaigns } from '@/modules/shop/hooks/use-email-campaigns';
import { EmailCampaignDialog } from '@/modules/shop/components/email-campaign-dialog';
import { EmailCampaignStatusBadge } from '@/modules/shop/components/email-campaign-status-badge';
import { SimplePagination } from '@/modules/shop/components/simple-pagination';
import { EmailCampaign } from '@/modules/shop/types/email-campaign.type';

const PAGE_SIZE = 20;

function ProgressCell({ campaign }: { campaign: EmailCampaign }) {
  const { sent, failed } = campaign.counts;
  const done = sent + failed;
  const total = campaign.totalRecipients || 1;

  return (
    <div className="min-w-40 space-y-1.5">
      <div className="flex justify-between text-xs">
        <span>
          <span className="font-medium text-foreground">{sent}</span>
          <span className="text-muted-foreground"> / {campaign.totalRecipients} sent</span>
        </span>
        {failed > 0 && <span className="text-destructive">{failed} failed</span>}
      </div>
      {campaign.status === 'SENDING' && <Progress value={(done / total) * 100} />}
    </div>
  );
}

export function EmailCampaignListPage() {
  useDocumentTitle('Email Campaigns - Shop');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [composeOpen, setComposeOpen] = useState(false);

  const page = Number(searchParams.get('page')) || 1;
  const { data, isLoading, error } = useEmailCampaigns({ page, limit: PAGE_SIZE });
  const campaigns = data?.data ?? [];

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Mail className="size-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Email Campaigns</h1>
          </div>
          <span className="text-sm text-muted-foreground">
            {isLoading
              ? 'Loading campaigns...'
              : error
                ? `Error loading campaigns: ${error.message}`
                : `${data?.meta.total ?? 0} campaigns sent to newsletter subscribers.`}
          </span>
        </div>
        <Button variant="primary" onClick={() => setComposeOpen(true)} className="gap-2">
          <Send className="size-4" />
          New campaign
        </Button>
      </div>

      <Card>
        <CardTable>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Sent by</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No campaigns yet. Click “New campaign” to email your subscribers.
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map((c) => (
                  <TableRow
                    key={c.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/shop/email-campaigns/${c.id}`)}
                  >
                    <TableCell className="max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-foreground">{c.subject}</span>
                        {c.attachmentFilename && (
                          <Paperclip
                            className="size-3.5 shrink-0 text-muted-foreground"
                            aria-label="Has attachment"
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <EmailCampaignStatusBadge status={c.status} />
                    </TableCell>
                    <TableCell>
                      <ProgressCell campaign={c} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.createdBy?.email ?? '—'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {format(new Date(c.createdAt), 'MMM d, yyyy h:mm a')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardTable>
        <CardFooter>
          <SimplePagination
            meta={data?.meta}
            onPageChange={(p) =>
              setSearchParams(p === 1 ? {} : { page: String(p) }, { replace: true })
            }
          />
        </CardFooter>
      </Card>

      <EmailCampaignDialog open={composeOpen} onOpenChange={setComposeOpen} />
    </div>
  );
}
