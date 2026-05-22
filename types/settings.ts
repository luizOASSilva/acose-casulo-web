export type AdminRole = 'master' | 'admin';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
  is_master?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAdminDTO {
  name: string;
  email: string;
  role: AdminRole;
  password: string;
  password_confirmation: string;
}

export interface UpdateAdminDTO {
  name: string;
  email: string;
  role: AdminRole;
  password?: string;
  password_confirmation?: string;
}

export interface SettingItem {
  id: number;
  group: string;
  key: string;
  label: string;
  description?: string | null;
  type: 'text' | 'email' | 'url' | 'textarea' | 'boolean' | string;
  value?: string | null;
  is_public: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateSettingsDTO {
  settings: {
    key: string;
    value: string | null;
  }[];
}
