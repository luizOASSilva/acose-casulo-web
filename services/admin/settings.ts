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

function normalizeAdmin(payload: any): AdminUser | null {
  if (!payload) return null;
  if (payload.data) return payload.data;
  if (payload.admin) return payload.admin;

  return payload;
}

function normalizeAdmins(payload: any): AdminUser[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.admins)) return payload.admins;

  return [];
}

function normalizeSettings(payload: any): SettingItem[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.settings)) return payload.settings;

  return [];
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  try {
    const response = await fetch(`${getApiUrl()}/auth/me`, {
      method: 'GET',
      cache: 'no-store',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) return null;

    const payload = await response.json();

    return normalizeAdmin(payload);
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getAdmins(): Promise<AdminUser[]> {
  try {
    const response = await fetch(`${getApiUrl()}/admins`, {
      method: 'GET',
      cache: 'no-store',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) return [];

    const payload = await response.json();

    return normalizeAdmins(payload);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createAdmin(data: CreateAdminDTO): Promise<AdminUser | null> {
  try {
    const response = await fetch(`${getApiUrl()}/admins`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error(await response.json().catch(() => null));
      return null;
    }

    const payload = await response.json();

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
    const response = await fetch(`${getApiUrl()}/admins/${adminId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error(await response.json().catch(() => null));
      return null;
    }

    const payload = await response.json();

    return normalizeAdmin(payload);
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function deleteAdmin(adminId: number): Promise<boolean> {
  try {
    const response = await fetch(`${getApiUrl()}/admins/${adminId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getSettings(): Promise<SettingItem[]> {
  try {
    const response = await fetch(`${getApiUrl()}/settings`, {
      method: 'GET',
      cache: 'no-store',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) return [];

    const payload = await response.json();

    return normalizeSettings(payload);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function updateSettings(
  data: UpdateSettingsDTO
): Promise<boolean> {
  try {
    const response = await fetch(`${getApiUrl()}/settings`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error(await response.json().catch(() => null));
      return false;
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function clearSettingsCache(): Promise<boolean> {
  try {
    const response = await fetch(`${getApiUrl()}/settings/clear-cache`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
}
