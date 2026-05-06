'use client';

import Image from 'next/image';
import { Heart } from 'lucide-react';
import type { Activity } from '@/types/activity';

interface ActivityCardProps {
  activity: Activity;
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <article
      className="group flex flex-col rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-lg transition-shadow h-95"
      aria-labelledby={`activity-title-${activity.id}`}
      aria-describedby={`activity-desc-${activity.id}`}
    >
      <div className="relative w-full aspect-video overflow-hidden shrink-0">
        <Image
          src={activity.media.url}
          alt={
            activity.media.alt_text || `Imagem da atividade ${activity.title}`
          }
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-col flex-1 p-5 space-y-3 overflow-hidden">
        <h3
          id={`activity-title-${activity.id}`}
          className="text-base font-semibold text-gray-900 leading-snug group-hover:text-primary transition-colors line-clamp-2"
        >
          {activity.title}
        </h3>

        <p
          id={`activity-desc-${activity.id}`}
          className="text-sm text-gray-500 leading-relaxed line-clamp-3 flex-1"
        >
          {activity.content.split('\n\n')[0]}
        </p>

        <div className="flex items-center gap-1.5 pt-1">
          <Heart size={14} aria-hidden="true" className="text-primary" />
          <span
            className="text-xs text-gray-400"
            aria-label={`${activity.likes} curtidas`}
          >
            {activity.likes}
          </span>
        </div>
      </div>
    </article>
  );
}
