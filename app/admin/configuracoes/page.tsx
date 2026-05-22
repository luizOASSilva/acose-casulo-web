import { cookies } from 'next/headers';

import ClientSettings from '@/components/admin/ClientSettings';

import {
  getAdmins,
  getCurrentAdmin,
  getSettings,
} from '@/services/admin/settings';

export const dynamic = 'force-dynamic';

export default async function AdminConfiguracoesPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const [currentAdmin, admins, settings] = await Promise.all([
    getCurrentAdmin(cookieHeader),
    getAdmins(cookieHeader),
    getSettings(cookieHeader),
  ]);

  return (
    <ClientSettings
      currentAdmin={currentAdmin}
      initialAdmins={admins}
      initialSettings={settings}
    />
  );
}
