'use client';

import { useRouter } from 'next/navigation';
import ActivityDetail from '@/components/ui/ActivityDetail';
import type { Activity } from '@/types/activity';

export default function ActivityModalClient({
  activity,
}: {
  activity: Activity | null;
}) {
  const router = useRouter();

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
