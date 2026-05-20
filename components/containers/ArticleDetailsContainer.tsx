'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  ImageIcon,
  Link as LinkIcon,
  Save,
  X,
  Tag,
  User,
  AlignLeft,
} from 'lucide-react';

import type { Article } from '@/types/article';
import { createArticle, updateArticle } from '@/services/articles';

interface ArticleDetailsContainerProps {
  article: Article;
  isAdmin?: boolean;
  isNew?: boolean;
  startInEditMode?: boolean;
  allKeywords?: string[];
}

const ADMIN_ARTICLES_PATH = '/admin/artigos';

function normalizeKeywords(keywords: any[] | undefined): string[] {
  return (
    keywords?.map((keyword: any) =>
      typeof keyword === 'object' ? keyword.word : keyword
    ) ?? []
  );
}

export default function ArticleDetailsContainer({
  article,
  isAdmin = false,
  isNew = false,
  startInEditMode = false,
  allKeywords = [],
}: ArticleDetailsContainerProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isEditMode, setIsEditMode] = useState(startInEditMode || isNew);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState(article?.title || '');
  const [summary, setSummary] = useState(article?.summary || '');
  const [content, setContent] = useState(article?.content || '');
  const [authorName, setAuthorName] = useState(article?.author?.name || 'Admin Staff');

  const [imageUrl, setImageUrl] = useState(article?.media?.url || '');
  const [imageAlt, setImageAlt] = useState(article?.media?.alt_text || '');
  const [imageCaption, setImageCaption] = useState(article?.media?.caption || '');

  const [keywords, setKeywords] = useState<string[]>(
    normalizeKeywords(article?.keywords)
  );

  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    if (!article) return;

    setTitle(article.title || '');
    setSummary(article.summary || '');
    setContent(article.content || '');
    setAuthorName(article.author?.name || 'Admin Staff');

    setImageUrl(article.media?.url || '');
    setImageAlt(article.media?.alt_text || '');
    setImageCaption(article.media?.caption || '');

    setKeywords(normalizeKeywords(article.keywords));
  }, [article]);

  const originalKeywords = useMemo(() => {
    return normalizeKeywords(article?.keywords);
  }, [article]);

  const hasPendingChanges = useMemo(() => {
    return (
      title !== (article?.title || '') ||
      summary !== (article?.summary || '') ||
      content !== (article?.content || '') ||
      authorName !== (article?.author?.name || 'Admin Staff') ||
      imageUrl !== (article?.media?.url || '') ||
      imageAlt !== (article?.media?.alt_text || '') ||
      imageCaption !== (article?.media?.caption || '') ||
      JSON.stringify(keywords) !== JSON.stringify(originalKeywords)
    );
  }, [
    title,
    summary,
    content,
    authorName,
    imageUrl,
    imageAlt,
    imageCaption,
    keywords,
    originalKeywords,
    article,
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

  const resetFields = () => {
    setTitle(article?.title || '');
    setSummary(article?.summary || '');
    setContent(article?.content || '');
    setAuthorName(article?.author?.name || 'Admin Staff');

    setImageUrl(article?.media?.url || '');
    setImageAlt(article?.media?.alt_text || '');
    setImageCaption(article?.media?.caption || '');

    setKeywords(originalKeywords);
    setKeywordInput('');
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
      router.push(ADMIN_ARTICLES_PATH);
      return;
    }

    if (isEditMode) {
      router.push(`${ADMIN_ARTICLES_PATH}/${article.id}`);
      return;
    }

    router.push(ADMIN_ARTICLES_PATH);
  };

  const handleCancel = () => {
    if (!confirmDiscard()) return;

    if (isNew) {
      router.push(ADMIN_ARTICLES_PATH);
      return;
    }

    setIsEditMode(false);
    resetFields();
    router.push(`${ADMIN_ARTICLES_PATH}/${article.id}`);
  };

  const handleAddKeyword = (word?: string) => {
    const value = (word || keywordInput).trim().toLowerCase();

    if (!value) return;

    if (!keywords.includes(value)) {
      setKeywords((current) => [...current, value]);
    }

    setKeywordInput('');
  };

  const handleRemoveKeyword = (word: string) => {
    setKeywords((current) => current.filter((keyword) => keyword !== word));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Título é obrigatório!');
      return;
    }

    if (!summary.trim()) {
      alert('Resumo é obrigatório!');
      return;
    }

    if (!content.trim()) {
      alert('Conteúdo é obrigatório!');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      author_name: authorName.trim() || 'Admin Staff',
      image_url: imageUrl.trim(),
      image_description: imageAlt.trim() || 'Capa do artigo',
      image_caption: imageCaption.trim() || null,
      keywords,
    };

    try {
      const response = isNew
        ? await createArticle(payload)
        : await updateArticle(article.id, payload);

      if (response) {
        alert(
          isNew
            ? 'Artigo criado com sucesso! ✔'
            : 'Artigo atualizado com sucesso! ✔'
        );

        router.push(ADMIN_ARTICLES_PATH);
        router.refresh();
      } else {
        alert('Erro ao salvar artigo.');
      }
    } catch {
      alert('Erro ao salvar artigo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="w-full max-w-4xl mx-auto py-12 md:py-20 px-6">
      <header className="mb-10 space-y-2">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {isEditMode ? 'Voltar para artigos' : 'Todos os artigos'}
        </button>

        <div className="pt-4 space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            {isNew ? 'Criar Novo Artigo' : isEditMode ? 'Editar Artigo' : title}
          </h1>

          {isAdmin && (
            <p className="text-sm text-gray-600 bg-emerald-50 px-3 py-1.5 rounded-md inline-block border border-emerald-100">
              Pipeline conectado ao banco de dados Laravel. Alterações são refletidas em tempo real.
            </p>
          )}
        </div>
      </header>

      {!isEditMode && (
        <article className="space-y-8">
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-md bg-orange-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              {title || 'Sem título'}
            </h1>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
                {(authorName || 'A').charAt(0)}
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {authorName || 'Admin Staff'}
                </p>

                {article?.created_at && (
                  <p className="text-xs text-gray-500">
                    {new Date(article.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {imageUrl && (
            <figure className="space-y-3">
              <div className="relative h-64 w-full overflow-hidden rounded-md bg-gray-100 md:h-[420px]">
                <Image
                  src={imageUrl}
                  alt={imageAlt || `Imagem do artigo ${title}`}
                  fill
                  priority
                  unoptimized
                  className="object-cover"
                />
              </div>

              {imageCaption && (
                <figcaption className="text-center text-xs text-gray-500">
                  {imageCaption}
                </figcaption>
              )}
            </figure>
          )}

          <p className="text-lg text-gray-700 leading-relaxed">
            {summary || 'Sem resumo.'}
          </p>

          <div className="whitespace-pre-wrap text-base md:text-lg text-gray-800 leading-relaxed">
            {content || 'Sem conteúdo.'}
          </div>

          {isAdmin && (
            <div className="flex justify-end border-t border-gray-100 pt-6">
              <button
                type="button"
                onClick={() => router.push(`${pathname}/editar`)}
                className="rounded-md bg-primary-light px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary"
              >
                Editar Artigo
              </button>
            </div>
          )}
        </article>
      )}

      {isEditMode && (
        <section className="rounded-md border border-dashed border-gray-300 bg-white p-6 md:p-8">
          <div className="flex flex-col items-center text-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center">
              <FileText className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-800">
                {isNew ? 'Novo artigo' : 'Atualizar artigo'}
              </h2>

              <p className="text-sm text-gray-600 max-w-md">
                Preencha o conteúdo, palavras-chave e mídia para exibição na página pública de artigos.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">
                Título do Artigo
              </label>

              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full text-sm bg-white border border-gray-300 rounded-md pl-10 pr-4 py-3 focus:outline-none focus:border-gray-900 text-gray-800"
                  placeholder="Ex: Título do artigo"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">
                Resumo
              </label>

              <div className="relative">
                <AlignLeft className="absolute left-3 top-4 w-4 h-4 text-gray-400" />

                <textarea
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  className="min-h-28 w-full text-sm bg-white border border-gray-300 rounded-md pl-10 pr-4 py-3 focus:outline-none focus:border-gray-900 text-gray-800"
                  placeholder="Resumo exibido nas listagens e detalhes..."
                />
              </div>
            </div>

            <div className="space-y-3 rounded-md border border-zinc-200 bg-zinc-50 p-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                <Tag className="h-4 w-4" />
                Palavras-chave
              </label>

              <div className="flex flex-col gap-2 md:flex-row">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(event) => setKeywordInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleAddKeyword();
                    }
                  }}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-gray-900"
                  placeholder="Digite uma palavra-chave"
                />

                <button
                  type="button"
                  onClick={() => handleAddKeyword()}
                  className="rounded-md bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-black"
                >
                  Adicionar
                </button>
              </div>

              {allKeywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {allKeywords
                    .filter((word) => !keywords.includes(word))
                    .slice(0, 12)
                    .map((word) => (
                      <button
                        key={word}
                        type="button"
                        onClick={() => handleAddKeyword(word)}
                        className="rounded-md bg-white px-3 py-1.5 text-xs text-gray-600 border border-gray-200 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                      >
                        + {word}
                      </button>
                    ))}
                </div>
              )}

              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-2 rounded-md bg-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-700"
                    >
                      {keyword}

                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(keyword)}
                        className="text-orange-700 hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">
                Autor
              </label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <input
                  type="text"
                  value={authorName}
                  onChange={(event) => setAuthorName(event.target.value)}
                  className="w-full text-sm bg-white border border-gray-300 rounded-md pl-10 pr-4 py-3 focus:outline-none focus:border-gray-900 text-gray-800"
                  placeholder="Nome do autor"
                />
              </div>
            </div>

            <div className="rounded-md border border-zinc-200 bg-white p-5 space-y-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-gray-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                  Mídia da imagem
                </h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500">
                  URL da Imagem
                </label>

                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(event) => setImageUrl(event.target.value)}
                    className="w-full text-sm bg-white border border-gray-300 rounded-md pl-10 pr-4 py-3 focus:outline-none focus:border-gray-900 text-gray-800 font-mono"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500">
                    Texto Alternativo
                  </label>

                  <input
                    type="text"
                    value={imageAlt}
                    onChange={(event) => setImageAlt(event.target.value)}
                    className="w-full text-sm bg-white border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-gray-900 text-gray-800"
                    placeholder="Descrição da imagem"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500">
                    Legenda da Imagem
                  </label>

                  <input
                    type="text"
                    value={imageCaption}
                    onChange={(event) => setImageCaption(event.target.value)}
                    className="w-full text-sm bg-white border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-gray-900 text-gray-800"
                    placeholder="Legenda exibida abaixo da imagem"
                  />
                </div>
              </div>

              {imageUrl && (
                <figure className="space-y-2">
                  <div className="relative h-56 w-full overflow-hidden rounded-md bg-gray-100">
                    <Image
                      src={imageUrl}
                      alt={imageAlt || 'Prévia da imagem'}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  {imageCaption && (
                    <figcaption className="text-center text-xs text-gray-500">
                      {imageCaption}
                    </figcaption>
                  )}
                </figure>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500">
                Conteúdo
              </label>

              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                className="min-h-[420px] w-full rounded-md border border-gray-300 bg-white p-4 text-base text-gray-800 focus:outline-none focus:border-gray-900"
                placeholder="Conteúdo completo do artigo..."
              />
            </div>

            <section className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm">
              <div className="border-b border-zinc-100 bg-zinc-50 px-5 py-4">
                <h3 className="font-semibold text-zinc-900">
                  Prévia pública
                </h3>

                <p className="text-xs text-zinc-500">
                  Ordem real: palavras-chave, título, autor, imagem, legenda e conteúdo.
                </p>
              </div>

              <div className="space-y-6 p-5">
                {keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-md bg-orange-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}

                <h2 className="text-3xl font-bold text-gray-900">
                  {title || 'Título do artigo'}
                </h2>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
                    {(authorName || 'A').charAt(0)}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {authorName || 'Autor'}
                    </p>

                    <p className="text-xs text-gray-500">
                      {article?.created_at
                        ? new Date(article.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })
                        : new Date().toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                    </p>
                  </div>
                </div>

                {imageUrl && (
                  <figure className="space-y-2">
                    <div className="relative h-64 w-full overflow-hidden rounded-md bg-gray-100">
                      <Image
                        src={imageUrl}
                        alt={imageAlt || 'Imagem do artigo'}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>

                    {imageCaption && (
                      <figcaption className="text-center text-xs text-gray-500">
                        {imageCaption}
                      </figcaption>
                    )}
                  </figure>
                )}

                <p className="text-base text-gray-700">
                  {summary || 'Resumo do artigo.'}
                </p>

                <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                  {content || 'Conteúdo do artigo.'}
                </div>
              </div>
            </section>

            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="h-11 px-5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition-all disabled:opacity-60"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <X className="w-4 h-4" />
                  Descartar
                </span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSubmitting || (!hasPendingChanges && !isNew)}
                className="h-11 px-5 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-all disabled:opacity-60"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  {isSubmitting
                    ? 'Salvando...'
                    : isNew
                      ? 'Criar Artigo'
                      : 'Confirmar e Salvar'}
                </span>
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
