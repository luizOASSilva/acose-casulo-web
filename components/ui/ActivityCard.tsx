'use client';

import Image from 'next/image';
import { Heart, ImageIcon } from 'lucide-react';
import type { Activity } from '@/types/activity';

interface ActivityCardProps {
  activity: Activity;
}

function getActivityLikes(activity: Activity): number {
  return Number(activity.likes_count ?? activity.likes ?? 0);
}

function getActivityLiked(activity: Activity): boolean {
  return Boolean(activity.is_liked ?? activity.liked ?? false);
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  const imageUrl = activity.media?.url;
  const imageAlt =
    activity.media?.alt_text || `Imagem da atividade ${activity.title}`;

  const firstParagraph =
    activity.content?.split('\n\n')[0] || 'Sem descrição disponível.';

  const likes = getActivityLikes(activity);
  const isLiked = getActivityLiked(activity);

  return (
    <article
      className="group flex flex-col rounded-md border border-gray-100 bg-white overflow-hidden hover:shadow-lg transition-shadow h-95"
      aria-labelledby={`activity-title-${activity.id}`}
      aria-describedby={`activity-desc-${activity.id}`}
    >
      <div className="relative w-full aspect-video overflow-hidden shrink-0 bg-gray-100">
        {imageUrl ? (
          <Image
            loading="eager"
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-400">
            <ImageIcon className="h-8 w-8" aria-hidden="true" />
            <span className="text-xs font-medium">Sem imagem</span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5 space-y-3 overflow-hidden">
        <h3
          id={`activity-title-${activity.id}`}
          className="text-base font-semibold text-gray-900 leading-snug group-hover:text-primary transition-colors line-clamp-2"
        >
          {activity.title || 'Sem título'}
        </h3>

        <p
          id={`activity-desc-${activity.id}`}
          className="text-sm text-gray-700 leading-relaxed line-clamp-3 flex-1"
        >
          {firstParagraph}
        </p>

        <div className="flex items-center gap-1.5 pt-1">
          <Heart
            size={14}
            aria-hidden="true"
            fill={isLiked ? 'currentColor' : 'none'}
            className={isLiked ? 'text-orange-600' : 'text-primary'}
          />

          <span
            className={
              isLiked
                ? 'text-xs text-orange-600 font-bold'
                : 'text-xs text-gray-600 font-medium'
            }
          >
            {likes}
          </span>
        </div>
      </div>
    </article>
  );
}
