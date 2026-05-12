'use client';

import { X, Heart, Calendar, Clock } from 'lucide-react';
import Image from 'next/image';
import { m, AnimatePresence } from 'framer-motion';
import type { Activity } from '@/types/activity';
import { useActivityActions } from '@/hooks/useActivityActions';

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
  const { likes, isLiked, handleLike, likeLabel } =
    useActivityActions(activity.likes);

  return (
    <AnimatePresence>
      <m.div
        id={id}
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        <m.div
          onClick={(e) => e.stopPropagation()}
          className="
            relative z-10
            flex flex-col
            w-full max-w-3xl
            max-h-[92vh]
            overflow-hidden
            bg-white
            shadow-2xl
            rounded-t-[2.5rem] sm:rounded-3xl
          "
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <div className="relative h-48 sm:h-64 w-full bg-gray-100 shrink-0">
            <Image
              src={activity.media?.url || ''}
              alt={activity.media?.alt_text || activity.title}
              fill
              className="object-cover"
              priority
            />

            <button
              onClick={onClose}
              className="
                absolute right-4 top-4 z-20
                rounded-full bg-white/90 p-2
                shadow-md hover:scale-105 transition
              "
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 sm:p-10">
            <div className="mx-auto max-w-4xl">
              <header className="mb-6">
                <h1 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">
                  {activity.title}
                </h1>

                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700 border border-orange-100">
                    <Calendar size={14} />
                    <span>Segunda a Sexta</span>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700 border border-orange-100">
                    <Clock size={14} />
                    <span>08h - 11h</span>
                  </div>
                </div>
              </header>

              <article className="border-b border-gray-100 pb-8 text-gray-600 leading-relaxed">
                {(activity.content || '')
                  .split('\n')
                  .filter(Boolean)
                  .map((p, i) => (
                    <p key={i} className="mb-4">
                      {p}
                    </p>
                  ))}
              </article>

              <div className="mt-8 flex flex-col items-center justify-between gap-6 sm:flex-row">
                <p className="text-sm font-medium text-gray-500">
                  <span className="font-bold text-orange-600">{likes}</span>{' '}
                  pessoas curtiram
                </p>

                <button
                  onClick={handleLike}
                  className={`
                    flex items-center gap-3 rounded-2xl border-2 px-8 py-3.5 font-bold transition
                    active:scale-95
                    ${
                      isLiked
                        ? 'border-orange-500 bg-orange-500 text-white'
                        : 'border-gray-200 text-gray-700 hover:border-orange-500'
                    }
                  `}
                >
                  <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                  {likeLabel}
                </button>
              </div>
            </div>
          </div>
        </m.div>
      </m.div>
    </AnimatePresence>
  );
}
