import ClientSettings from '@/components/admin/ClientSettings';

import {
  getAdmins,
  getCurrentAdmin,
  getSettings,
} from '@/services/admin/settings';

export default async function AdminConfiguracoesPage() {
  const [currentAdmin, admins, settings] = await Promise.all([
    getCurrentAdmin(),
    getAdmins(),
    getSettings(),
  ]);

  return (
    <ClientSettings
      currentAdmin={currentAdmin}
      initialAdmins={admins}
      initialSettings={settings}
    />
  );
}
