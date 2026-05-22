import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import AdminShell from '@/components/admin/AdminShell';
import { getCurrentAdmin } from '@/services/admin/settings';
import { getPublicSettings } from '@/services/public-settings';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const [currentAdmin, publicSettings] = await Promise.all([
    getCurrentAdmin(cookieHeader),
    getPublicSettings(),
  ]);

  if (!currentAdmin) {
    redirect('/');
  }

  return (
    <AdminShell
      currentAdmin={currentAdmin}
      logoUrl={publicSettings.site_logo_url || '/logo.svg'}
    >
      {children}
    </AdminShell>
  );
}
