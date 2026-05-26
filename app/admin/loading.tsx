import LogoLoader from '@/components/ui/LogoLoader';

export default function AdminLoading() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center px-6 py-12">
      <LogoLoader fullScreen={false} />
    </main>
  );
}