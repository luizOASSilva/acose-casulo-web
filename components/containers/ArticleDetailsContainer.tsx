'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Article } from '@/types/article';
import KeywordBadge from '@/components/ui/KeywordBadge';
import { updateArticle, createArticle, getArticles } from '@/services/articles';

interface ArticleDetailsContainerProps {
  article?: Article;
  isAdmin?: boolean;
  isNew?: boolean;
  startInEditMode?: boolean;
}

export default function ArticleDetailsContainer({ article, isAdmin = false, isNew = false, startInEditMode = false }: ArticleDetailsContainerProps) {
  const router = useRouter();
  
  const isCreationFlow = isNew || !article?.id;
  const [isEditMode, setIsEditMode] = useState(isCreationFlow || startInEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parseInitialKeywords = (art?: Article): string[] => {
    if (!art?.keywords || !Array.isArray(art.keywords)) return [];
    return art.keywords.map((k: any) => typeof k === 'object' ? k.word : k);
  };

  const [title, setTitle] = useState(article?.title || '');
  const [summary, setSummary] = useState(article?.summary || '');
  const [content, setContent] = useState(article?.content || '');
  const [imageUrl, setImageUrl] = useState(article?.media?.url || '');
  const [imageAlt, setImageAlt] = useState(article?.media?.alt_text || '');
  const [keywordsArray, setKeywordsArray] = useState<string[]>(parseInitialKeywords(article));
  
  const [keywordSearch, setKeywordSearch] = useState('');
  const [allDatabaseKeywords, setAllDatabaseKeywords] = useState<string[]>([]);

  useEffect(() => {
    if (article) {
      setTitle(article.title || '');
      setSummary(article.summary || '');
      setContent(article.content || '');
      setImageUrl(article.media?.url || '');
      setImageAlt(article.media?.alt_text || '');
      setKeywordsArray(parseInitialKeywords(article));
    }
  }, [article]);

  const hasPendingChanges = useMemo(() => {
    const initialKeywords = parseInitialKeywords(article);
    return (
      title !== (article?.title || '') ||
      summary !== (article?.summary || '') ||
      content !== (article?.content || '') ||
      imageUrl !== (article?.media?.url || '') ||
      imageAlt !== (article?.media?.alt_text || '') ||
      JSON.stringify([...keywordsArray].sort()) !== JSON.stringify([...initialKeywords].sort())
    );
  }, [title, summary, content, imageUrl, imageAlt, keywordsArray, article]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasPendingChanges && isEditMode) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasPendingChanges, isEditMode]);

  useEffect(() => {
    async function fetchExistingKeywords() {
      const articles = await getArticles();
      if (articles && articles.length > 0) {
        const keywordsDoBanco = Array.from(new Set(articles.flatMap(art => parseInitialKeywords(art))));
        setAllDatabaseKeywords(keywordsDoBanco);
      }
    }
    if (isEditMode) fetchExistingKeywords();
  }, [isEditMode]);

  const cleanKeywordSearch = keywordSearch.trim().toLowerCase();
  
  const filteredSuggestions = useMemo(() => {
    if (!cleanKeywordSearch) return [];
    return allDatabaseKeywords.filter(kw => kw.toLowerCase().includes(cleanKeywordSearch) && !keywordsArray.includes(kw));
  }, [cleanKeywordSearch, allDatabaseKeywords, keywordsArray]);

  const showCreateOption = useMemo(() => {
    if (!cleanKeywordSearch) return false;
    return !keywordsArray.includes(cleanKeywordSearch) && !allDatabaseKeywords.map(k => k.toLowerCase()).includes(cleanKeywordSearch);
  }, [cleanKeywordSearch, keywordsArray, allDatabaseKeywords]);

  const handleAddKeyword = (word: string) => {
    const cleanWord = word.toLowerCase().trim();
    if (cleanWord && !keywordsArray.includes(cleanWord)) setKeywordsArray([...keywordsArray, cleanWord]);
    setKeywordSearch('');
  };

  const handleRemoveKeyword = (wordToRemove: string) => {
    setKeywordsArray(keywordsArray.filter(w => w !== wordToRemove));
  };

  const resetFields = () => {
    setTitle(article?.title || '');
    setSummary(article?.summary || '');
    setContent(article?.content || '');
    setImageUrl(article?.media?.url || '');
    setImageAlt(article?.media?.alt_text || '');
    setKeywordsArray(parseInitialKeywords(article));
  };

  const confirmDiscard = (): boolean => {
    if (!hasPendingChanges) return true;
    return window.confirm("Zezão, você tem alterações pendentes que não foram salvas! Deseja realmente descartar tudo?");
  };

  const handleBack = () => {
    if (!confirmDiscard()) return;
    if (isEditMode && !isCreationFlow) {
      router.push(`/admin/artigos/${article?.id}`);
    } else {
      router.push('/admin/artigos');
    }
  };

  const handleCancel = () => {
    if (!confirmDiscard()) return;
    if (isCreationFlow) {
      router.push('/admin/artigos');
    } else {
      setIsEditMode(false);
      resetFields();
      router.push(`/admin/artigos/${article?.id}`);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Título e Conteúdo são obrigatórios!");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title,
      summary,
      content,
      image_url: imageUrl,
      image_description: imageAlt || 'Capa do artigo',
      keywords: keywordsArray
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
        router.push('/admin/artigos');
        alert("Artigo criado com sucesso! 🎉");
      } else {
        router.push(`/admin/artigos/${article?.id}`);
        alert("Alterações salvas com sucesso no Laravel! ✔");
      }
    } else {
      alert("Erro ao salvar dados no Laravel. Verifique se as permissões de CORS ou as rotas da API estão corretas.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-20 px-4 md:px-6 space-y-8">
      
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          {isEditMode && hasPendingChanges ? '⚠️ Cancelar Alterações' : isEditMode && !isCreationFlow ? '← Voltar para detalhes' : '← Voltar para artigos'}
        </button>

        {isAdmin && !isEditMode && (
          <button
            onClick={() => setIsEditMode(true)}
            className="text-xs bg-primary-light hover:bg-primary text-white font-semibold px-4 py-2 rounded-md transition-all cursor-pointer"
          >
            Editar Artigo
          </button>
        )}
      </div>

      {isEditMode && (
        <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200/60 space-y-4">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Mídia da Publicação</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">URL da Imagem</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full text-xs bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-900 text-gray-700 font-mono"
                placeholder="https://..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Texto Alternativo</label>
              <input
                type="text"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                className="w-full text-xs bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-900 text-gray-700"
                placeholder="Descrição"
              />
            </div>
          </div>
        </div>
      )}

      {imageUrl && (
        <div className="relative w-full h-64 md:h-105 rounded-md overflow-hidden bg-gray-50 border border-gray-100">
          <Image src={imageUrl} alt={imageAlt || 'Capa'} fill className="object-cover" priority unoptimized />
        </div>
      )}

      <div className="space-y-2">
        {isEditMode ? (
          <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200/60 space-y-3">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Palavras-chave Vinculadas</label>
            <div className="flex flex-wrap gap-2">
              {keywordsArray.map((kw) => (
                <span key={kw} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-gray-200/70 text-gray-800 px-2.5 py-1 rounded-md">
                  {kw}
                  <button type="button" onClick={() => handleRemoveKeyword(kw)} className="hover:text-red-600 font-bold text-[10px] ml-0.5">✕</button>
                </span>
              ))}
            </div>
            <div className="relative">
              <input
                type="text"
                value={keywordSearch}
                onChange={(e) => setKeywordSearch(e.target.value)}
                className="w-full text-xs bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-900"
                placeholder="Buscar ou criar palavra-chave no banco..."
              />
              {cleanKeywordSearch && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-40 overflow-y-auto divide-y divide-gray-50">
                  {filteredSuggestions.map(word => (
                    <button key={word} type="button" onClick={() => handleAddKeyword(word)} className="w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 text-gray-700 font-medium block">
                      🔍 Associar existente: <span className="font-bold text-gray-900">{word}</span>
                    </button>
                  ))}
                  {showCreateOption && (
                    <button key="new-kw-opt" type="button" onClick={() => handleAddKeyword(cleanKeywordSearch)} className="w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 text-orange-600 font-bold block border-t border-gray-100">
                      ✨ Criar palavra-chave inédita: "{cleanKeywordSearch}"
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {keywordsArray.map((kw) => <KeywordBadge keyword={kw} key={kw} />)}
          </ul>
        )}
      </div>

      <div className="space-y-4">
        {isEditMode ? (
          <div className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xl md:text-2xl font-bold border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-gray-900 text-gray-900"
              placeholder="Título"
            />
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full text-sm text-gray-700 border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-gray-900 resize-none"
              rows={2}
              placeholder="Resumo"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight">{title || 'Sem título'}</h1>
            {summary && <p className="text-base md:text-lg text-gray-600 font-normal leading-relaxed">{summary}</p>}
          </div>
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
            className="text-xs bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-lg border border-gray-300 transition-colors cursor-pointer"
          >
            Descartar
          </button>
          
          {(hasPendingChanges || isCreationFlow) && (
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="text-xs bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-all cursor-pointer"
            >
              {isSubmitting ? 'Salvando...' : isCreationFlow ? 'Criar Artigo ✔' : 'Confirmar e Salvar no Banco ✔'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
