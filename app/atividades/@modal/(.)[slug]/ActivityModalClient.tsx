"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import ActivityDetail from "@/components/sections/ActivityDetail";
import { activities } from "../../activity";

export default function ActivityModalClient({
  params,
}: {
  params: Promise<{ slug: string }>; 
}) {
  const router = useRouter();
  const { slug } = use(params); 

  const activity = activities.find((a) => a.slug === slug) || null;

  if (!activity) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white p-6 rounded-2xl shadow-xl text-center">
          <p className="font-bold text-gray-900">Atividade não encontrada!</p>
          <button 
            onClick={() => router.back()} 
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
      activity={activity} 
      onClose={() => router.back()} 
    />
  );
}