'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

import UserBadge from '@/components/ui/UserBadge';

import {
  Activity,
  ChevronLeft,
  ChevronRight,
  FileText,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Settings,
  HandHeart,
  ShieldCheck,
} from 'lucide-react';

import { cn } from '@/lib/cn';
import { useAuth } from '@/context/AuthContext';
import type { AdminUser } from '@/types/settings';

const nav = [
  { label: 'Dashboard', href: 'dashboard', icon: LayoutDashboard },
  { label: 'Doações', href: 'doacoes', icon: HandHeart },
  { label: 'Parceiros', href: 'parceiros', icon: HeartHandshake },
  { label: 'Transparência', href: 'transparencia', icon: ShieldCheck },
  { label: 'Atividades', href: 'atividades', icon: Activity },
  { label: 'Artigos', href: 'artigos', icon: FileText },
  { label: 'Configurações', href: 'configuracoes', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
  currentAdmin?: AdminUser;
  logoUrl?: string;
}

export function AdminSidebar({
  collapsed,
  toggleSidebar,
  currentAdmin,
  logoUrl = '/logo.svg',
}: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userName = currentAdmin?.name ?? 'Admin';
  const userSubtitle =
    currentAdmin?.role === 'master' ? 'Master' : 'Administrador';

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setMobileOpen(false);
    }

    window.addEventListener('keydown', handleKey);

    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-60 flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-sm lg:hidden"
        aria-label="Abrir menu administrativo"
      >
        <Menu size={18} />
      </button>

      {mobileOpen && (
        <div
          role="presentation"
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-70 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-80 flex h-screen flex-col
        bg-white transition-[width,transform] duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:sticky lg:top-0 lg:shrink-0
          ${collapsed ? 'w-22' : 'w-65'}
        `}
      >
        <div
          className={`flex items-center justify-center transition-all duration-300 ${
            collapsed ? 'h-16 py-0' : 'h-20 py-5'
          }`}
        >
          <Link
            href="/admin/dashboard"
            aria-label="Ir para o dashboard administrativo"
            className="inline-flex items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Image
              src={logoUrl}
              alt="Acose Casulo"
              width={collapsed ? 55 : 125}
              height={collapsed ? 55 : 75}
              className="transition-all duration-300"
              priority
            />
          </Link>
        </div>

        <div className="flex h-16 shrink-0 items-center border-b border-zinc-200 px-4">
          <div
            className={cn(
              'flex w-full items-center overflow-hidden',
              collapsed ? 'justify-center' : 'justify-between'
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              {!collapsed && (
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    Centro Dia
                  </p>

                  <p className="text-xs text-zinc-500">CMS</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  toggleSidebar();
                }}
                className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 lg:flex"
                aria-label={
                  collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'
                }
              >
                {collapsed ? (
                  <ChevronRight size={24} />
                ) : (
                  <ChevronLeft size={24} />
                )}
              </button>

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="ml-2 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 lg:hidden"
                aria-label="Fechar menu administrativo"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        <nav
          className="flex-1 space-y-1 overflow-y-auto p-3"
          aria-label="Navegação administrativa"
        >
          {nav.map(({ label, href, icon: Icon }) => {
            const fullHref = `/admin/${href}`;
            const active =
              pathname === fullHref || pathname.startsWith(`${fullHref}/`);

            return (
              <Link
                key={href}
                href={fullHref}
                title={collapsed ? label : undefined}
                aria-current={active ? 'page' : undefined}
                className={`
                  flex items-center rounded-md py-3 text-sm font-medium
                  transition-all duration-200 overflow-hidden
                  ${
                    collapsed
                      ? 'lg:mx-auto lg:h-12 lg:w-12 lg:justify-center lg:px-0'
                      : 'gap-3 px-3'
                  }
                  ${
                    active
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                  }
                `}
              >
                <Icon size={20} className="shrink-0" aria-hidden="true" />

                <span className={`truncate ${collapsed ? 'lg:hidden' : ''}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto shrink-0 border-t border-zinc-200 bg-zinc-50/50 p-3">
          <div
            className={`flex items-center ${
              collapsed ? 'justify-center' : 'justify-between gap-2'
            }`}
          >
            <div className="min-w-0">
              {collapsed ? (
                <div title={userName} className="flex justify-center">
                  <UserBadge name={userName} size="sm" compact />
                </div>
              ) : (
                <UserBadge
                  name={userName}
                  subtitle={userSubtitle}
                  size="md"
                />
              )}
            </div>

            <button
              type="button"
              onClick={logout}
              title={collapsed ? 'Sair' : 'Sair do painel'}
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600"
              aria-label="Sair do painel administrativo"
            >
              <LogOut size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
