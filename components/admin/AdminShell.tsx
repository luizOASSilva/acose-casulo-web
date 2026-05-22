'use client';

import { useState } from 'react';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AuthProvider } from '@/context/AuthContext';
import { EditModeProvider } from '@/context/admin/EditModeContext';
import { ConfirmDialogProvider } from '@/context/ConfirmDialogContext';

import type { AdminUser } from '@/types/settings';

interface AdminShellProps {
  children: React.ReactNode;
  currentAdmin: AdminUser;
  logoUrl?: string;
}

export default function AdminShell({
  children,
  currentAdmin,
  logoUrl = '/logo.svg',
}: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AuthProvider initialAdmin={currentAdmin} skipInitialFetch>
      <ConfirmDialogProvider>
        <EditModeProvider>
          <div className="flex min-h-screen bg-[#f5f7fa]">
            <AdminSidebar
              collapsed={collapsed}
              toggleSidebar={() => setCollapsed((current) => !current)}
              currentAdmin={currentAdmin}
              logoUrl={logoUrl}
            />

            <main className="flex-1 w-full min-w-0 pt-16 lg:pt-0">
              {children}
            </main>
          </div>
        </EditModeProvider>
      </ConfirmDialogProvider>
    </AuthProvider>
  );
}
