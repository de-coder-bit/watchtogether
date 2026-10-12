import api from './api';
import { PartnerInviteResponse, PartnerStatusResponse } from '../types';

export const partnerService = {
  async createOrGetInvite(): Promise<PartnerInviteResponse> {
    const res = await api.post<PartnerInviteResponse>('/partner/invite');
    return res.data;
  },

  async pairWithCode(inviteCode: string): Promise<PartnerStatusResponse> {
    const res = await api.post<PartnerStatusResponse>('/partner/pair', { inviteCode });
    return res.data;
  },

  async unpair(): Promise<PartnerStatusResponse> {
    const res = await api.post<PartnerStatusResponse>('/partner/unpair');
    return res.data;
  },

  async getStatus(): Promise<PartnerStatusResponse> {
    const res = await api.get<PartnerStatusResponse>('/partner/status');
    return res.data;
  },
};
