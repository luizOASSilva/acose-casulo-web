'use client';

import { useState } from 'react';
import { X, Heart, Calendar, Clock, ImageIcon } from 'lucide-react';
import Image from 'next/image';

import type { Activity } from '@/types/activity';
import { useModalEffects } from '@/hooks/useModalEffects';
import { toggleActivityLike } from '@/services/activities';
import { formatSchedule } from '@/utils/activitySchedule';

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
  const [likes, setLikes] = useState(activity.likes ?? 0);
  const [isLiked, setIsLiked] = useState(activity.is_liked ?? false);
  const [isLiking, setIsLiking] = useState(false);

  useModalEffects(true, onClose);

  const imageUrl = activity.media?.url;
  const imageAlt =
    activity.media?.alt_text || `Imagem da atividade ${activity.title}`;

  const likeLabel = isLiked ? 'Remover curtida' : 'Curtir atividade';

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);

    const response = await toggleActivityLike(activity.id);

    setIsLiking(false);

    if (!response) return;

    setIsLiked(response.liked);
    setLikes(response.likes);
  };

  const schedules = activity.schedules ?? [];

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

      <div className="relative z-10 flex w-full flex-col bg-white shadow-2xl rounded-t-[2.5rem] sm:rounded-md sm:max-w-2xl max-h-[92svh] sm:max-h-[85vh]">
        <div className="relative h-48 w-full shrink-0 sm:h-64 bg-gray-100 rounded-t-[2.5rem] sm:rounded-t-md overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 768px"
              className="object-cover"
              loading="eager"
              priority
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-400">
              <ImageIcon className="h-8 w-8" aria-hidden="true" />
              <span className="text-xs font-medium">Sem imagem</span>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="absolute right-4 top-4 z-20 rounded-full bg-white/90 p-2 text-gray-800 shadow-md transition-transform hover:bg-white active:scale-95 cursor-pointer"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-10 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
          <div className="mx-auto max-w-4xl">
            <header className="mb-6">
              <h2
                id="modal-title"
                className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl"
              >
                {activity.title || 'Sem título'}
              </h2>

              {schedules.length > 0 ? (
                <div
                  className="flex flex-wrap gap-3"
                  role="group"
                  aria-label="Informações da atividade"
                >
                  {schedules.map((schedule, index) => {
                    const formatted = formatSchedule(schedule);

                    return (
                      <div
                        key={
                          schedule.id ??
                          `${schedule.weekday}-${schedule.start_time}-${schedule.end_time}-${index}`
                        }
                        className="flex flex-wrap gap-3"
                      >
                        <div className="flex items-center gap-2 rounded-md bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700 border border-orange-100">
                          <Calendar size={14} aria-hidden="true" />
                          <span>{formatted.day}</span>
                        </div>

                        <div className="flex items-center gap-2 rounded-md bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700 border border-orange-100">
                          <Clock size={14} aria-hidden="true" />
                          <span>{formatted.time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  className="flex flex-wrap gap-3"
                  role="group"
                  aria-label="Informações da atividade"
                >
                  <div className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-1 text-sm font-semibold text-gray-500 border border-gray-100">
                    <Calendar size={14} aria-hidden="true" />
                    <span>Horário não informado</span>
                  </div>
                </div>
              )}
            </header>

            <article
              id="modal-description"
              className="border-b border-gray-100 pb-8 text-gray-600 leading-relaxed"
            >
              <h2 className="sr-only">Descrição da atividade</h2>

              {(activity.content || 'Sem conteúdo.')
                .split('\n')
                .filter((paragraph) => paragraph.trim())
                .map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
            </article>

            <div className="mt-8 flex flex-col items-center justify-between gap-6 pb-4 sm:flex-row sm:pb-0">
              <p className="text-sm font-medium text-gray-500">
                <span className="font-bold text-orange-600">{likes}</span>{' '}
                pessoas curtiram
              </p>

              <button
                type="button"
                onClick={handleLike}
                disabled={isLiking}
                aria-label={likeLabel}
                aria-pressed={isLiked}
                className={`
                  flex w-full items-center justify-center gap-3 rounded-md border-2 px-8 py-3.5 font-bold transition-all active:scale-95 sm:w-auto cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed
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

                {isLiking ? 'Aguarde...' : likeLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
