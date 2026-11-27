import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { emailCampaignService } from '@/modules/shop/services/email-campaign.service';
import {
  EmailCampaignInput,
  EmailCampaignRecipientParams,
} from '@/modules/shop/types/email-campaign.type';

export const emailCampaignKeys = {
  all: ['email-campaigns'] as const,
  list: (params: { page?: number; limit?: number }) =>
    [...emailCampaignKeys.all, 'list', params] as const,
  detail: (id: string) => [...emailCampaignKeys.all, 'detail', id] as const,
  recipients: (id: string, params: EmailCampaignRecipientParams) =>
    [...emailCampaignKeys.all, 'recipients', id, params] as const,
  audience: () => [...emailCampaignKeys.all, 'audience'] as const,
};

const POLL_MS = 3000;

/** Pulls the human-readable message out of a Nest error response. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  const data = (error as { response?: { data?: { message?: unknown } } })?.response?.data;
  const message = data?.message;
  if (Array.isArray(message)) return message.join(', ');
  if (typeof message === 'string') return message;
  return fallback;
}

export function useEmailCampaigns(params: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: emailCampaignKeys.list(params),
    queryFn: () => emailCampaignService.getCampaigns(params),
    placeholderData: keepPreviousData,
    // Keep polling while any campaign on the page is still sending
    refetchInterval: (query) =>
      query.state.data?.data.some((c) => c.status === 'SENDING') ? POLL_MS : false,
  });
}

export function useEmailCampaign(id: string) {
  return useQuery({
    queryKey: emailCampaignKeys.detail(id),
    queryFn: () => emailCampaignService.getCampaign(id),
    enabled: !!id,
    refetchInterval: (query) => (query.state.data?.status === 'SENDING' ? POLL_MS : false),
  });
}

export function useEmailCampaignRecipients(
  id: string,
  params: EmailCampaignRecipientParams,
  isSending: boolean,
) {
  return useQuery({
    queryKey: emailCampaignKeys.recipients(id, params),
    queryFn: () => emailCampaignService.getRecipients(id, params),
    enabled: !!id,
    placeholderData: keepPreviousData,
    refetchInterval: isSending ? POLL_MS : false,
  });
}

export function useEmailCampaignAudience(enabled: boolean) {
  return useQuery({
    queryKey: emailCampaignKeys.audience(),
    queryFn: () => emailCampaignService.getAudience(),
    enabled,
    staleTime: 0,
  });
}

export function useSendEmailCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: EmailCampaignInput) => emailCampaignService.sendCampaign(input),
    onSuccess: (campaign) => {
      queryClient.invalidateQueries({ queryKey: emailCampaignKeys.all });
      toast.success(
        `Sending to ${campaign.totalRecipients} customer${campaign.totalRecipients === 1 ? '' : 's'}…`,
      );
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to send the campaign. Please try again.'));
    },
  });
}

export function useSendTestEmailCampaign() {
  return useMutation({
    mutationFn: (input: EmailCampaignInput) => emailCampaignService.sendTest(input),
    onSuccess: ({ sentTo }) => {
      toast.success(`Test email sent to ${sentTo}`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to send the test email.'));
    },
  });
}
