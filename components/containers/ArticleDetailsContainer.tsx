'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import type { Article } from '@/types/article';
import KeywordBadge from '@/components/ui/KeywordBadge';
import UserBadge from '@/components/ui/UserBadge';
import { updateArticle, createArticle } from '@/services/articles';
import { articleSchema } from '@/schemas/article.schema';

interface ArticleDetailsContainerProps {
  article?: Article;
  isAdmin?: boolean;
  isNew?: boolean;
  startInEditMode?: boolean;
  allKeywords?: string[];
}

type ArticleFormErrors = Partial<{
  title: string;
  summary: string;
  content: string;
  image_url: string;
  image_description: string;
  image_caption: string;
  keywords: string;
}>;

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

function fieldClass(error?: string, className = '') {
  return `
    ${className}
    selection:bg-primary selection:text-white
    transition-all
    ${
      error
        ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
        : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
    }
  `;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="mt-1 text-[11px] font-semibold text-red-600">
      {message}
    </p>
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
  const [errors, setErrors] = useState<ArticleFormErrors>({});

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
    setErrors({});
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

  const formattedArticleDate = new Date(
    article?.created_at || new Date()
  ).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const authorName = article?.author?.name || 'Equipe Acose Casulo';

  const clearError = (field: keyof ArticleFormErrors) => {
    setErrors((current) => {
      if (!current[field]) return current;

      const next = { ...current };
      delete next[field];

      return next;
    });
  };

  const handleAddKeyword = (word: string) => {
    const cleanWord = word.toLowerCase().trim();

    if (!cleanWord) return;

    if (cleanWord.length > 255) {
      setErrors((current) => ({
        ...current,
        keywords: 'Cada palavra-chave pode ter no máximo 255 caracteres.',
      }));
      return;
    }

    if (!keywordsArray.includes(cleanWord)) {
      setKeywordsArray((current) => [...current, cleanWord]);
      clearError('keywords');
    }

    setKeywordSearch('');
  };

  const handleRemoveKeyword = (wordToRemove: string) => {
    setKeywordsArray((current) =>
      current.filter((keyword) => keyword !== wordToRemove)
    );
    clearError('keywords');
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
    setErrors({});
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
    const parsed = articleSchema.safeParse({
      title,
      summary,
      content,
      image_url: imageUrl,
      image_description: imageAlt,
      image_caption: imageCaption.trim() || null,
      keywords: keywordsArray,
    });

    if (!parsed.success) {
      const nextErrors: ArticleFormErrors = {};

      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ArticleFormErrors | undefined;

        if (field && !nextErrors[field]) {
          nextErrors[field] = issue.message;
          return;
        }

        if (!field && !nextErrors.keywords) {
          nextErrors.keywords = issue.message;
        }
      });

      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const response = isCreationFlow
      ? await createArticle(parsed.data)
      : article?.id
        ? await updateArticle(article.id, parsed.data)
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
    <main className="w-[90%] max-w-3xl mx-auto py-20 selection:bg-primary selection:text-white">
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

      {!isEditMode && (
        <article aria-labelledby="article-title" className="mt-8">
          <header className="space-y-6 mb-10">
            {keywordsArray.length > 0 && (
              <ul
                className="flex flex-wrap gap-2"
                aria-label="Palavras-chave do artigo"
              >
                {keywordsArray.map((keyword) => (
                  <KeywordBadge keyword={keyword} key={keyword} />
                ))}
              </ul>
            )}

            <h1
              id="article-title"
              className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight"
            >
              {title || 'Sem título'}
            </h1>

            <UserBadge name={authorName} subtitle={formattedArticleDate} />

            {imageUrl && (
              <figure className="w-full overflow-hidden">
                <div className="relative w-full h-72 md:h-96 bg-gray-50">
                  <Image
                    src={imageUrl}
                    alt={imageAlt || title || 'Imagem do artigo'}
                    fill
                    sizes="(max-width: 768px) 90vw, 768px"
                    className="object-cover rounded-md"
                    priority
                    unoptimized
                  />
                </div>

                {imageCaption && (
                  <figcaption className="text-xs text-gray-700 text-center p-3">
                    {imageCaption}
                  </figcaption>
                )}
              </figure>
            )}
          </header>

          <div className="prose prose-gray max-w-none">
            {(content || 'Sem conteúdo.')
              .split('\n\n')
              .map((paragraph, index) => (
                <p
                  key={index}
                  className="text-gray-700 text-lg leading-relaxed mb-6"
                >
                  {paragraph}
                </p>
              ))}
          </div>
        </article>
      )}

      {isEditMode && (
        <div className="mt-8 space-y-8">
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
                  placeholder="Descrição"
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
                  Legenda da Imagem
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
                  placeholder="Legenda exibida abaixo da imagem"
                  maxLength={255}
                />

                <div className="flex justify-between gap-3">
                  <div>
                    <p className="text-[11px] text-gray-500">
                      Aparece abaixo da imagem no site.
                    </p>

                    <FieldError message={errors.image_caption} />
                  </div>

                  <span
                    className={`shrink-0 text-[11px] ${
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
              <div
                className={`
                  max-h-28 overflow-y-auto rounded-md bg-white border p-2
                  ${errors.keywords ? 'border-red-500' : 'border-gray-100'}
                `}
              >
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

            <FieldError message={errors.keywords} />

            <div className="relative">
              <input
                type="text"
                value={keywordSearch}
                onChange={(event) => setKeywordSearch(event.target.value)}
                className="w-full text-xs bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 selection:bg-primary selection:text-white"
                placeholder="Buscar ou criar palavra-chave no banco..."
                maxLength={255}
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
                      className="w-full text-left px-4 py-2.5 text-xs hover:bg-orange-50 text-gray-700 font-medium block"
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
                      className="w-full text-left px-4 py-2.5 text-xs hover:bg-orange-50 text-orange-600 font-bold block border-t border-gray-100"
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

          <div className="space-y-4">
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

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">
                Resumo SEO
              </label>

              <textarea
                value={summary}
                onChange={(event) => {
                  setSummary(event.target.value);
                  clearError('summary');
                }}
                className={fieldClass(
                  errors.summary,
                  'w-full text-sm text-gray-700 border rounded-md p-3 focus:outline-none resize-none'
                )}
                rows={3}
                placeholder="Resumo usado no Google, SEO e compartilhamentos..."
                maxLength={160}
              />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] text-gray-500">
                    Este resumo não aparece no corpo do site. Ele é usado para
                    Google, SEO e compartilhamentos.
                  </p>

                  <FieldError message={errors.summary} />
                </div>

                <span
                  className={`shrink-0 text-[11px] ${
                    summary.length > 150 ? 'text-orange-600' : 'text-gray-400'
                  }`}
                >
                  {summary.length}/160
                </span>
              </div>
            </div>
          </div>

          {imageUrl && (
            <figure className="w-full overflow-hidden">
              <div className="relative w-full h-72 md:h-96 bg-gray-50">
                <Image
                  src={imageUrl}
                  alt={imageAlt || title || 'Imagem do artigo'}
                  fill
                  sizes="(max-width: 768px) 90vw, 768px"
                  className="object-cover rounded-md"
                  priority
                  unoptimized
                />
              </div>

              {imageCaption && (
                <figcaption className="text-xs text-gray-700 text-center p-3">
                  {imageCaption}
                </figcaption>
              )}
            </figure>
          )}

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

          {isAdmin && (
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
                      ? 'Criar Artigo'
                      : 'Confirmar e Salvar no Banco ✔'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
