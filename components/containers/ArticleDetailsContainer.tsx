'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Plus, Search, X } from 'lucide-react';

import type { Article } from '@/types/article';
import KeywordBadge from '@/components/ui/KeywordBadge';
import UserBadge from '@/components/ui/UserBadge';
import MediaPicker from '@/components/admin/MediaPicker';

import { uploadMediaFile } from '@/services/admin/media-library';
import { updateArticle, createArticle } from '@/services/articles';
import { articleSchema } from '@/schemas/article.schema';
import { useConfirmDialog } from '@/context/ConfirmDialogContext';

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
const ADMIN_ARTICLES_RETURN_PATH_KEY = 'admin.articles.returnPath';
const MAX_KEYWORD_SUGGESTIONS = 20;

const ALLOWED_IMAGE_MIME_TYPES = [
  'image/svg+xml',
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/webp',
];

const ALLOWED_IMAGE_EXTENSIONS = ['svg', 'png', 'jpg', 'jpeg', 'webp'];

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://api.luizoassilva.xyz'
).replace(/\/$/, '');

function isAllowedImageFile(file: File): boolean {
  const mimeType = file.type.toLowerCase();
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  return (
    ALLOWED_IMAGE_MIME_TYPES.includes(mimeType) ||
    ALLOWED_IMAGE_EXTENSIONS.includes(extension)
  );
}

function normalizeArticleImageUrl(url?: string | null): string {
  if (!url) return '';

  const cleanUrl = url.trim();

  if (!cleanUrl) return '';

  if (
    cleanUrl.startsWith('blob:') ||
    cleanUrl.startsWith('data:') ||
    cleanUrl.startsWith('http://') ||
    cleanUrl.startsWith('https://')
  ) {
    return cleanUrl;
  }

  if (cleanUrl.startsWith('/storage/')) {
    return `${API_URL}${cleanUrl}`;
  }

  if (cleanUrl.startsWith('storage/')) {
    return `${API_URL}/${cleanUrl}`;
  }

  if (cleanUrl.startsWith('media/articles/')) {
    return `${API_URL}/storage/${cleanUrl}`;
  }

  if (cleanUrl.startsWith('articles/')) {
    return `${API_URL}/storage/media/${cleanUrl}`;
  }

  return `${API_URL}/storage/media/articles/${cleanUrl}`;
}

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

