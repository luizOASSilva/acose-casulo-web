'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import ActivityDetail from '@/components/ui/ActivityDetail';
import type { Activity } from '@/types/activity';

export default function ActivityModalClient({
  activity,
}: {
  activity: Activity | null;
}) {
  const router = useRouter();
  const canGoBack = useRef(false);

  const [currentActivity, setCurrentActivity] = useState<Activity | null>(
    activity
  );

  useEffect(() => {
    canGoBack.current = document.referrer.startsWith(window.location.origin);
  }, []);

  useEffect(() => {
    setCurrentActivity(activity);
  }, [activity]);

  const handleActivityLikeChange = (updatedActivity: Activity) => {
    setCurrentActivity(updatedActivity);

    router.refresh();
  };

  const handleClose = () => {
    router.refresh();

    if (canGoBack.current) {
      router.back();
    } else {
      window.location.href = '/atividades';
    }
  };

  if (!currentActivity) {
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

  return (
    <ActivityDetail
      activity={currentActivity}
      onClose={handleClose}
      onActivityLikeChange={handleActivityLikeChange}
    />
  );
}
