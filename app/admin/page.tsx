'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LogoLoader from '@/components/ui/LogoLoader';

export default function Admin() {
  const { admin, loading } = useAuth();
  const router = useRouter();

  console.log('passei aqui', admin);

  useEffect(() => {
    if (!loading && !admin) {
      router.replace('/');
    }
  }, [admin, loading, router]);

  if (loading || !admin) return <LogoLoader />;

  return (
    <div>
      <h1>Admin visível apenas depois do login</h1>
    </div>
  );
}