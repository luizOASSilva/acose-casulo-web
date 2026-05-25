'use client';

import { useRouter } from 'next/navigation';
import { Trash2, Edit3 } from 'lucide-react';

import ActivityCard from '@/components/ui/ActivityCard';
import Reveal from '@/components/animations/Reveal';

import { Activity } from '@/types/activity';
import { deleteActivity } from '@/services/activities';
import { useConfirmDialog } from '@/context/ConfirmDialogContext';

interface ActivityListContainerProps {
  activities: Activity[];
  isAdmin?: boolean;
}

export default function ActivityListContainer({
  activities,
  isAdmin = false,
}: ActivityListContainerProps) {
  const router = useRouter();
  const { confirm } = useConfirmDialog();

  const safeActivities = Array.isArray(activities) ? activities : [];

  const handleDelete = async (activityId: number) => {
    const confirmed = await confirm({
      title: 'Remover atividade?',
      description:
        'Essa atividade será removida do sistema. Essa ação não pode ser desfeita.',
      confirmText: 'Remover atividade',
      cancelText: 'Cancelar',
      variant: 'danger',
    });

    if (!confirmed) return;

    const success = await deleteActivity(activityId);

    if (success) {
      router.refresh();
      return;
    }

    await confirm({
      title: 'Erro ao remover',
      description:
        'Não foi possível remover a atividade agora. Tente novamente em alguns instantes.',
      confirmText: 'Entendi',
      cancelText: 'Fechar',
      variant: 'default',
    });
  };

  return (
    <main className="w-full max-w-6xl mx-auto py-12 md:py-20 px-6">
      <header className="mb-10 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
          {isAdmin
            ? 'Painel de Controle de Atividades'
            : 'Atividades do Centro Dia'}
        </h1>

        {isAdmin && (
          <p className="text-sm text-gray-600 bg-emerald-50 px-3 py-1.5 rounded-lg inline-block border border-emerald-100">
            Painel conectado ao banco de dados. Alterações são refletidas em tempo real.
          </p>
        )}
      </header>

      <Reveal>
        <div className="space-y-8">
          {isAdmin && (
            <button
              type="button"
              onClick={() => router.push('/admin/atividades/novo')}
              className="
                w-full min-h-[245px]
                flex items-center justify-center
                border border-dashed border-gray-300
                rounded-2xl
                hover:border-orange-400
                hover:bg-orange-50/50
                transition-colors
                group
              "
            >
              <div className="flex flex-col items-center gap-4 text-center p-8">
                <div
                  className="
                    w-16 h-16 rounded-full
                    bg-orange-100 text-orange-600
                    flex items-center justify-center
                    text-5xl font-extralight
                    transition-transform
                    group-hover:scale-110
                  "
                >
                  +
                </div>

                <div className="space-y-1">
                  <p className="text-lg font-semibold text-gray-800">
                    Criar Nova Atividade
                  </p>

                  <p className="text-sm text-gray-600 max-w-xs">
                    Publique uma nova atividade direto no sistema.
                  </p>
                </div>
              </div>
            </button>
          )}

          {safeActivities.length === 0 ? (
            !isAdmin && (
              <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
                <p className="text-gray-600">Nenhuma atividade cadastrada.</p>
              </div>
            )
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {safeActivities.map((activity) => (
                <li
                  key={activity.id}
                  className="
                    relative group
                    bg-white
                    rounded-2xl
                    overflow-hidden
                    shadow-sm
                    border border-gray-100
                    transition-all
                    hover:-translate-y-1
                    hover:shadow-md
                    cursor-pointer
                  "
                  onClick={() =>
                    isAdmin && router.push(`/admin/atividades/${activity.id}`)
                  }
                >
                  <div className="pointer-events-none">
                    <ActivityCard activity={activity} />
                  </div>

                  {isAdmin && (
                    <div
                      className="
                        absolute top-4 right-4
                        flex items-center gap-2 z-20
                        opacity-100 md:opacity-0
                        translate-y-0 md:-translate-y-1
                        md:group-hover:opacity-100
                        md:group-hover:translate-y-0
                        transition-all duration-200
                      "
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/admin/atividades/${activity.id}/editar`)
                        }
                        className="
                          w-10 h-10
                          flex items-center justify-center
                          rounded-xl
                          bg-gray-100
                          text-gray-600
                          border border-gray-200
                          shadow-md
                          transition-all
                          hover:bg-orange-500
                          hover:text-white
                          hover:border-orange-500
                          hover:shadow-lg
                          active:scale-95
                        "
                        title="Editar Atividade"
                        aria-label="Editar atividade"
                      >
                        <Edit3 className="w-5 h-5" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(activity.id)}
                        className="p-2.5 text-red-500 bg-gray-100 hover:bg-red-500 hover:text-white rounded-xl transition-all active:scale-95"
                        title="Deletar Atividade"
                        aria-label="Deletar atividade"
                      >
                        <Trash2 className="w-5 h-5" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Reveal>
    </main>
  );
}
