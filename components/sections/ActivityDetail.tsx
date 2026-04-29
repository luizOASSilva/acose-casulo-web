"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Heart, Calendar, Clock } from "lucide-react";
import type { Activity } from "@/types/activity";

interface ActivityModalProps {
  id?: string;
  activity: Activity;
  onClose: () => void;
}

export default function ActivityDetail({ id, activity, onClose }: ActivityModalProps) {
  const [likes, setLikes] = useState(activity.likes);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleLike = async () => {
    const newLikes = isLiked ? likes - 1 : likes + 1;
    setLikes(newLikes);
    setIsLiked(!isLiked);
  };

  return (
    <div
      id={id}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >

      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm w-full h-full border-none cursor-default"
        onClick={onClose}
        aria-label="Fechar modal"
        tabIndex={-1}
      />

      <div className="relative bg-white w-full h-[92vh] sm:h-auto sm:max-w-3xl rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col transition-all duration-300">
        
        <div className="relative w-full h-48 sm:h-64 flex-shrink-0">
          <Image
            src={activity.media.url}
            alt={activity.media.alt_text || activity.title}
            fill
            className="object-cover"
            priority
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2.5 shadow-md active:scale-90 transition-transform cursor-pointer z-20"
          >
            <X size={24} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-10">
          <div className="max-w-4xl mx-auto">
            <header className="mb-6">
              <h2 id="modal-title" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {activity.title}
              </h2>
              
              <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm font-semibold mb-6">
                <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-xl border border-orange-100">
                  <Calendar size={16} />
                  <span>Segunda a Sexta</span>
                </div>
                <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-xl border border-orange-100">
                  <Clock size={16} />
                  <span>08h - 11h</span>
                </div>
              </div>
            </header>

            <article className="text-gray-600 leading-relaxed text-sm sm:text-base border-b border-gray-100 pb-8">
              {activity.content.split("\n").filter(p => p.trim() !== "").map((p, i) => (
                <p key={i} className="mb-4 last:mb-0">
                  {p}
                </p>
              ))}
            </article>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 pb-4 sm:pb-0">
              <div className="text-gray-500 text-sm font-medium text-center sm:text-left">
                <span className="text-orange-600 font-bold">{likes}</span> pessoas curtiram esta atividade
              </div>

              <button
                onClick={handleLike}
                className={`
                  w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 rounded-2xl border-2 transition-all duration-300 active:scale-95 cursor-pointer font-bold text-base
                  ${isLiked 
                    ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200' 
                    : 'bg-white border-gray-200 text-gray-700 hover:border-orange-500 hover:text-orange-600'}
                `}
              >
                <Heart 
                  size={22} 
                  fill={isLiked ? "currentColor" : "none"} 
                  className={isLiked ? "animate-pulse" : ""}
                />
                {isLiked ? "Curtido" : "Curtir atividade"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}