'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export interface Admin {
  id: number;
  name: string;
  email: string;
  role?: 'admin' | 'master' | string;
  is_master?: boolean;
}

interface AuthContextType {
  admin: Admin | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
    redirectTo?: string | null
  ) => Promise<void>;
  logout: () => Promise<void>;
  setAdmin: (admin: Admin | null) => void;
}

interface AuthProviderProps {
  children: ReactNode;
  initialAdmin?: Admin | null;
  skipInitialFetch?: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_PREVIEW_ACTIVE_KEY = 'admin.preview.active';
const ADMIN_PREVIEW_RETURN_TO_KEY = 'admin.preview.returnTo';
const ADMIN_PREVIEW_DISMISSED_KEY = 'admin.preview.dismissed';

function clearAdminPreviewSession() {
  if (typeof window === 'undefined') return;

  sessionStorage.removeItem(ADMIN_PREVIEW_ACTIVE_KEY);
  sessionStorage.removeItem(ADMIN_PREVIEW_RETURN_TO_KEY);
  sessionStorage.removeItem(ADMIN_PREVIEW_DISMISSED_KEY);
}

function getSafeAdminRedirect(redirectTo?: string | null): string {
  if (!redirectTo) {
    return '/admin/dashboard';
  }

  try {
    const decodedRedirect = decodeURIComponent(redirectTo);

    /**
     * Segurança:
     * - só permite rotas internas do painel;
     * - impede voltar para /acesso;
     * - impede URL externa;
     * - impede redirecionar para login/acesso novamente.
     */
    if (
      decodedRedirect.startsWith('/admin/') &&
      !decodedRedirect.startsWith('/admin/login') &&
      !decodedRedirect.startsWith('/acesso') &&
      !decodedRedirect.startsWith('//')
    ) {
      return decodedRedirect;
    }

    return '/admin/dashboard';
  } catch {
    return '/admin/dashboard';
  }
}

export function AuthProvider({
  children,
  initialAdmin = null,
  skipInitialFetch = false,
}: AuthProviderProps) {
  const [admin, setAdmin] = useState<Admin | null>(initialAdmin);
  const [loading, setLoading] = useState(!initialAdmin && !skipInitialFetch);

  const router = useRouter();

  useEffect(() => {
    if (skipInitialFetch || initialAdmin) {
      setLoading(false);
      return;
    }

    let mounted = true;

    api
      .get<Admin>('/auth/me')
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
  }, [initialAdmin, skipInitialFetch]);

  const login = useCallback(
    async (email: string, password: string, redirectTo?: string | null) => {
      await api.post('/auth/login', {
        email,
        password,
      });

      const me = await api.get<Admin>('/auth/me');

      setAdmin(me);

      const safeRedirect = getSafeAdminRedirect(redirectTo);

      router.push(safeRedirect);
      router.refresh();
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearAdminPreviewSession();

      setAdmin(null);
      router.push('/');
      router.refresh();
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        login,
        logout,
        setAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro do AuthProvider');
  }

  return ctx;
}
