import { apiFetch } from '@/lib/api';

export interface PixResponse {
  id:             number;
  amount:         number;
  pix_copy_paste: string;
  pix_qr_code:    string;
  pix_expires_at: string;
}

export interface DonationStatusResponse {
  status:          'pending' | 'approved' | 'expired' | 'cancelled';
  pix_expires_at:  string | null;
}

export async function createDonation(data: unknown): Promise<PixResponse> {
  return apiFetch('/donations', {
    method: 'POST',
    body:   JSON.stringify(data),
  });
}

export async function updateDonation(id: number, data: unknown): Promise<void> {
  await apiFetch(`/donations/${id}`, {
    method: 'PUT',
    body:   JSON.stringify(data),
  });
}

export async function updateDonationPix(id: number, amount: number): Promise<PixResponse> {
  return apiFetch(`/donations/${id}/pix`, {
    method: 'PUT',
    body:   JSON.stringify({ amount }),
  });
}

export async function getDonationStatus(id: number): Promise<DonationStatusResponse> {
  return apiFetch(`/donations/${id}/status`);
}
