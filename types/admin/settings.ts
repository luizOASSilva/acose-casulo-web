export type AdminRole = 'master' | 'admin';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
  is_master?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAdminDTO {
  name: string;
  email: string;
  role: AdminRole;
  is_active?: boolean;
}

export interface UpdateAdminDTO {
  name?: string;
  email?: string;
  role?: AdminRole;
  is_active?: boolean;
}

export interface SettingItem {
  key: string;
  value: string | null;
  type?: string;
  group?: string | null;
  label?: string;
  description?: string | null;
  sort_order?: number | null;
  order?: number | null;
  is_public?: boolean;
}
