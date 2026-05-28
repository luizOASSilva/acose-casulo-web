export type AdminRole = 'admin' | 'master';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role?: AdminRole | string | null;
  is_active?: boolean;
  is_master?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAdminDTO {
  name: string;
  email: string;
  role: AdminRole;
  is_active?: boolean;
  password?: string;
  password_confirmation?: string;
}

export interface UpdateAdminDTO {
  name?: string;
  email?: string;
  role?: AdminRole;
  is_active?: boolean;
  password?: string;
  password_confirmation?: string;
}

export interface AdminEmailChangeRequestDTO {
  email: string;
}

export interface AdminEmailChangeConfirmDTO {
  token: string;
}

export interface AdminCreationRequestDTO {
  name: string;
  email: string;
  role: AdminRole;
  is_active?: boolean;
}

export interface AdminCreationRequestPreview {
  name: string;
  email: string;
  role: AdminRole | string;
  is_active: boolean;
  expires_at?: string | null;
  requested_by?: {
    name?: string | null;
    email?: string | null;
  } | null;
}

export interface AdminCreationRequestPreviewResponse {
  data?: AdminCreationRequestPreview;
  message?: string;
}

export interface AdminMessageResponse {
  message?: string;
}

export interface SettingItem {
  id?: number;
  key: string;
  value: string | null;
  type?: string | null;
  label?: string | null;
  description?: string | null;
  group?: string | null;
  sort_order?: number | null;
  order?: number | null;
  created_at?: string;
  updated_at?: string;
}
