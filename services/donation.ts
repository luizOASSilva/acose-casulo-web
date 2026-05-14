import { api } from '@/lib/api';

export interface PixResponse {
  id: number;
  amount: number;
  pix_copy_paste: string;
  pix_qr_code: string;
  pix_expires_at: string;
}

export interface DonationStatusResponse {
  status: 'pending' | 'approved' | 'expired' | 'cancelled';
  pix_expires_at: string | null;
}

export async function createDonation(data: unknown): Promise<PixResponse> {
  return api.post<PixResponse>('/donations', data);
}

export async function updateDonation(id: number, data: unknown): Promise<void> {
  await api.put(`/donations/${id}`, data);
}

export async function updateDonationPix(
  id: number,
  amount: number
): Promise<PixResponse> {
  return api.put<PixResponse>(`/donations/${id}/pix`, { amount });
}

export async function getDonationStatus(
  id: number
): Promise<DonationStatusResponse> {
  return api.get<DonationStatusResponse>(`/donations/${id}/status`);
}
