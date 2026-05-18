'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import UserBadge from '@/components/ui/UserBadge';

import {
  Activity,       // Ajustado para o nome padrão do Lucide
  ChevronLeft,
  ChevronRight,
  FileText,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Settings,
  HandHeart,      // Adicionado para Doações
  Files,          // Adicionado para Documentos
} from 'lucide-react';
import { cn } from '@/lib/cn';

const nav = [
  { label: 'Dashboard', href: 'dashboard', icon: LayoutDashboard },
  { label: 'Doações', href: 'doacoes', icon: HandHeart },
  { label: 'Parceiros', href: 'parceiros', icon: HeartHandshake },
  { label: 'Documentos', href: 'documentos', icon: Files },
  { label: 'Atividades', href: 'atividades', icon: Activity },
  { label: 'Artigos', href: 'artigos', icon: FileText },
  { label: 'Configurações', href: 'configuracoes', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

export function AdminSidebar({ collapsed, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const { admin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userName = admin?.name ?? 'Admin';

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false);
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
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-[60] flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-sm lg:hidden"
      >
        <Menu size={18} />
      </button>

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-70 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-[80] flex h-screen flex-col
          border-r border-zinc-200 bg-white
          transition-[width,transform] duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:sticky lg:top-0 lg:shrink-0
          ${collapsed ? 'w-[88px]' : 'w-[260px]'}
        `}  
      >
        <div className={`flex items-center justify-center transition-all duration-300
          ${collapsed ? 'h-16 py-0' : 'h-20 py-5'}
        `}>
          <Image
            src="/logo.svg"
            alt="logo"
            width={collapsed ? 55 : 125}
            height={collapsed ? 55 : 75}
            className="transition-all duration-300"
          />
        </div>
        <div className="flex h-16 shrink-0 items-center border-b border-zinc-200 px-4">
          <div className={cn("flex w-full items-center overflow-hidden", collapsed ? "justify-center" : "justify-between")}>
            <div className="flex items-center gap-3 min-w-0">
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
                onClick={(e) => {
                  e.preventDefault();
                  toggleSidebar();
                }}
                type="button"
                className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 lg:flex"
              >
                {collapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
              </button>

              <button
                onClick={() => setMobileOpen(false)}
                className="ml-2 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 lg:hidden"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {nav.map(({ label, href, icon: Icon }) => {
            const active = pathname === `/admin/${href}`;
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`
                  flex items-center rounded-xl py-3 text-sm font-medium
                  transition-all duration-200 overflow-hidden
                  ${collapsed ? 'lg:justify-center lg:px-0 lg:h-12 lg:w-12 lg:mx-auto' : 'px-3 gap-3'}
                  ${
                    active
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                  }
                `}
              >
                <Icon size={20} className="shrink-0" />
                <span className={`truncate ${collapsed ? 'lg:hidden' : ''}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="border-t border-zinc-200 p-3 bg-zinc-50/50 shrink-0 mt-auto">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between gap-2'}`}>
            <div className="min-w-0">
              {collapsed ? (
                <div title={userName} className="flex justify-center">
                  <UserBadge name={userName} size="sm" compact />
                </div>
              ) : (
                <UserBadge
                  name={userName}
                  subtitle="Administrador"
                  size="md"
                />
              )}
            </div>

            {!collapsed && (
              <button
                onClick={logout}
                title="Sair do painel"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0"
              >
                <LogOut size={18} />
              </button>
            )}

            {collapsed && (
              <button
                onClick={logout}
                title="Sair"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
