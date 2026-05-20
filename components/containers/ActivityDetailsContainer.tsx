'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import type { Activity } from '@/types/activity';
import { createActivity, updateActivity } from '@/services/activities';

interface ActivityDetailsContainerProps {
  activity?: Activity;
  isAdmin?: boolean;
  startInEditMode?: boolean;
  isNew?: boolean;
}

export default function ActivityDetailsContainer({
  activity,
  isAdmin = false,
  startInEditMode = false,
  isNew = false,
}: ActivityDetailsContainerProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isEditMode, setIsEditMode] = useState(startInEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState(activity?.title || '');
  const [content, setContent] = useState(activity?.content || '');
  const [imageUrl, setImageUrl] = useState(activity?.media?.url || '');
  const [imageAlt, setImageAlt] = useState(activity?.media?.alt_text || '');
  const [imageCaption, setImageCaption] = useState(activity?.media?.caption || '');

  useEffect(() => {
    if (activity) {
      setTitle(activity.title || '');
      setContent(activity.content || '');
      setImageUrl(activity.media?.url || '');
      setImageAlt(activity.media?.alt_text || '');
      setImageCaption(activity.media?.caption || '');
    }
  }, [activity]);

  const hasPendingChanges = useMemo(() => {
    return (
      title !== (activity?.title || '') ||
      content !== (activity?.content || '') ||
      imageUrl !== (activity?.media?.url || '') ||
      imageAlt !== (activity?.media?.alt_text || '') ||
      imageCaption !== (activity?.media?.caption || '')
    );
  }, [title, content, imageUrl, imageAlt, imageCaption, activity]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasPendingChanges && isEditMode) {
        e.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasPendingChanges, isEditMode]);

  const resetFields = () => {
    setTitle(activity?.title || '');
    setContent(activity?.content || '');
    setImageUrl(activity?.media?.url || '');
    setImageAlt(activity?.media?.alt_text || '');
    setImageCaption(activity?.media?.caption || '');
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
    } else {
      router.push('/admin/atividades');
    }
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
    if (!title.trim() || !content.trim()) {
      alert('Título e conteúdo são obrigatórios!');
      return;
    }

    setIsSubmitting(true);

    let response = null;

    if (isNew) {
      response = await createActivity({
        title,
        content,
        image_url: imageUrl,
        image_description: imageAlt || 'Capa da atividade',
        image_caption: imageCaption || undefined,
      });
    } else {
      if (!activity?.id) {
        setIsSubmitting(false);
        return;
      }

      response = await updateActivity(activity.id, {
        title,
        content,
        image_url: imageUrl,
        image_description: imageAlt || 'Capa da atividade',
        image_caption: imageCaption || undefined,
      });
    }

    setIsSubmitting(false);

    if (response) {
      alert(isNew ? 'Atividade criada com sucesso! ✔' : 'Alterações salvas com sucesso! ✔');
      router.push('/admin/atividades');
      router.refresh();
    } else {
      alert('Erro ao salvar atividade.');
    }
  };

  return (
    <main className="w-full min-h-screen bg-[#f3f5f7]">
      <section className="max-w-7xl mx-auto px-6 py-14 md:py-20 space-y-8">
        <div className="mb-12 space-y-4">
          <button
            onClick={handleBack}
            className="text-sm text-gray-500 hover:text-black transition-colors"
          >
            ← Voltar
          </button>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#07152f]">
                {isNew ? 'Nova Atividade' : isEditMode ? 'Editar Atividade' : title || 'Sem título'}
              </h1>

              <p className="max-w-2xl text-lg text-gray-600 leading-relaxed">
                {isNew
                  ? 'Crie uma nova atividade para aparecer na página pública do Centro Dia.'
                  : isEditMode
                    ? 'Atualize as informações da atividade mantendo o padrão visual do site.'
                    : 'Visualize os detalhes da atividade cadastrada.'}
              </p>
            </div>

            {isAdmin && !isEditMode && !isNew && (
              <button
                onClick={() => router.push(`${pathname}/editar`)}
                className="h-11 px-5 rounded-xl bg-[#c96b18] hover:bg-[#b55f14] text-white font-semibold transition-all"
              >
                Editar atividade
              </button>
            )}
          </div>
        </div>

        {isEditMode && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-5">
            <h3 className="text-xs font-bold text-[#07152f] uppercase tracking-wider">
              Mídia da publicação
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">
                  URL da imagem
                </label>

                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full text-sm bg-[#fafafa] border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c96b18]/30 text-gray-700 font-mono"
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">
                  Texto alternativo
                </label>

                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="w-full text-sm bg-[#fafafa] border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c96b18]/30 text-gray-700"
                  placeholder="Descrição da imagem"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-gray-500">
                  Legenda
                </label>

                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  className="w-full text-sm bg-[#fafafa] border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c96b18]/30 text-gray-700"
                  placeholder="Legenda opcional da imagem"
                />
              </div>
            </div>
          </div>
        )}

        {imageUrl && (
          <div className="relative w-full h-[280px] md:h-[520px] rounded-3xl overflow-hidden bg-white shadow-sm">
            <Image
              src={imageUrl}
              alt={imageAlt || 'Capa da atividade'}
              fill
              className="object-cover"
              priority
              unoptimized
            />

            {!isEditMode && imageCaption && (
              <p className="absolute bottom-0 left-0 right-0 bg-black/45 text-white text-sm px-4 py-2 text-center">
                {imageCaption}
              </p>
            )}
          </div>
        )}

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm space-y-6">
          {isEditMode ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-3xl md:text-5xl font-bold border border-gray-200 rounded-2xl p-5 focus:outline-none focus:ring-2 focus:ring-[#c96b18]/30 text-[#07152f] bg-[#fafafa]"
              placeholder="Título da atividade"
            />
          ) : (
            <h1 className="text-3xl md:text-5xl font-bold text-[#07152f] tracking-tight leading-tight">
              {title || 'Sem título'}
            </h1>
          )}

          <div className="text-gray-800 leading-relaxed text-base md:text-lg whitespace-pre-wrap font-normal">
            {isEditMode ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[420px] border border-gray-200 rounded-2xl p-5 focus:outline-none focus:ring-2 focus:ring-[#c96b18]/30 text-base bg-[#fafafa]"
                placeholder="Conteúdo completo da atividade..."
              />
            ) : (
              <p>{content || 'Sem conteúdo.'}</p>
            )}
          </div>

          {isAdmin && isEditMode && (
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                className="h-12 px-6 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition-all disabled:opacity-60"
              >
                Descartar
              </button>

              {(hasPendingChanges || isNew) && (
                <button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="h-12 px-6 rounded-xl bg-[#c96b18] hover:bg-[#b55f14] text-white font-semibold transition-all disabled:opacity-60"
                >
                  {isSubmitting
                    ? 'Salvando...'
                    : isNew
                      ? 'Criar atividade'
                      : 'Confirmar e salvar'}
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
