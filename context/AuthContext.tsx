'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiFetch, getToken, setToken, clearToken } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Admin {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    if (!getToken()) {
      setLoading(false);
      return;
    }

    apiFetch<Admin>('/auth/me')
      .then((data) => { if (mounted) setAdmin(data); })
      .catch(() => { clearToken(); if (mounted) setAdmin(null); })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiFetch<{ user: Admin; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
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

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro do AuthProvider');
  return ctx;
}