'use client';

import { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar'; // Ajuste o caminho conforme seu projeto
import { EditModeProvider } from '@/context/admin/EditModeContext'; // Ajuste o caminho

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <EditModeProvider>
      <div className="flex min-h-screen bg-[#f5f7fa]">      
        <AdminSidebar 
          collapsed={collapsed} 
          toggleSidebar={() => setCollapsed(!collapsed)} 
        />
        <main className="flex-1 w-full min-w-0 pt-16 lg:pt-0">
          {children}
        </main>     
      </div>
    </EditModeProvider>
  );
}