function normalizeZodIssues(
  issues: Array<{
    path: PropertyKey[];
    message: string;
  }>
): Array<{
  path: (string | number)[];
  message: string;
}> {
  return issues.map((issue) => ({
    path: issue.path.filter(
      (path): path is string | number =>
        typeof path === 'string' || typeof path === 'number'
    ),
    message: issue.message,
  }));
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
  const { confirm } = useConfirmDialog();

  const keywordBoxRef = useRef<HTMLDivElement | null>(null);

  const isCreationFlow = isNew || !article?.id;

  const [isEditMode, setIsEditMode] = useState(
    isCreationFlow || startInEditMode
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ArticleFormErrors>({});

  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

  const [title, setTitle] = useState(article?.title || '');
  const [summary, setSummary] = useState(article?.summary || '');
  const [content, setContent] = useState(article?.content || '');

  const [imageUrl, setImageUrl] = useState(
    normalizeArticleImageUrl(article?.media?.url)
  );
  const [imageAlt, setImageAlt] = useState(article?.media?.alt_text || '');
  const [imageCaption, setImageCaption] = useState(
    article?.media?.caption || ''
  );

  const [keywordsArray, setKeywordsArray] = useState<string[]>(
    parseInitialKeywords(article)
  );

  const [keywordSearch, setKeywordSearch] = useState('');
  const [isKeywordOpen, setIsKeywordOpen] = useState(false);

  const pendingImagePreviewUrl = useMemo(() => {
    if (!pendingImageFile) return '';

    return URL.createObjectURL(pendingImageFile);
  }, [pendingImageFile]);

  const displayImageUrl = pendingImagePreviewUrl || imageUrl;

  useEffect(() => {
    return () => {
      if (pendingImagePreviewUrl) {
        URL.revokeObjectURL(pendingImagePreviewUrl);
      }
    };
  }, [pendingImagePreviewUrl]);

  const allDatabaseKeywords = useMemo(() => {
    return normalizeKeywordList(allKeywords);
  }, [allKeywords]);

  useEffect(() => {
    if (!article) return;

    setTitle(article.title || '');
    setSummary(article.summary || '');
    setContent(article.content || '');
    setImageUrl(normalizeArticleImageUrl(article.media?.url));
    setImageAlt(article.media?.alt_text || '');
    setImageCaption(article.media?.caption || '');
    setKeywordsArray(parseInitialKeywords(article));
    setPendingImageFile(null);
    setKeywordSearch('');
    setIsKeywordOpen(false);
    setErrors({});
  }, [article]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!keywordBoxRef.current) return;

      if (!keywordBoxRef.current.contains(event.target as Node)) {
        setIsKeywordOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initialKeywords = useMemo(() => {
    return parseInitialKeywords(article);
  }, [article]);

  const hasPendingChanges = useMemo(() => {
    return (
      pendingImageFile !== null ||
      title !== (article?.title || '') ||
      summary !== (article?.summary || '') ||
      content !== (article?.content || '') ||
      imageUrl !== normalizeArticleImageUrl(article?.media?.url) ||
      imageAlt !== (article?.media?.alt_text || '') ||
      imageCaption !== (article?.media?.caption || '') ||
      JSON.stringify([...keywordsArray].sort()) !==
        JSON.stringify([...initialKeywords].sort())
    );
  }, [
    pendingImageFile,
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
    if (!cleanKeywordSearch) {
      return allDatabaseKeywords
        .filter((keyword) => !keywordsArray.includes(keyword))
        .slice(0, MAX_KEYWORD_SUGGESTIONS);
    }

    return allDatabaseKeywords
      .filter((keyword) => keyword.includes(cleanKeywordSearch))
      .filter((keyword) => !keywordsArray.includes(keyword))
      .slice(0, MAX_KEYWORD_SUGGESTIONS);
  }, [cleanKeywordSearch, allDatabaseKeywords, keywordsArray]);

  const totalMatchedSuggestions = useMemo(() => {
    if (!cleanKeywordSearch) {
      return allDatabaseKeywords.filter(
        (keyword) => !keywordsArray.includes(keyword)
      ).length;
    }

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

  const getReturnPath = () => {
    if (typeof window === 'undefined') return ADMIN_ARTICLES_PATH;

    return (
      sessionStorage.getItem(ADMIN_ARTICLES_RETURN_PATH_KEY) ||
      ADMIN_ARTICLES_PATH
    );
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
    setIsKeywordOpen(false);
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
    setImageUrl(normalizeArticleImageUrl(article?.media?.url));
    setImageAlt(article?.media?.alt_text || '');
    setImageCaption(article?.media?.caption || '');
    setKeywordsArray(parseInitialKeywords(article));
    setPendingImageFile(null);
    setKeywordSearch('');
    setIsKeywordOpen(false);
    setErrors({});
  };

  const confirmDiscard = async (): Promise<boolean> => {
    if (!hasPendingChanges) return true;

    return confirm({
      title: 'Descartar alterações?',
      description:
        'Você tem alterações pendentes que ainda não foram salvas. Se continuar, tudo que foi alterado será perdido.',
      confirmText: 'Descartar',
      cancelText: 'Continuar editando',
      variant: 'danger',
    });
  };

  const handleBack = async () => {
    if (!(await confirmDiscard())) return;

    if (isEditMode && !isCreationFlow) {
      router.push(`${ADMIN_ARTICLES_PATH}/${article?.id}`);
      return;
    }

    router.push(getReturnPath());
  };

  const handleCancel = async () => {
    if (!(await confirmDiscard())) return;

    if (isCreationFlow) {
      router.push(getReturnPath());
      return;
    }

    setIsEditMode(false);
    resetFields();
    router.push(`${ADMIN_ARTICLES_PATH}/${article?.id}`);
  };

  const applyValidationErrors = (
    issues: Array<{
      path: (string | number)[];
      message: string;
    }>
  ) => {
    const nextErrors: ArticleFormErrors = {};

    issues.forEach((issue) => {
      const rawField = issue.path[0];
      const field = typeof rawField === 'string' ? rawField : undefined;

      if (field && !nextErrors[field as keyof ArticleFormErrors]) {
        nextErrors[field as keyof ArticleFormErrors] = issue.message;
        return;
      }

      if (!field && !nextErrors.keywords) {
        nextErrors.keywords = issue.message;
      }
    });

    setErrors(nextErrors);
  };

  const handleSave = async () => {
    if (pendingImageFile && !isAllowedImageFile(pendingImageFile)) {
      setErrors((current) => ({
        ...current,
        image_url: 'A imagem deve ser SVG, PNG, JPG, JPEG ou WEBP.',
      }));

      await confirm({
        title: 'Erro ao salvar',
        description: 'A imagem deve ser SVG, PNG, JPG, JPEG ou WEBP.',
        confirmText: 'Entendi',
        cancelText: 'Fechar',
        variant: 'danger',
      });

      return;
    }

    const validationImageUrl =
      pendingImageFile && !imageUrl ? '__pending_image__' : imageUrl;

    const parsed = articleSchema.safeParse({
      title,
      summary,
      content,
      image_url: validationImageUrl,
      image_description: imageAlt,
      image_caption: imageCaption.trim() || null,
      keywords: keywordsArray,
    });

    if (!parsed.success) {
      applyValidationErrors(normalizeZodIssues(parsed.error.issues));
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      let finalImageUrl = imageUrl;

      if (pendingImageFile) {
        const uploaded = await uploadMediaFile('articles', pendingImageFile);

        if (!uploaded?.url) {
          throw new Error('Não foi possível enviar a imagem selecionada.');
        }

        finalImageUrl = normalizeArticleImageUrl(uploaded.url);
        setImageUrl(finalImageUrl);
        setPendingImageFile(null);
      }

      const payload = {
        ...parsed.data,
        image_url: finalImageUrl,
      };

      const response = isCreationFlow
        ? await createArticle(payload)
        : article?.id
          ? await updateArticle(article.id, payload)
          : null;

      if (response) {
        setIsEditMode(false);

        if (isCreationFlow) {
          router.push(getReturnPath());

          await confirm({
            title: 'Artigo criado',
            description: 'O artigo foi criado com sucesso.',
            confirmText: 'Entendi',
            cancelText: 'Fechar',
            variant: 'success',
          });
        } else {
          router.push(`${ADMIN_ARTICLES_PATH}/${article?.id}`);

          await confirm({
            title: 'Alterações salvas',
            description: 'As alterações do artigo foram salvas com sucesso.',
            confirmText: 'Entendi',
            cancelText: 'Fechar',
            variant: 'success',
          });
        }

        router.refresh();
        return;
      }

      await confirm({
        title: 'Erro ao salvar',
        description:
          'Não foi possível salvar os dados. Verifique as permissões, CORS ou as rotas da API.',
        confirmText: 'Entendi',
        cancelText: 'Fechar',
        variant: 'danger',
      });
    } catch (error) {
      await confirm({
        title: 'Erro ao salvar',
        description:
          error instanceof Error
            ? error.message
            : 'Não foi possível salvar os dados. Tente novamente em alguns instantes.',
        confirmText: 'Entendi',
        cancelText: 'Fechar',
        variant: 'danger',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="w-full max-w-6xl mx-auto py-12 md:py-20 px-6 selection:bg-primary selection:text-white">
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
              className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight break-words [overflow-wrap:anywhere]"
            >
              {title || 'Sem título'}
            </h1>

            <UserBadge name={authorName} subtitle={formattedArticleDate} />

            {displayImageUrl && (
              <figure className="w-full overflow-hidden">
                <div className="relative w-full h-72 md:h-96 bg-gray-50 overflow-hidden rounded-md">
                  <Image
                    src={displayImageUrl}
                    alt={imageAlt || title || 'Imagem do artigo'}
                    fill
                    sizes="(max-width: 768px) 90vw, 768px"
                    className="object-cover"
                    priority
                    unoptimized={displayImageUrl.endsWith('.svg')}
                  />
                </div>

                {imageCaption && (
                  <figcaption className="text-xs text-gray-700 text-center p-3 break-words [overflow-wrap:anywhere]">
                    {imageCaption}
                  </figcaption>
                )}
              </figure>
            )}
          </header>

          <div className="prose prose-gray max-w-none overflow-hidden">
            {(content || 'Sem conteúdo.')
              .split('\n\n')
              .filter((paragraph) => paragraph.trim())
              .map((paragraph, index) => (
                <p
                  key={index}
                  className="text-gray-700 text-lg leading-relaxed mb-6 break-words [overflow-wrap:anywhere]"
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

            <MediaPicker
              collection="articles"
              value={imageUrl}
              pendingFile={pendingImageFile}
              onPendingFileChange={(file) => {
                if (file && !isAllowedImageFile(file)) {
                  setPendingImageFile(null);

                  setErrors((current) => ({
                    ...current,
                    image_url: 'A imagem deve ser SVG, PNG, JPG, JPEG ou WEBP.',
                  }));

                  return;
                }

                setPendingImageFile(file);
                clearError('image_url');
              }}
              onChange={(url) => {
                setImageUrl(normalizeArticleImageUrl(url));
                setPendingImageFile(null);
                clearError('image_url');
              }}
              label="Imagem do artigo"
              helperText="Escolha uma imagem existente ou selecione uma nova do seu computador. O upload só acontece ao salvar."
            />

            <FieldError message={errors.image_url} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="space-y-1">
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
                        className="hover:text-red-600 font-bold text-[10px] ml-0.5 cursor-pointer"
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

            <div ref={keywordBoxRef} className="relative">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />

                <input
                  type="text"
                  value={keywordSearch}
                  onFocus={() => setIsKeywordOpen(true)}
                  onChange={(event) => {
                    setKeywordSearch(event.target.value);
                    setIsKeywordOpen(true);
                  }}
                  className="w-full text-xs bg-white border border-gray-300 rounded-md py-2.5 pl-10 pr-10 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 selection:bg-primary selection:text-white"
                  placeholder="Buscar ou criar palavra-chave..."
                  maxLength={255}
                />

                {keywordSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setKeywordSearch('');
                      setIsKeywordOpen(true);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
                    aria-label="Limpar busca de palavra-chave"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>

              {isKeywordOpen && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                  <div className="max-h-64 overflow-y-auto p-2">
                    {filteredSuggestions.length > 0 && (
                      <div className="mb-2 px-1 text-[11px] text-gray-500">
                        Exibindo {filteredSuggestions.length} de{' '}
                        {totalMatchedSuggestions} resultado
                        {totalMatchedSuggestions === 1 ? '' : 's'}
                      </div>
                    )}

                    {filteredSuggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {filteredSuggestions.map((word) => (
                          <button
                            key={word}
                            type="button"
                            onClick={() => handleAddKeyword(word)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 transition hover:border-orange-200 hover:bg-orange-100 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                            {word}
                          </button>
                        ))}
                      </div>
                    )}

                    {showCreateOption && (
                      <button
                        type="button"
                        onClick={() => handleAddKeyword(cleanKeywordSearch)}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary hover:text-white cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        Criar "{cleanKeywordSearch}"
                      </button>
                    )}

                    {!showCreateOption && filteredSuggestions.length === 0 && (
                      <p className="px-3 py-2 text-xs text-gray-500">
                        Nenhuma palavra-chave encontrada.
                      </p>
                    )}

                    {!cleanKeywordSearch &&
                      filteredSuggestions.length === 0 &&
                      allDatabaseKeywords.length === 0 && (
                        <p className="px-3 py-2 text-xs text-gray-500">
                          Nenhuma palavra-chave cadastrada ainda.
                        </p>
                      )}
                  </div>
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

          {displayImageUrl && (
            <figure className="w-full overflow-hidden">
              <div className="relative w-full h-72 md:h-96 bg-gray-50 overflow-hidden rounded-md">
                <Image
                  src={displayImageUrl}
                  alt={imageAlt || title || 'Imagem do artigo'}
                  fill
                  sizes="(max-width: 768px) 90vw, 768px"
                  className="object-cover"
                  priority
                  unoptimized={displayImageUrl.endsWith('.svg')}
                />
              </div>

              {imageCaption && (
                <figcaption className="text-xs text-gray-700 text-center p-3 break-words [overflow-wrap:anywhere]">
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
                    ? pendingImageFile
                      ? 'Enviando imagem...'
                      : 'Salvando...'
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
