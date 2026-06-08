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

function htmlToPlainText(value?: string | null): string {
  if (!value) return '';

  return value
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<\/h[1-6]>/gi, ' ')
    .replace(/<\/li>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function getActivityExcerpt(content?: string | null): string {
  const plainText = htmlToPlainText(content);

  if (!plainText) return 'Sem descrição disponível.';

  return plainText;
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  const imageUrl = activity.media?.url;
  const imageAlt =
    activity.media?.alt_text || `Imagem da atividade ${activity.title}`;

  const description = getActivityExcerpt(activity.content);

  const likes = getActivityLikes(activity);
  const isLiked = getActivityLiked(activity);

  return (
    <article
      className="group flex h-95 flex-col overflow-hidden rounded-md border border-gray-100 bg-white transition-shadow hover:shadow-lg"
      aria-labelledby={`activity-title-${activity.id}`}
      aria-describedby={`activity-desc-${activity.id}`}
    >
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-gray-100">
        {imageUrl ? (
          <Image
            loading="eager"
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-400">
            <ImageIcon className="h-8 w-8" aria-hidden="true" />

            <span className="text-xs font-medium">Sem imagem</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col space-y-3 overflow-hidden p-5">
        <h3
          id={`activity-title-${activity.id}`}
          className="line-clamp-2 text-base font-semibold leading-snug text-gray-900 transition-colors group-hover:text-primary"
        >
          {activity.title || 'Sem título'}
        </h3>

        <p
          id={`activity-desc-${activity.id}`}
          className="line-clamp-3 flex-1 text-sm leading-relaxed text-gray-700"
        >
          {description}
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
                ? 'text-xs font-bold text-orange-600'
                : 'text-xs font-medium text-gray-600'
            }
          >
            {likes}
          </span>
        </div>
      </div>
    </article>
  );
}
