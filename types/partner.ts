export interface Partner {
  id?: number;
  name: string;
  src: string;
  bgColor?: string;
  bg_color?: string | null;
  logo_url?: string | null;
  logoUrl?: string | null;
  logo_alt?: string | null;
  logoAlt?: string | null;
  website_url?: string | null;
  websiteUrl?: string | null;
  order?: number | null;
  is_active?: boolean;
  isActive?: boolean;
}

export interface PartnerApiItem {
  id: number;
  name: string;
  logo_path?: string | null;
  logo_url: string | null;
  logo_alt?: string | null;
  website_url: string | null;
  bg_color: string | null;
  order: number | null;
  is_active: boolean;
  author?: {
    id?: number | null;
    name?: string | null;
  } | null;
  created_at?: string;
  updated_at?: string;
}

export interface SavePartnerInput {
  name: string;
  logo_path: string;
  logo_alt?: string | null;
  website_url?: string | null;
  bg_color?: string | null;
  order?: number | null;
  is_active?: boolean;
}

export type PartnerStatusFilter = 'all' | 'active' | 'inactive';

export interface AdminPartnerFilters {
  busca?: string;
  status?: PartnerStatusFilter;
  page?: number;
  per_page?: number;
}

export interface PartnerPaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginatedPartnersResponse {
  data: PartnerApiItem[];
  meta: PartnerPaginationMeta;
  links?: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
}

export interface PartnerListFilters {
  busca?: string;
  status?: PartnerStatusFilter;
  page?: number;
}
