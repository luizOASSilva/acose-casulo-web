export interface DonationData {
  amount: number;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  zip_code: string;
  city: string;
  street: string;
  number: string;
  neighborhood: string;
  state: string;
  size: string;
}

export interface PixResponse {
  pix_qr_code: string;
  pix_copy_paste: string;
  pix_key?: string;
  donation_id?: string;
}

export type DonationStep = 1 | 2 | 3 | 4;

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
