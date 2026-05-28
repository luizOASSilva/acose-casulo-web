import { api } from '@/lib/api';

import type {
  AdminCreationRequestDTO,
  AdminCreationRequestPreview,
  AdminForgotPasswordDTO,
  AdminMessageResponse,
  AdminResetPasswordDTO,
  AdminUser,
  CreateAdminDTO,
  SettingItem,
  UpdateAdminDTO,
} from '@/types/admin/settings';

interface AdminCollectionResponse {
  data?: AdminUser[];
  admins?: AdminUser[];
}

interface AdminSingleResponse {
  data?: AdminUser;
  admin?: AdminUser;
}

interface SettingsCollectionResponse {
  data?: SettingItem[];
  settings?: SettingItem[];
}

interface AdminCreationRequestPreviewResponse {
  data?: AdminCreationRequestPreview;
  request?: AdminCreationRequestPreview;
}

function normalizeAdmins(
  payload: AdminCollectionResponse | AdminUser[]
): AdminUser[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.admins)) return payload.admins;

  return [];
}

function normalizeAdmin(
  payload: AdminSingleResponse | AdminUser
): AdminUser | null {
  if (!payload) return null;
  if ('data' in payload && payload.data) return payload.data;
  if ('admin' in payload && payload.admin) return payload.admin;

  return payload as AdminUser;
}

function normalizeSettings(
  payload: SettingsCollectionResponse | SettingItem[]
): SettingItem[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.settings)) return payload.settings;

  return [];
}

function normalizeCreationPreview(
  payload: AdminCreationRequestPreviewResponse | AdminCreationRequestPreview
): AdminCreationRequestPreview | null {
  if (!payload) return null;
  if ('data' in payload && payload.data) return payload.data;
  if ('request' in payload && payload.request) return payload.request;

  return payload as AdminCreationRequestPreview;
}

export async function getCurrentAdmin(
  cookieHeader?: string
): Promise<AdminUser | null> {
  try {
    const response = await api.get<AdminSingleResponse | AdminUser>(
      '/auth/me',
      {
        headers: cookieHeader
          ? {
              Cookie: cookieHeader,
            }
          : undefined,
      }
    );

    return normalizeAdmin(response);
  } catch (error) {
    console.error('Erro ao buscar admin atual:', error);
    return null;
  }
}

export async function getAdmins(cookieHeader?: string): Promise<AdminUser[]> {
  try {
    const response = await api.get<AdminCollectionResponse | AdminUser[]>(
      '/admins',
      {
        headers: cookieHeader
          ? {
              Cookie: cookieHeader,
            }
          : undefined,
      }
    );

    return normalizeAdmins(response);
  } catch (error) {
    console.error('Erro ao buscar admins:', error);
    return [];
  }
}

export async function createAdmin(
  data: CreateAdminDTO
): Promise<AdminUser | null> {
  try {
    const response = await api.post<AdminSingleResponse | AdminUser>(
      '/admins',
      {
        name: data.name,
        email: data.email,
        is_active: data.is_active ?? true,
        password: data.password,
        password_confirmation: data.password_confirmation,
      }
    );

    return normalizeAdmin(response);
  } catch (error) {
    console.error('Erro ao criar admin:', error);
    return null;
  }
}

export async function requestAdminCreation(
  data: AdminCreationRequestDTO
): Promise<string | null> {
  try {
    const response = await api.post<AdminMessageResponse>(
      '/admins/create-request',
      {
        name: data.name,
        email: data.email,
        is_active: data.is_active ?? true,
      }
    );

    return (
      response?.message ||
      'Enviamos um link para o seu e-mail. O administrador só será criado depois da sua confirmação.'
    );
  } catch (error) {
    console.error('Erro ao solicitar criação de admin:', error);
    return null;
  }
}

export async function getAdminCreationRequest(
  token: string
): Promise<AdminCreationRequestPreview | null> {
  try {
    const response = await api.get<
      AdminCreationRequestPreviewResponse | AdminCreationRequestPreview
    >(`/admins/creation-request?token=${encodeURIComponent(token)}`);

    return normalizeCreationPreview(response);
  } catch (error) {
    console.error('Erro ao buscar solicitação de criação de admin:', error);
    return null;
  }
}

