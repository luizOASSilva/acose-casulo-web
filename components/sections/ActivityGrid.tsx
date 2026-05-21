'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { getActivities } from '@/services/activities';
import ActivityCard from '@/components/ui/ActivityCard';
import Reveal from '@/components/animations/Reveal';
import type { Activity } from '@/types/activity';

export default function ActivityGrid() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadActivities() {
      setIsLoading(true);

      const data = await getActivities();

      if (isMounted) {
        setActivities(data);
        setIsLoading(false);
      }
    }

    loadActivities();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handleActivityLikeChanged(event: Event) {
      const customEvent = event as CustomEvent<Activity>;
      const updatedActivity = customEvent.detail;

      setActivities((currentActivities) =>
        currentActivities.map((activity) =>
          activity.id === updatedActivity.id ||
          activity.slug === updatedActivity.slug
            ? {
                ...activity,
                ...updatedActivity,
                likes: updatedActivity.likes_count ?? updatedActivity.likes ?? 0,
                likes_count:
                  updatedActivity.likes_count ?? updatedActivity.likes ?? 0,
                liked: updatedActivity.liked ?? updatedActivity.is_liked ?? false,
                is_liked:
                  updatedActivity.is_liked ?? updatedActivity.liked ?? false,
              }
            : activity
        )
      );
    }

    window.addEventListener('activity-like-changed', handleActivityLikeChanged);

    return () => {
      window.removeEventListener(
        'activity-like-changed',
        handleActivityLikeChanged
      );
    };
  }, []);

  if (isLoading) {
    return (
      <section aria-labelledby="activities-title">
        <h2 id="activities-title" className="sr-only">
          Lista de atividades
        </h2>

        <p className="text-gray-600 italic">Carregando atividades...</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="activities-title">
      <h2 id="activities-title" className="sr-only">
        Lista de atividades
      </h2>

      {activities.length > 0 ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((activity, index) => (
            <Reveal key={activity.id} delay={index * 0.1}>
              <li>
                <Link
                  href={`/atividades/${activity.slug}`}
                  className="
                    group
                    block
                    rounded-md
                    transition-transform
                    duration-200
                    hover:-translate-y-1
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-primary
                  "
                  aria-label={`Ver detalhes da atividade ${activity.title}`}
                >
                  <ActivityCard activity={activity} />
                </Link>
              </li>
            </Reveal>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600 italic">Nenhuma atividade encontrada.</p>
      )}
    </section>
  );
}
