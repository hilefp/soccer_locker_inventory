import { apiClient } from '@/shared/lib/api-client';
import {
  EmailCampaign,
  EmailCampaignDetail,
  EmailCampaignInput,
  EmailCampaignRecipient,
  EmailCampaignRecipientParams,
  Paginated,
} from '@/modules/shop/types/email-campaign.type';

const BASE = '/admin-shop/email-campaigns';

function toFormData(input: EmailCampaignInput): FormData {
  const form = new FormData();
  form.append('subject', input.subject);
  form.append('message', input.message);
  if (input.file) form.append('file', input.file);
  return form;
}

// apiClient defaults to JSON; this header makes axios hand the FormData to the
// browser, which sets multipart/form-data with the right boundary.
const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

export const emailCampaignService = {
  async getCampaigns(params: { page?: number; limit?: number }): Promise<Paginated<EmailCampaign>> {
    const response = await apiClient.get<Paginated<EmailCampaign>>(BASE, { params });
    return response.data;
  },

  async getCampaign(id: string): Promise<EmailCampaignDetail> {
    const response = await apiClient.get<EmailCampaignDetail>(`${BASE}/${id}`);
    return response.data;
  },

  async getRecipients(
    id: string,
    params: EmailCampaignRecipientParams,
  ): Promise<Paginated<EmailCampaignRecipient>> {
    const response = await apiClient.get<Paginated<EmailCampaignRecipient>>(
      `${BASE}/${id}/recipients`,
      { params },
    );
    return response.data;
  },

  async getAudience(): Promise<{ recipients: number }> {
    const response = await apiClient.get<{ recipients: number }>(`${BASE}/audience`);
    return response.data;
  },

  async sendCampaign(input: EmailCampaignInput): Promise<EmailCampaign> {
    const response = await apiClient.post<EmailCampaign>(BASE, toFormData(input), multipart);
    return response.data;
  },

  async sendTest(input: EmailCampaignInput): Promise<{ sentTo: string }> {
    const response = await apiClient.post<{ sentTo: string }>(
      `${BASE}/test`,
      toFormData(input),
      multipart,
    );
    return response.data;
  },

  async downloadAttachment(id: string): Promise<Blob> {
    const response = await apiClient.get<Blob>(`${BASE}/${id}/attachment`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
