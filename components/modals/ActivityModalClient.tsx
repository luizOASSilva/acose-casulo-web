'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import ActivityDetail from '@/components/ui/ActivityDetail';
import type { Activity } from '@/types/activity';
import { getActivityBySlug } from '@/services/activities';

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
    let isMounted = true;

    async function loadClientActivity() {
      if (!activity) {
        setCurrentActivity(null);
        return;
      }

      setCurrentActivity(activity);

      if (!activity.slug) return;

      const clientActivity = await getActivityBySlug(activity.slug);

      if (!isMounted) return;

      if (clientActivity) {
        setCurrentActivity(clientActivity);
      }
    }

    loadClientActivity();

    return () => {
      isMounted = false;
    };
  }, [activity]);

  const handleActivityLikeChange = (updatedActivity: Activity) => {
    setCurrentActivity(updatedActivity);
  };

  const handleClose = () => {
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
