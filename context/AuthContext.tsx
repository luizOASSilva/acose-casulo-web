'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode
} from 'react';

import { api } from '@/lib/api';
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

    api.get<Admin>('/auth/me')
      .then((data) => {
        if (mounted) setAdmin(data);
      })
      .catch(() => {
        if (mounted) setAdmin(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await api.post('/auth/login', {
      email,
      password,
    });

    const me = await api.get<Admin>('/auth/me');

    setAdmin(me);
    router.push('/admin');
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
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
