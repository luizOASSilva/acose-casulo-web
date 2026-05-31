import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import AdminShell from '@/components/admin/AdminShell';
import { getCurrentAdmin } from '@/services/admin/settings';
import { getPublicSettings } from '@/services/public-settings';

export const dynamic = 'force-dynamic';

const PANEL_SLUG = process.env.PANEL_SLUG ?? '';

function getAdminAccessUrl(): string {
  if (!PANEL_SLUG) {
    return '/';
  }

  return `/acesso/${PANEL_SLUG}`;
}

function sanitizeCurrentPath(currentPath: string | null): string | null {
  if (!currentPath) {
    return null;
  }

  if (!currentPath.startsWith('/admin/')) {
    return null;
  }

  if (currentPath.includes('/acesso/')) {
    return null;
  }

  return currentPath;
}

function getAccessRedirectPath(currentPath: string | null): string {
  const accessUrl = getAdminAccessUrl();
  const safeCurrentPath = sanitizeCurrentPath(currentPath);

  if (!safeCurrentPath) {
    return accessUrl;
  }

  return `${accessUrl}?redirect=${encodeURIComponent(safeCurrentPath)}`;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const headersList = await headers();

  const cookieHeader = cookieStore.toString();
  const currentPath = headersList.get('x-current-path');

  const [currentAdmin, publicSettings] = await Promise.all([
    getCurrentAdmin(cookieHeader),
    getPublicSettings(),
  ]);

  if (!currentAdmin) {
    redirect(getAccessRedirectPath(currentPath));
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
