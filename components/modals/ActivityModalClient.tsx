'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import ActivityDetail from '@/components/ui/ActivityDetail';
import type { Activity } from '@/types/activity';

export default function ActivityModalClient({
  activity,
}: {
  activity: Activity | null;
}) {
  const router = useRouter();
  const canGoBack = useRef(false);

  useEffect(() => {
    canGoBack.current = document.referrer.startsWith(window.location.origin);
  }, []);

  const handleClose = () => {
    if (canGoBack.current) {
      router.back();
    } else {
      window.location.href = '/atividades';
    }
  };

  if (!activity) {
    return (
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50">
        <div className="bg-white p-6 rounded-md shadow-xl text-center">
          <p className="font-bold text-gray-900">Atividade não encontrada!</p>

          <button
            type="button"
            onClick={handleClose}
            className="mt-4 text-primary underline font-medium"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return <ActivityDetail activity={activity} onClose={handleClose} />;
}
