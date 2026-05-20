'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import type { Article } from '@/types/article';
import KeywordBadge from '@/components/ui/KeywordBadge';
import { updateArticle, createArticle } from '@/services/articles';

interface ArticleDetailsContainerProps {
  article?: Article;
  isAdmin?: boolean;
  isNew?: boolean;
  startInEditMode?: boolean;
  allKeywords?: string[];
}

const ADMIN_ARTICLES_PATH = '/admin/artigos';
const MAX_KEYWORD_SUGGESTIONS = 20;

function parseInitialKeywords(art?: Article): string[] {
  if (!art?.keywords || !Array.isArray(art.keywords)) return [];

  return art.keywords
    .map((keyword: any) =>
      typeof keyword === 'object' ? keyword.word : keyword
    )
    .filter(Boolean)
    .map((keyword: string) => keyword.trim().toLowerCase());
}

function normalizeKeywordList(words: string[]): string[] {
  return Array.from(
    new Set(
      words
        .filter(Boolean)
        .map((word) => word.trim().toLowerCase())
        .filter(Boolean)
    )
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

  const isCreationFlow = isNew || !article?.id;

  const [isEditMode, setIsEditMode] = useState(
    isCreationFlow || startInEditMode
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState(article?.title || '');
  const [summary, setSummary] = useState(article?.summary || '');
  const [content, setContent] = useState(article?.content || '');

  const [imageUrl, setImageUrl] = useState(article?.media?.url || '');
  const [imageAlt, setImageAlt] = useState(article?.media?.alt_text || '');
  const [imageCaption, setImageCaption] = useState(
    article?.media?.caption || ''
  );

  const [keywordsArray, setKeywordsArray] = useState<string[]>(
    parseInitialKeywords(article)
  );

  const [keywordSearch, setKeywordSearch] = useState('');

  const allDatabaseKeywords = useMemo(() => {
    return normalizeKeywordList(allKeywords);
  }, [allKeywords]);

  useEffect(() => {
    if (!article) return;

    setTitle(article.title || '');
    setSummary(article.summary || '');
    setContent(article.content || '');

    setImageUrl(article.media?.url || '');
    setImageAlt(article.media?.alt_text || '');
    setImageCaption(article.media?.caption || '');

    setKeywordsArray(parseInitialKeywords(article));
  }, [article]);

  const initialKeywords = useMemo(() => {
    return parseInitialKeywords(article);
  }, [article]);

  const hasPendingChanges = useMemo(() => {
    return (
      title !== (article?.title || '') ||
      summary !== (article?.summary || '') ||
      content !== (article?.content || '') ||
      imageUrl !== (article?.media?.url || '') ||
      imageAlt !== (article?.media?.alt_text || '') ||
      imageCaption !== (article?.media?.caption || '') ||
      JSON.stringify([...keywordsArray].sort()) !==
        JSON.stringify([...initialKeywords].sort())
    );
  }, [
    title,
    summary,
    content,
    imageUrl,
    imageAlt,
    imageCaption,
    keywordsArray,
    article,
    initialKeywords,
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

  const cleanKeywordSearch = keywordSearch.trim().toLowerCase();

  const filteredSuggestions = useMemo(() => {
    if (!cleanKeywordSearch) return [];

    return allDatabaseKeywords
      .filter((keyword) => keyword.includes(cleanKeywordSearch))
      .filter((keyword) => !keywordsArray.includes(keyword))
      .slice(0, MAX_KEYWORD_SUGGESTIONS);
  }, [cleanKeywordSearch, allDatabaseKeywords, keywordsArray]);

  const totalMatchedSuggestions = useMemo(() => {
    if (!cleanKeywordSearch) return 0;

    return allDatabaseKeywords
      .filter((keyword) => keyword.includes(cleanKeywordSearch))
      .filter((keyword) => !keywordsArray.includes(keyword)).length;
  }, [cleanKeywordSearch, allDatabaseKeywords, keywordsArray]);

  const showCreateOption = useMemo(() => {
    if (!cleanKeywordSearch) return false;

    return (
      !keywordsArray.includes(cleanKeywordSearch) &&
      !allDatabaseKeywords.includes(cleanKeywordSearch)
    );
  }, [cleanKeywordSearch, keywordsArray, allDatabaseKeywords]);

  const formattedArticleDate = useMemo(() => {
    const date = article?.created_at ? new Date(article.created_at) : new Date();

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }, [article?.created_at]);

  const authorName = article?.author?.name || 'Usuário';

  const handleAddKeyword = (word: string) => {
    const cleanWord = word.toLowerCase().trim();

    if (!cleanWord) return;

    if (!keywordsArray.includes(cleanWord)) {
      setKeywordsArray((current) => [...current, cleanWord]);
    }

    setKeywordSearch('');
  };

  const handleRemoveKeyword = (wordToRemove: string) => {
    setKeywordsArray((current) =>
      current.filter((keyword) => keyword !== wordToRemove)
    );
  };

  const resetFields = () => {
    setTitle(article?.title || '');
    setSummary(article?.summary || '');
    setContent(article?.content || '');

    setImageUrl(article?.media?.url || '');
    setImageAlt(article?.media?.alt_text || '');
    setImageCaption(article?.media?.caption || '');

    setKeywordsArray(parseInitialKeywords(article));
    setKeywordSearch('');
  };

  const confirmDiscard = (): boolean => {
    if (!hasPendingChanges) return true;

    return window.confirm(
      'Zezão, você tem alterações pendentes que não foram salvas! Deseja realmente descartar tudo?'
    );
  };

  const handleBack = () => {
    if (!confirmDiscard()) return;

    if (isEditMode && !isCreationFlow) {
      router.push(`${ADMIN_ARTICLES_PATH}/${article?.id}`);
    } else {
      router.push(ADMIN_ARTICLES_PATH);
    }
  };

  const handleCancel = () => {
    if (!confirmDiscard()) return;

    if (isCreationFlow) {
      router.push(ADMIN_ARTICLES_PATH);
      return;
    }

    setIsEditMode(false);
    resetFields();
    router.push(`${ADMIN_ARTICLES_PATH}/${article?.id}`);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Título e Conteúdo são obrigatórios!');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      image_url: imageUrl.trim(),
      image_description: imageAlt.trim() || 'Capa do artigo',
      image_caption: imageCaption.trim() || null,
      keywords: keywordsArray,
    };

    const response = isCreationFlow
      ? await createArticle(payload)
      : article?.id
        ? await updateArticle(article.id, payload)
        : null;

    setIsSubmitting(false);

    if (response) {
      setIsEditMode(false);

      if (isCreationFlow) {
        router.push(ADMIN_ARTICLES_PATH);
        alert('Artigo criado com sucesso! 🎉');
      } else {
        router.push(`${ADMIN_ARTICLES_PATH}/${article?.id}`);
        alert('Alterações salvas com sucesso no Laravel! ✔');
      }

      router.refresh();
    } else {
      alert(
        'Erro ao salvar dados no Laravel. Verifique se as permissões de CORS ou as rotas da API estão corretas.'
      );
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
            : isEditMode && !isCreationFlow
              ? '← Voltar para detalhes'
              : '← Voltar para artigos'}
        </button>

        {isAdmin && !isEditMode && (
          <button
            type="button"
            onClick={() => router.push(`${pathname}/editar`)}
            className="text-xs bg-primary-light hover:bg-primary text-white font-semibold px-4 py-2 rounded-md transition-all cursor-pointer"
          >
            Editar Artigo
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
                onChange={(event) => setImageUrl(event.target.value)}
                className="w-full text-xs bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-gray-900 text-gray-700 font-mono"
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
                onChange={(event) => setImageAlt(event.target.value)}
                className="w-full text-xs bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-gray-900 text-gray-700"
                placeholder="Descrição"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-gray-500">
                Legenda da Imagem
              </label>

              <input
                type="text"
                value={imageCaption}
                onChange={(event) => setImageCaption(event.target.value)}
                className="w-full text-xs bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-gray-900 text-gray-700"
                placeholder="Legenda exibida abaixo da imagem"
              />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {isEditMode ? (
          <div className="bg-gray-50/70 p-5 rounded-md border border-gray-200/60 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Palavras-chave Vinculadas
              </label>

              <span className="text-xs text-gray-500">
                {keywordsArray.length} selecionada
                {keywordsArray.length === 1 ? '' : 's'}
              </span>
            </div>

            {keywordsArray.length > 0 ? (
              <div className="max-h-28 overflow-y-auto rounded-md bg-white border border-gray-100 p-2">
                <div className="flex flex-wrap gap-2">
                  {keywordsArray.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold bg-gray-200/70 text-gray-800 px-2.5 py-1 rounded-md"
                    >
                      {keyword}

                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(keyword)}
                        className="hover:text-red-600 font-bold text-[10px] ml-0.5"
                        aria-label={`Remover palavra-chave ${keyword}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                Nenhuma palavra-chave vinculada.
              </p>
            )}

            <div className="relative">
              <input
                type="text"
                value={keywordSearch}
                onChange={(event) => setKeywordSearch(event.target.value)}
                className="w-full text-xs bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-gray-900"
                placeholder="Buscar ou criar palavra-chave no banco..."
              />

              {cleanKeywordSearch && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-gray-50">
                  {filteredSuggestions.length > 0 && (
                    <div className="px-4 py-2 text-[11px] text-gray-500 bg-gray-50">
                      Exibindo {filteredSuggestions.length} de{' '}
                      {totalMatchedSuggestions} resultado
                      {totalMatchedSuggestions === 1 ? '' : 's'} encontrados
                    </div>
                  )}

                  {filteredSuggestions.map((word) => (
                    <button
                      key={word}
                      type="button"
                      onClick={() => handleAddKeyword(word)}
                      className="w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 text-gray-700 font-medium block"
                    >
                      🔍 Associar existente:{' '}
                      <span className="font-bold text-gray-900">{word}</span>
                    </button>
                  ))}

                  {showCreateOption && (
                    <button
                      key="new-kw-opt"
                      type="button"
                      onClick={() => handleAddKeyword(cleanKeywordSearch)}
                      className="w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 text-orange-600 font-bold block border-t border-gray-100"
                    >
                      Criar palavra-chave inédita: "{cleanKeywordSearch}"
                    </button>
                  )}

                  {!showCreateOption && filteredSuggestions.length === 0 && (
                    <p className="px-4 py-3 text-xs text-gray-500">
                      Nenhuma palavra-chave encontrada.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {keywordsArray.map((keyword) => (
              <KeywordBadge keyword={keyword} key={keyword} />
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-4">
        {isEditMode ? (
          <div className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full text-xl md:text-2xl font-bold border border-gray-300 rounded-md p-3 focus:outline-none focus:border-gray-900 text-gray-900"
              placeholder="Título"
            />

            <textarea
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              className="w-full text-sm text-gray-700 border border-gray-300 rounded-md p-3 focus:outline-none focus:border-gray-900 resize-none"
              rows={2}
              placeholder="Resumo"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
              {title || 'Sem título'}
            </h1>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
                {authorName.charAt(0)}
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {authorName}
                </p>

                <p className="text-xs text-gray-500">
                  {formattedArticleDate}
                </p>
              </div>
            </div>

            {summary && (
              <p className="text-base md:text-lg text-gray-600 font-normal leading-relaxed">
                {summary}
              </p>
            )}
          </div>
        )}
      </div>

      {imageUrl && (
        <figure className="space-y-3">
          <div className="relative w-full h-64 md:h-[420px] rounded-md overflow-hidden bg-gray-50 border border-gray-100">
            <Image
              src={imageUrl}
              alt={imageAlt || 'Capa'}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </div>

          {imageCaption && (
            <figcaption className="text-center text-xs text-gray-500">
              {imageCaption}
            </figcaption>
          )}
        </figure>
      )}

      <div className="text-gray-800 leading-relaxed text-base md:text-lg whitespace-pre-wrap font-normal">
        {isEditMode ? (
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="w-full min-h-[350px] border border-gray-300 rounded-md p-4 focus:outline-none focus:border-gray-900 text-base"
            placeholder="Conteúdo completo..."
          />
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

          {(hasPendingChanges || isCreationFlow) && (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className="text-xs bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-md transition-all cursor-pointer disabled:opacity-60"
            >
              {isSubmitting
                ? 'Salvando...'
                : isCreationFlow
                  ? 'Criar Artigo ✔'
                  : 'Confirmar e Salvar no Banco ✔'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
