import { api } from '@/lib/api';

import {
  DonationStatusResponse,
  PaginatedDonationsResponse,
  PixResponse,
} from '@/types/donation';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type DonationPayload = object;

function getApiUrl(): string {
  if (!API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL não configurada');
  }

  return API_URL.replace(/\/$/, '');
}

function toRequestBody(data: DonationPayload): Record<string, unknown> {
  return { ...data } as Record<string, unknown>;
}

export async function createDonation(
  data: DonationPayload
): Promise<PixResponse> {
  return api.post<PixResponse>('/donations', toRequestBody(data));
}

export async function updateDonation(
  id: number,
  data: DonationPayload
): Promise<void> {
  await api.put(`/donations/${id}`, toRequestBody(data));
}

export async function updateDonationPix(
  id: number,
  amount: number
): Promise<PixResponse> {
  return api.put<PixResponse>(`/donations/${id}/pix`, {
    amount,
  });
}

export async function getDonationStatus(
  id: number
): Promise<DonationStatusResponse> {
  return api.get<DonationStatusResponse>(`/donations/${id}/status`);
}

export async function getDonations(
  page = 1,
  status?: string
): Promise<PaginatedDonationsResponse> {
  const params = new URLSearchParams({
    page: String(page),
  });

  if (status) {
    params.set('status', status);
  }

  return api.get<PaginatedDonationsResponse>(
    `/donations?${params.toString()}`
  );
}

export async function getAdminDonations(
  page = 1,
  status?: string,
  cookieHeader?: string
): Promise<PaginatedDonationsResponse> {
  const params = new URLSearchParams({
    page: String(page),
  });

  if (status) {
    params.set('status', status);
  }

  const response = await fetch(
    `${getApiUrl()}/donations?${params.toString()}`,
    {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
    }
  );

  if (!response.ok) {
    throw new Error('Erro ao buscar doações');
  }

  return response.json();
}
