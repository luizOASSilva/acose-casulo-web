export interface DonationData {
  amount: number;
  name: string;
  email: string;
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