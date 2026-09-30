import { api } from './api';
import { PartnerInviteResponse, PartnerStatusResponse } from '../types';

export const partnerService = {
  async generateInviteCode(): Promise<PartnerInviteResponse> {
    const res = await api.post<PartnerInviteResponse>('/api/partner/invite');
    return res.data;
  },

  async pairWithPartner(inviteCode: string): Promise<PartnerStatusResponse> {
    const res = await api.post<PartnerStatusResponse>('/api/partner/pair', { inviteCode });
    return res.data;
  },

  async getPartnerStatus(): Promise<PartnerStatusResponse> {
    const res = await api.get<PartnerStatusResponse>('/api/partner/status');
    return res.data;
  },

  async unpairPartner(): Promise<void> {
    await api.delete('/api/partner/unpair');
  }
};
