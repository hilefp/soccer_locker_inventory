import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Info, Mail, Paperclip, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { RichTextEditor } from '@/shared/components/ui/rich-text-editor';
import { sanitizeRichText } from '@/shared/lib/sanitize-html';
import {
  useEmailCampaignAudience,
  useSendEmailCampaign,
  useSendTestEmailCampaign,
} from '@/modules/shop/hooks/use-email-campaigns';
import {
  CAMPAIGN_ATTACHMENT_ACCEPT,
  CAMPAIGN_ATTACHMENT_MAX_BYTES,
  CAMPAIGN_ATTACHMENT_TYPES,
  EmailCampaignInput,
} from '@/modules/shop/types/email-campaign.type';

interface EmailCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SUBJECT_MAX = 200;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function hasText(html: string): boolean {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length > 0;
}

export function EmailCampaignDialog({ open, onOpenChange }: EmailCampaignDialogProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const audience = useEmailCampaignAudience(open);
  const sendCampaign = useSendEmailCampaign();
  const sendTest = useSendTestEmailCampaign();

  const recipients = audience.data?.recipients ?? 0;
  const isBusy = sendCampaign.isPending || sendTest.isPending;

  const imagePreviewUrl = useMemo(
    () => (file && file.type.startsWith('image/') ? URL.createObjectURL(file) : null),
    [file],
  );
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const reset = () => {
    setSubject('');
    setMessage('');
    setFile(null);
    setConfirmOpen(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (isBusy) return;
    onOpenChange(next);
  };

  const pickFile = (candidate: File | undefined) => {
    if (!candidate) return;
    if (!CAMPAIGN_ATTACHMENT_TYPES.includes(candidate.type)) {
      toast.error('Attachment must be a PDF, JPG, PNG or GIF file.');
      return;
    }
    if (candidate.size > CAMPAIGN_ATTACHMENT_MAX_BYTES) {
      toast.error(`Attachment must be ${formatBytes(CAMPAIGN_ATTACHMENT_MAX_BYTES)} or smaller.`);
      return;
    }
    setFile(candidate);
  };

  const subjectValid = subject.trim().length > 0 && subject.length <= SUBJECT_MAX;
  const contentValid = hasText(message) || !!file;
  const canSubmit = subjectValid && contentValid && !isBusy;

  const buildInput = (): EmailCampaignInput => ({
    subject: subject.trim(),
    message: hasText(message) ? sanitizeRichText(message) : '',
    file,
  });

  const handleSendTest = () => {
    if (!canSubmit) return;
    sendTest.mutate(buildInput());
  };

  const handleConfirmSend = () => {
    sendCampaign.mutate(buildInput(), {
      onSuccess: (campaign) => {
        reset();
        onOpenChange(false);
        navigate(`/shop/email-campaigns/${campaign.id}`);
      },
      onSettled: () => setConfirmOpen(false),
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="size-5 text-primary" />
              Email customers
            </DialogTitle>
            <DialogDescription>
              Send an email to every customer subscribed to the newsletter.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-5 pt-2">
            {/* Audience */}
            <div className="flex items-start gap-2 rounded-md border border-border bg-muted/40 p-3 text-sm">
              <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span>
                {audience.isLoading ? (
                  'Counting subscribers…'
                ) : audience.isError ? (
                  'Could not load the number of subscribers.'
                ) : recipients === 0 ? (
                  <span className="text-destructive">
                    No customers are subscribed to the newsletter yet, so there is nobody to send to.
                  </span>
                ) : (
                  <>
                    This will be sent to <strong>{recipients}</strong> newsletter subscriber
                    {recipients === 1 ? '' : 's'}. An unsubscribe link is added automatically.
                  </>
                )}
              </span>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="campaign-subject">Subject</Label>
                <span className="text-xs text-muted-foreground">
                  {subject.length}/{SUBJECT_MAX}
                </span>
              </div>
              <Input
                id="campaign-subject"
                placeholder="Black Friday: 25% off all footwear"
                value={subject}
                maxLength={SUBJECT_MAX}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="campaign-message">Message</Label>
              <RichTextEditor
                id="campaign-message"
                value={message}
                onChange={setMessage}
                placeholder="Write your message…"
                className="[&_[contenteditable]]:min-h-40"
              />
            </div>

            {/* Attachment */}
            <div className="space-y-2">
              <Label>Attachment (optional)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept={CAMPAIGN_ATTACHMENT_ACCEPT}
                className="hidden"
                onChange={(e) => {
                  pickFile(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
              {file ? (
                <div className="flex items-center gap-3 rounded-md border border-border p-3">
                  {imagePreviewUrl ? (
                    <img
                      src={imagePreviewUrl}
                      alt=""
                      className="size-14 shrink-0 rounded object-cover"
                    />
                  ) : (
                    <div className="flex size-14 shrink-0 items-center justify-center rounded bg-muted">
                      <FileText className="size-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(file.size)}
                      {imagePreviewUrl && ' · shown inside the email, below the message'}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    mode="icon"
                    size="sm"
                    title="Remove attachment"
                    onClick={() => setFile(null)}
                    disabled={isBusy}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    pickFile(e.dataTransfer.files?.[0]);
                  }}
                  className={`flex w-full flex-col items-center gap-1 rounded-md border border-dashed p-5 text-sm transition-colors ${
                    isDragging ? 'border-primary bg-primary/5' : 'border-input hover:bg-accent'
                  }`}
                >
                  <Paperclip className="size-5 text-muted-foreground" />
                  <span className="font-medium">Click or drop a file</span>
                  <span className="text-xs text-muted-foreground">
                    PDF, JPG, PNG or GIF · up to {formatBytes(CAMPAIGN_ATTACHMENT_MAX_BYTES)}
                  </span>
                </button>
              )}
            </div>
          </DialogBody>

          <DialogFooter className="gap-2 pt-4 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleSendTest}
              disabled={!canSubmit}
              title="Sends this email only to you"
            >
              <Mail className="size-4" />
              {sendTest.isPending ? 'Sending test…' : 'Send test to me'}
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isBusy}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => setConfirmOpen(true)}
                disabled={!canSubmit || recipients === 0}
              >
                <Send className="size-4" />
                Send to {recipients} customer{recipients === 1 ? '' : 's'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={(o) => !sendCampaign.isPending && setConfirmOpen(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Send to {recipients} customer{recipients === 1 ? '' : 's'}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              “{subject.trim()}” will be emailed to every newsletter subscriber. This can’t be
              undone. Tip: use “Send test to me” first to check how it looks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={sendCampaign.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmSend();
              }}
              disabled={sendCampaign.isPending}
            >
              {sendCampaign.isPending ? 'Sending…' : 'Yes, send it'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
