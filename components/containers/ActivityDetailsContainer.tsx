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

  const [isEditMode, setIsEditMode] = useState(startInEditMode || isNew);
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
    if (!title.trim() || !content.trim()) {
      alert('Título e conteúdo são obrigatórios!');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title: title.trim(),
      content: content.trim(),
      image_url: imageUrl.trim(),
      image_description: imageAlt.trim() || 'Capa da atividade',
      image_caption: imageCaption.trim() || undefined,
    };

    const response = isNew
      ? await createActivity(payload)
      : activity?.id
        ? await updateActivity(activity.id, payload)
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
            onClick={() => router.push(`${pathname}/editar`)}
            className="text-xs bg-primary-light hover:bg-primary text-white font-semibold px-4 py-2 rounded-md transition-all cursor-pointer"
          >
            Editar Atividade
          </button>
        )}
      </div>

      {isEditMode && (
        <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200/60 space-y-4">
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
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full text-xs bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-900 text-gray-700 font-mono"
                placeholder="https://..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">
                Texto Alternativo
              </label>

              <input
                type="text"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                className="w-full text-xs bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-900 text-gray-700"
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
                className="w-full text-xs bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-900 text-gray-700"
                placeholder="Legenda opcional da imagem"
              />
            </div>
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
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xl md:text-2xl font-bold border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-gray-900 text-gray-900"
            placeholder="Título"
          />
        ) : (
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
            {title || 'Sem título'}
          </h1>
        )}
      </div>

      <div className="text-gray-800 leading-relaxed text-base md:text-lg whitespace-pre-wrap font-normal">
        {isEditMode ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-87.5 border border-gray-300 rounded-xl p-4 focus:outline-none focus:border-gray-900 text-base"
            placeholder="Conteúdo completo..."
          />
        ) : (
          <p>{content || 'Sem conteúdo.'}</p>
        )}
      </div>

      {isAdmin && isEditMode && (
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="text-xs bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-md border border-gray-300 transition-colors cursor-pointer disabled:opacity-60"
          >
            Descartar
          </button>

          {(hasPendingChanges || isNew) && (
            <button
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
