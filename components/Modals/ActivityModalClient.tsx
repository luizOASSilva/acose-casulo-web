"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ActivityDetail from "@/components/sections/ActivityDetail";
import { getActivityBySlug } from "@/services/activities";
import type { Activity } from "@/types/activity";

export default function ActivityModalClient({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const { slug } = use(params);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActivityBySlug(slug).then((data) => {
      setActivity(data);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <p className="text-gray-500 animate-pulse">Carregando...</p>
        </div>
      </div>
    );
  }

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

  return <ActivityDetail activity={activity} onClose={() => router.back()} />;
}
