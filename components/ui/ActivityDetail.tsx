'use client';

import { X, Heart, Calendar, Clock } from 'lucide-react';
import Image from 'next/image';
import type { Activity } from '@/types/activity';
import { useActivityActions } from '@/hooks/useActivityActions';
import { useModalEffects } from '@/hooks/useModalEffects';

interface ActivityModalProps {
  id?: string;
  activity: Activity;
  onClose: () => void;
}

export default function ActivityDetail({
  id,
  activity,
  onClose,
}: ActivityModalProps) {
  const { likes, isLiked, handleLike, likeLabel } = useActivityActions(
    activity.likes
  );

  useModalEffects(true, onClose);

  return (
    <div
      id={id}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 flex w-full flex-col bg-white shadow-2xl rounded-t-[2.5rem] sm:rounded-3xl sm:max-w-2xl max-h-[92svh] sm:max-h-[85vh]">
        <div className="relative h-48 w-full shrink-0 sm:h-64 bg-gray-100 rounded-t-[2.5rem] sm:rounded-t-3xl overflow-hidden">
          <Image
            src={activity.media?.url || ''}
            alt={
              activity.media?.alt_text ||
              `Imagem da atividade ${activity.title}`
            }
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 768px"
            className="object-cover"
            loading="eager"
            priority
          />

          <button
            onClick={onClose}
            aria-label="Fechar modal"
            className="absolute right-4 top-4 z-20 rounded-full bg-white/90 p-2 text-gray-800 shadow-md transition-transform hover:bg-white active:scale-95 cursor-pointer"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-10">
          <div className="mx-auto max-w-4xl">
            <header className="mb-6">
              <h1
                id="modal-title"
                className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl"
              >
                {activity.title}
              </h1>

              <section
                className="flex flex-wrap gap-3"
                aria-labelledby="activity-info-title"
              >
                <span id="activity-info-title" className="sr-only">
                  Informações da atividade
                </span>

                <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700 border border-orange-100">
                  <Calendar size={14} aria-hidden="true" />
                  <span>Segunda a Sexta</span>
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700 border border-orange-100">
                  <Clock size={14} aria-hidden="true" />
                  <span>08h - 11h</span>
                </div>
              </section>
            </header>

            <article
              id="modal-description"
              className="border-b border-gray-100 pb-8 text-gray-600 leading-relaxed"
            >
              {(activity.content || '')
                .split('\n')
                .filter((p) => p.trim())
                .map((p, i) => (
                  <p key={i} className="mb-4">
                    {p}
                  </p>
                ))}
            </article>

            <div className="mt-8 flex flex-col items-center justify-between gap-6 pb-4 sm:flex-row sm:pb-0">
              <p className="text-sm font-medium text-gray-500">
                <span className="font-bold text-orange-600">{likes}</span>{' '}
                pessoas curtiram
              </p>

              <button
                onClick={handleLike}
                aria-label={likeLabel}
                aria-pressed={isLiked}
                className={`
                  flex w-full items-center justify-center gap-3 rounded-2xl border-2 px-8 py-3.5 font-bold transition-all active:scale-95 sm:w-auto cursor-pointer
                  ${
                    isLiked
                      ? 'border-orange-500 bg-orange-500 text-white shadow-lg'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-orange-500'
                  }
                `}
              >
                <Heart
                  size={20}
                  aria-hidden="true"
                  fill={isLiked ? 'currentColor' : 'none'}
                  className={isLiked ? 'animate-pulse' : ''}
                />
                {likeLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