export async function confirmAdminCreationRequest(
  token: string
): Promise<string | null> {
  try {
    const response = await api.post<AdminMessageResponse>(
      '/admins/creation-request/confirm',
      {
        token,
      }
    );

    return response?.message || 'Administrador criado com sucesso.';
  } catch (error) {
    console.error('Erro ao confirmar criação de admin:', error);
    return null;
  }
}

export async function updateAdmin(
  id: number,
  data: UpdateAdminDTO
): Promise<AdminUser | null> {
  try {
    const response = await api.put<AdminSingleResponse | AdminUser>(
      `/admins/${id}`,
      {
        name: data.name,
        email: data.email,
        is_active: data.is_active,
        ...(data.password
          ? {
              password: data.password,
              password_confirmation: data.password_confirmation,
            }
          : {}),
      }
    );

    return normalizeAdmin(response);
  } catch (error) {
    console.error(`Erro ao atualizar admin ID ${id}:`, error);
    return null;
  }
}

export async function requestAdminEmailChange(
  adminId: number,
  email: string
): Promise<string | null> {
  try {
    const response = await api.post<AdminMessageResponse>(
      `/admins/${adminId}/email-change-request`,
      {
        email,
      }
    );

    return (
      response?.message ||
      'Enviamos um link para o seu e-mail. O e-mail do administrador só será alterado depois da sua confirmação.'
    );
  } catch (error) {
    console.error(
      `Erro ao solicitar troca de e-mail do admin ID ${adminId}:`,
      error
    );
    return null;
  }
}

export async function confirmAdminEmailChange(
  token: string
): Promise<string | null> {
  try {
    const response = await api.post<AdminMessageResponse>(
      '/admins/email-change/confirm',
      {
        token,
      }
    );

    return response?.message || 'E-mail do administrador alterado com sucesso.';
  } catch (error) {
    console.error('Erro ao confirmar troca de e-mail do admin:', error);
    return null;
  }
}

export async function deleteAdmin(id: number): Promise<boolean> {
  try {
    await api.delete(`/admins/${id}`);

    return true;
  } catch (error) {
    console.error(`Erro ao remover admin ID ${id}:`, error);
    return false;
  }
}

export async function getSettings(
  cookieHeader?: string
): Promise<SettingItem[]> {
  try {
    const response = await api.get<SettingsCollectionResponse | SettingItem[]>(
      '/settings',
      {
        headers: cookieHeader
          ? {
              Cookie: cookieHeader,
            }
          : undefined,
      }
    );

    return normalizeSettings(response);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return [];
  }
}

export async function updateSettings(data: {
  settings: {
    key: string;
    value: string | null;
  }[];
}): Promise<boolean> {
  try {
    await api.put('/settings', data);

    return true;
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    return false;
  }
}

export async function clearSettingsCache(): Promise<boolean> {
  try {
    await api.post('/settings/clear-cache');

    return true;
  } catch (error) {
    console.error('Erro ao limpar cache de configurações:', error);
    return false;
  }
}

export async function requestAdminPasswordReset(
  data: AdminForgotPasswordDTO
): Promise<string | null> {
  try {
    const response = await api.post<AdminMessageResponse>(
      '/auth/forgot-password',
      {
        email: data.email,
      }
    );

    return (
      response?.message ||
      'Se este e-mail estiver cadastrado, enviaremos um link para redefinir a senha.'
    );
  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha:', error);
    return null;
  }
}

export async function resetAdminPassword(
  data: AdminResetPasswordDTO
): Promise<string | null> {
  try {
    const response = await api.post<AdminMessageResponse>(
      '/auth/reset-password',
      {
        token: data.token,
        password: data.password,
        password_confirmation: data.password_confirmation,
      }
    );

    return response?.message || 'Senha redefinida com sucesso.';
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return null;
  }
}
