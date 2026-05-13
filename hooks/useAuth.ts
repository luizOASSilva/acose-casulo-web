'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, getToken, setToken, clearToken } from '@/lib/api';

interface Admin {
  id: number;
  name: string;
  email: string;
}

interface LoginResponse {
  user: Admin;
  token: string;
}

export function useAuth() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    if (!getToken()) {
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        const data = await apiFetch<Admin>('/auth/me', {}, true);
        if (mounted) setAdmin(data);
      } catch {
        clearToken();
        if (mounted) setAdmin(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiFetch<LoginResponse>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
    );

    setToken(data.token);
    setAdmin(data.user);
    router.push('/admin');
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      clearToken();
      setAdmin(null);
      router.push('/');
    }
  }, [router]);

  return {
    admin,
    loading,
    login,
    logout,
  };
}
