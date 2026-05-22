import { api } from '@/lib/api';

import type {
  AdminUser,
  CreateAdminDTO,
  SettingItem,
  UpdateAdminDTO,
  UpdateSettingsDTO,
} from '@/types/settings';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getApiUrl(): string {
  if (!API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL não configurada');
  }

  return API_URL.replace(/\/$/, '');
}

function getHeaders(cookieHeader?: string): HeadersInit {
  return {
    Accept: 'application/json',
    ...(cookieHeader ? { Cookie: cookieHeader } : {}),
  };
}

function normalizeAdmin(payload: any): AdminUser | null {
  if (!payload) return null;
  if (payload.data) return payload.data;
  if (payload.admin) return payload.admin;

  return payload;
}

function normalizeAdmins(payload: any): AdminUser[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.admins)) return payload.admins;

  return [];
}

function normalizeSettings(payload: any): SettingItem[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.settings)) return payload.settings;

  return [];
}

export async function getCurrentAdmin(
  cookieHeader?: string
): Promise<AdminUser | null> {
  try {
    const response = await fetch(`${getApiUrl()}/auth/me`, {
      method: 'GET',
      cache: 'no-store',
      credentials: 'include',
      headers: getHeaders(cookieHeader),
    });

    if (!response.ok) return null;

    const payload = await response.json();

    return normalizeAdmin(payload);
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getAdmins(
  cookieHeader?: string
): Promise<AdminUser[]> {
  try {
    const response = await fetch(`${getApiUrl()}/admins`, {
      method: 'GET',
      cache: 'no-store',
      credentials: 'include',
      headers: getHeaders(cookieHeader),
    });

    if (!response.ok) return [];

    const payload = await response.json();

    return normalizeAdmins(payload);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getSettings(
  cookieHeader?: string
): Promise<SettingItem[]> {
  try {
    const response = await fetch(`${getApiUrl()}/settings`, {
      method: 'GET',
      cache: 'no-store',
      credentials: 'include',
      headers: getHeaders(cookieHeader),
    });

    if (!response.ok) return [];

    const payload = await response.json();

    return normalizeSettings(payload);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createAdmin(
  data: CreateAdminDTO
): Promise<AdminUser | null> {
  try {
    const payload = await api.post<any>('/admins', data);

    return normalizeAdmin(payload);
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function updateAdmin(
  adminId: number,
  data: UpdateAdminDTO
): Promise<AdminUser | null> {
  try {
    const payload = await api.put<any>(`/admins/${adminId}`, data);

    return normalizeAdmin(payload);
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function deleteAdmin(adminId: number): Promise<boolean> {
  try {
    await api.delete(`/admins/${adminId}`);

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function updateSettings(
  data: UpdateSettingsDTO
): Promise<boolean> {
  try {
    await api.put('/settings', data);

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function clearSettingsCache(): Promise<boolean> {
  try {
    await api.post('/settings/clear-cache');

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
