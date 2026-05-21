'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Calendar, Clock, Plus, Trash2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

import type { Activity, ActivitySchedule, Weekday } from '@/types/activity';
import { createActivity, updateActivity } from '@/services/activities';
import { weekdayOptions } from '@/utils/activitySchedule';
import { activitySchema } from '@/schemas/activity.schema';

interface ActivityDetailsContainerProps {
  activity?: Activity;
  isAdmin?: boolean;
  startInEditMode?: boolean;
  isNew?: boolean;
}

type ActivityFormErrors = Partial<{
  title: string;
  content: string;
  image_url: string;
  image_description: string;
  image_caption: string;
  schedules: string;
}>;

type ScheduleErrors = Record<
  number,
  Partial<{
    weekday: string;
    start_time: string;
    end_time: string;
  }>
>;

const emptySchedule: ActivitySchedule = {
  weekday: 'monday',
  start_time: '08:00',
  end_time: '11:00',
};

function normalizeSchedules(activity?: Activity): ActivitySchedule[] {
  if (activity?.schedules && activity.schedules.length > 0) {
    return activity.schedules.map((schedule) => ({
      id: schedule.id,
      weekday: schedule.weekday,
      start_time: schedule.start_time?.slice(0, 5) || '08:00',
      end_time: schedule.end_time?.slice(0, 5) || '11:00',
    }));
  }

  return [{ ...emptySchedule }];
}

function fieldClass(error?: string, className = '') {
  return `
    ${className}
    ${
      error
        ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500/20'
        : 'border-gray-300 focus:border-gray-900'
    }
  `;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="text-[11px] font-medium text-red-600">{message}</p>;
}

