import { Suspense } from 'react';

import Navbar from '@/components/layouts/navbar/Navbar';
import Footer from '@/components/layouts/Footer';
import AdminPreviewBar from '@/components/admin/AdminPreviewBar';

import { PublicSettingsProvider } from '@/context/PublicSettingsContext';
import { getPublicSettings } from '@/services/public-settings';

export const dynamic = 'force-dynamic';

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getPublicSettings();

  return (
    <PublicSettingsProvider settings={settings}>
      <Navbar />
      <div className="flex-1 pt-20">{children}</div>
      <Footer />

      <Suspense fallback={null}>
        <AdminPreviewBar />
      </Suspense>
    </PublicSettingsProvider>
  );
}
