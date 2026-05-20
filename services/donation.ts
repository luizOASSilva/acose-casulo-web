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

export interface Donation {
  id: number;
  name: string;
  email: string;
  amount: number;
  status: 'pending' | 'approved' | 'expired' | 'cancelled';
  size: string | null;
  has_gift: boolean;
  gift_status: string | null;
  created_at: string;
  pix_expires_at: string | null;
}

export interface PaginatedDonationsResponse {
  data: Donation[];

  links?: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };

  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };

  stats: {
    total_raised: number;
    approved_count: number;
    pending_count: number;
    gifts_count: number;
  };
}

export async function createDonation(
  data: unknown
): Promise<PixResponse> {
  return api.post<PixResponse>('/donations', data);
}

export async function updateDonation(
  id: number,
  data: unknown
): Promise<void> {
  await api.put(`/donations/${id}`, data);
}

export async function updateDonationPix(
  id: number,
  amount: number
): Promise<PixResponse> {
  return api.put<PixResponse>(
    `/donations/${id}/pix`,
    {
      amount,
    }
  );
}

export async function getDonationStatus(
  id: number
): Promise<DonationStatusResponse> {
  return api.get<DonationStatusResponse>(
    `/donations/${id}/status`
  );
}

export async function getDonations(
  page = 1,
  status?: string
): Promise<PaginatedDonationsResponse> {
  const params = new URLSearchParams({ page: String(page) });
  if (status) params.set('status', status);

  return api.get<PaginatedDonationsResponse>(
    `/donations?${params.toString()}`
  );
}