export default function ActivityDetailsContainer({
  activity,
  isAdmin = false,
  startInEditMode = false,
  isNew = false,
}: ActivityDetailsContainerProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isEditMode, setIsEditMode] = useState(startInEditMode || isNew);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState<ActivityFormErrors>({});
  const [scheduleErrors, setScheduleErrors] = useState<ScheduleErrors>({});

  const [title, setTitle] = useState(activity?.title || '');
  const [content, setContent] = useState(activity?.content || '');
  const [imageUrl, setImageUrl] = useState(activity?.media?.url || '');
  const [imageAlt, setImageAlt] = useState(activity?.media?.alt_text || '');
  const [imageCaption, setImageCaption] = useState(
    activity?.media?.caption || ''
  );

  const [schedules, setSchedules] = useState<ActivitySchedule[]>(
    normalizeSchedules(activity)
  );

  useEffect(() => {
    if (!activity) return;

    setTitle(activity.title || '');
    setContent(activity.content || '');
    setImageUrl(activity.media?.url || '');
    setImageAlt(activity.media?.alt_text || '');
    setImageCaption(activity.media?.caption || '');
    setSchedules(normalizeSchedules(activity));
    setErrors({});
    setScheduleErrors({});
  }, [activity]);

  const initialSchedules = useMemo(() => {
    return normalizeSchedules(activity);
  }, [activity]);

  const hasPendingChanges = useMemo(() => {
    return (
      title !== (activity?.title || '') ||
      content !== (activity?.content || '') ||
      imageUrl !== (activity?.media?.url || '') ||
      imageAlt !== (activity?.media?.alt_text || '') ||
      imageCaption !== (activity?.media?.caption || '') ||
      JSON.stringify(schedules) !== JSON.stringify(initialSchedules)
    );
  }, [
    title,
    content,
    imageUrl,
    imageAlt,
    imageCaption,
    schedules,
    initialSchedules,
    activity,
  ]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasPendingChanges && isEditMode) {
        event.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasPendingChanges, isEditMode]);

  const clearError = (field: keyof ActivityFormErrors) => {
    setErrors((current) => {
      if (!current[field]) return current;

      const next = { ...current };
      delete next[field];

      return next;
    });
  };

  const clearScheduleError = (
    index: number,
    field?: keyof ScheduleErrors[number]
  ) => {
    setScheduleErrors((current) => {
      if (!current[index]) return current;

      const next = { ...current };

      if (field) {
        delete next[index]?.[field];

        if (Object.keys(next[index] || {}).length === 0) {
          delete next[index];
        }

        return next;
      }

      delete next[index];

      return next;
    });
  };

  const updateSchedule = (
    index: number,
    field: keyof ActivitySchedule,
    value: string
  ) => {
    setSchedules((current) =>
      current.map((schedule, scheduleIndex) =>
        scheduleIndex === index
          ? {
              ...schedule,
              [field]: value,
            }
          : schedule
      )
    );

    clearError('schedules');

    if (
      field === 'weekday' ||
      field === 'start_time' ||
      field === 'end_time'
    ) {
      clearScheduleError(index, field);
    }
  };

  const addSchedule = () => {
    setSchedules((current) => [...current, { ...emptySchedule }]);
    clearError('schedules');
  };

  const removeSchedule = (index: number) => {
    setSchedules((current) => {
      if (current.length === 1) return current;

      return current.filter((_, scheduleIndex) => scheduleIndex !== index);
    });

    setScheduleErrors((current) => {
      const next: ScheduleErrors = {};

      Object.entries(current).forEach(([key, value]) => {
        const oldIndex = Number(key);

        if (oldIndex < index) {
          next[oldIndex] = value;
        }

        if (oldIndex > index) {
          next[oldIndex - 1] = value;
        }
      });

      return next;
    });

    clearError('schedules');
  };

  const resetFields = () => {
    setTitle(activity?.title || '');
    setContent(activity?.content || '');
    setImageUrl(activity?.media?.url || '');
    setImageAlt(activity?.media?.alt_text || '');
    setImageCaption(activity?.media?.caption || '');
    setSchedules(normalizeSchedules(activity));
    setErrors({});
    setScheduleErrors({});
  };

  const confirmDiscard = (): boolean => {
    if (!hasPendingChanges) return true;

    return window.confirm(
      'Zezão, você tem alterações pendentes que não foram salvas! Deseja realmente descartar tudo?'
    );
  };

  const handleBack = () => {
    if (!confirmDiscard()) return;

    if (isNew) {
      router.push('/admin/atividades');
      return;
    }

    if (isEditMode) {
      router.push(`/admin/atividades/${activity?.id}`);
      return;
    }

    router.push('/admin/atividades');
  };

  const handleCancel = () => {
    if (!confirmDiscard()) return;

    if (isNew) {
      router.push('/admin/atividades');
      return;
    }

    setIsEditMode(false);
    resetFields();
    router.push(`/admin/atividades/${activity?.id}`);
  };

  const handleSave = async () => {
    const parsed = activitySchema.safeParse({
      title,
      content,
      image_url: imageUrl,
      image_description: imageAlt,
      image_caption: imageCaption.trim() || null,
      schedules: schedules.map((schedule) => ({
        weekday: schedule.weekday,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
      })),
    });

    if (!parsed.success) {
      const nextErrors: ActivityFormErrors = {};
      const nextScheduleErrors: ScheduleErrors = {};

      parsed.error.issues.forEach((issue) => {
        const [field, index, nestedField] = issue.path;

        if (field === 'schedules' && typeof index === 'number') {
          const key = nestedField as keyof ScheduleErrors[number] | undefined;

          if (key) {
            nextScheduleErrors[index] = {
              ...nextScheduleErrors[index],
              [key]: issue.message,
            };
          } else if (!nextErrors.schedules) {
            nextErrors.schedules = issue.message;
          }

          return;
        }

        if (field === 'schedules' && !nextErrors.schedules) {
          nextErrors.schedules = issue.message;
          return;
        }

        const errorField = field as keyof ActivityFormErrors | undefined;

        if (errorField && !nextErrors[errorField]) {
          nextErrors[errorField] = issue.message;
        }
      });

      setErrors(nextErrors);
      setScheduleErrors(nextScheduleErrors);
      return;
    }

    setErrors({});
    setScheduleErrors({});
    setIsSubmitting(true);

    const response = isNew
      ? await createActivity(parsed.data)
      : activity?.id
        ? await updateActivity(activity.id, parsed.data)
        : null;

    setIsSubmitting(false);

    if (response) {
      alert(
        isNew
          ? 'Atividade criada com sucesso! ✔'
          : 'Alterações salvas com sucesso! ✔'
      );

      router.push('/admin/atividades');
      router.refresh();
    } else {
      alert('Erro ao salvar atividade.');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-20 px-4 md:px-6 space-y-8">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          {isEditMode && hasPendingChanges
            ? '⚠️ Cancelar Alterações'
            : isEditMode
              ? '← Voltar para detalhes'
              : '← Voltar para atividades'}
        </button>

        {isAdmin && !isEditMode && !isNew && (
          <button
            type="button"
            onClick={() => router.push(`${pathname}/editar`)}
            className="text-xs bg-primary-light hover:bg-primary text-white font-semibold px-4 py-2 rounded-md transition-all cursor-pointer"
          >
            Editar Atividade
          </button>
        )}
      </div>

      {isEditMode && (
        <div className="bg-gray-50/70 p-5 rounded-md border border-gray-200/60 space-y-4">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            Mídia da Publicação
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">
                URL da Imagem
              </label>

              <input
                type="text"
                value={imageUrl}
                onChange={(event) => {
                  setImageUrl(event.target.value);
                  clearError('image_url');
                }}
                className={fieldClass(
                  errors.image_url,
                  'w-full text-xs bg-white border rounded-md px-3 py-2 focus:outline-none text-gray-700 font-mono'
                )}
                placeholder="https://..."
                maxLength={2048}
              />

              <FieldError message={errors.image_url} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">
                Texto Alternativo
              </label>

              <input
                type="text"
                value={imageAlt}
                onChange={(event) => {
                  setImageAlt(event.target.value);
                  clearError('image_description');
                }}
                className={fieldClass(
                  errors.image_description,
                  'w-full text-xs bg-white border rounded-md px-3 py-2 focus:outline-none text-gray-700'
                )}
                placeholder="Descrição da imagem"
                maxLength={255}
              />

              <div className="flex justify-between">
                <FieldError message={errors.image_description} />

                <span className="ml-auto text-[11px] text-gray-400">
                  {imageAlt.length}/255
                </span>
              </div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-gray-500">
                Legenda
              </label>

              <input
                type="text"
                value={imageCaption}
                onChange={(event) => {
                  setImageCaption(event.target.value);
                  clearError('image_caption');
                }}
                className={fieldClass(
                  errors.image_caption,
                  'w-full text-xs bg-white border rounded-md px-3 py-2 focus:outline-none text-gray-700'
                )}
                placeholder="Legenda opcional da imagem"
                maxLength={255}
              />

              <div className="flex justify-between gap-3">
                <FieldError message={errors.image_caption} />

                <span
                  className={`ml-auto text-[11px] ${
                    imageCaption.length > 240
                      ? 'text-orange-600'
                      : 'text-gray-400'
                  }`}
                >
                  {imageCaption.length}/255
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditMode && (
        <div className="bg-gray-50/70 p-5 rounded-md border border-gray-200/60 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Dias e Horários
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Cadastre os horários reais da atividade. O sistema não permite
                horários sobrepostos no mesmo dia.
              </p>
            </div>

            <button
              type="button"
              onClick={addSchedule}
              className="inline-flex items-center gap-2 rounded-md bg-orange-100 px-3 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-200"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </button>
          </div>

          <FieldError message={errors.schedules} />

          <div className="space-y-3">
            {schedules.map((schedule, index) => (
              <div
                key={`${schedule.id ?? 'new'}-${index}`}
                className={`
                  rounded-md border bg-white p-4
                  ${
                    scheduleErrors[index]
                      ? 'border-red-200'
                      : 'border-gray-200'
                  }
                `}
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_160px_160px_auto] md:items-start">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500">
                      Dia da Semana
                    </label>

                    <div className="relative">
                      <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                      <select
                        value={schedule.weekday}
                        onChange={(event) =>
                          updateSchedule(
                            index,
                            'weekday',
                            event.target.value as Weekday
                          )
                        }
                        className={fieldClass(
                          scheduleErrors[index]?.weekday,
                          'w-full appearance-none rounded-md border bg-white py-2 pl-10 pr-3 text-sm text-gray-700 focus:outline-none'
                        )}
                      >
                        {weekdayOptions.map((weekday) => (
                          <option key={weekday.value} value={weekday.value}>
                            {weekday.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <FieldError message={scheduleErrors[index]?.weekday} />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500">
                      Início
                    </label>

                    <div className="relative">
                      <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                      <input
                        type="time"
                        value={schedule.start_time}
                        onChange={(event) =>
                          updateSchedule(index, 'start_time', event.target.value)
                        }
                        className={fieldClass(
                          scheduleErrors[index]?.start_time,
                          'w-full rounded-md border bg-white py-2 pl-10 pr-3 text-sm text-gray-700 focus:outline-none'
                        )}
                      />
                    </div>

                    <FieldError message={scheduleErrors[index]?.start_time} />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500">
                      Fim
                    </label>

                    <div className="relative">
                      <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                      <input
                        type="time"
                        value={schedule.end_time}
                        onChange={(event) =>
                          updateSchedule(index, 'end_time', event.target.value)
                        }
                        className={fieldClass(
                          scheduleErrors[index]?.end_time,
                          'w-full rounded-md border bg-white py-2 pl-10 pr-3 text-sm text-gray-700 focus:outline-none'
                        )}
                      />
                    </div>

                    <FieldError message={scheduleErrors[index]?.end_time} />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeSchedule(index)}
                    disabled={schedules.length === 1}
                    className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-red-50 px-3 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                    title="Remover horário"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {imageUrl && (
        <div className="relative w-full h-64 md:h-105 rounded-md overflow-hidden bg-gray-50 border border-gray-100">
          <Image
            src={imageUrl}
            alt={imageAlt || 'Capa da atividade'}
            fill
            className="object-cover"
            priority
            unoptimized
          />

          {!isEditMode && imageCaption && (
            <p className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs px-3 py-1.5 text-center">
              {imageCaption}
            </p>
          )}
        </div>
      )}

      <div className="space-y-4">
        {isEditMode ? (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">
              Título
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                clearError('title');
              }}
              className={fieldClass(
                errors.title,
                'w-full text-xl md:text-2xl font-bold border rounded-md p-3 focus:outline-none text-gray-900'
              )}
              placeholder="Título"
              minLength={3}
              maxLength={51}
            />

            <div className="flex justify-between">
              <FieldError message={errors.title} />

              <span
                className={`ml-auto text-[11px] ${
                  title.length > 45 ? 'text-orange-600' : 'text-gray-400'
                }`}
              >
                {title.length}/51
              </span>
            </div>
          </div>
        ) : (
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
            {title || 'Sem título'}
          </h1>
        )}
      </div>

      <div className="text-gray-800 leading-relaxed text-base md:text-lg whitespace-pre-wrap font-normal">
        {isEditMode ? (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">
              Conteúdo
            </label>

            <textarea
              value={content}
              onChange={(event) => {
                setContent(event.target.value);
                clearError('content');
              }}
              className={fieldClass(
                errors.content,
                'w-full min-h-[350px] border rounded-md p-4 focus:outline-none text-base'
              )}
              placeholder="Conteúdo completo..."
            />

            <FieldError message={errors.content} />
          </div>
        ) : (
          <p>{content || 'Sem conteúdo.'}</p>
        )}
      </div>

      {isAdmin && isEditMode && (
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="text-xs bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-md border border-gray-300 transition-colors cursor-pointer disabled:opacity-60"
          >
            Descartar
          </button>

          {(hasPendingChanges || isNew) && (
            <button
                type="button"
                onClick={handleSave}
                disabled={isSubmitting}
                className="text-xs bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-md transition-all cursor-pointer disabled:opacity-60"
            >
              {isSubmitting
                ? 'Salvando...'
                : isNew
                  ? 'Criar Atividade'
                  : 'Confirmar e Salvar'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
