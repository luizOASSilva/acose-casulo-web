import { api } from '@/lib/api';
import { DonationStatusResponse, PaginatedDonationsResponse, PixResponse } from '@/types/donation';


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
