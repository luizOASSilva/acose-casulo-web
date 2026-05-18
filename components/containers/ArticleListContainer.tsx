'use client';

import { useRouter } from 'next/navigation';
import { Trash2, Edit3 } from 'lucide-react';
import ArticleRow from '@/components/ui/ArticleRow';
import Reveal from '@/components/animations/Reveal';
import { Article } from '@/types/article';
import { deleteArticle } from '@/services/articles';

interface ArticleListContainerProps {
  articles: Article[];
  isAdmin?: boolean;
}

export default function ArticleListContainer({ articles, isAdmin = false }: ArticleListContainerProps) {
  const router = useRouter();

  const handleDelete = async (articleId: number) => {
    if (confirm('Zezão, tem certeza que deseja deletar este artigo direto do banco de dados (Laravel)?')) {
      const success = await deleteArticle(articleId);
      if (success) {
        alert('Artigo removido com sucesso!');
        router.refresh(); 
      } else {
        alert('Erro ao deletar o artigo.');
      }
    }
  };

  return (
    <main className="w-full max-w-4xl mx-auto py-12 md:py-20 px-6">
      <header className="mb-10 space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          {isAdmin ? 'Painel de Controle de Artigos' : 'Artigos do Centro Dia'}
        </h1>
        {isAdmin && (
          <p className="text-sm text-gray-600 bg-emerald-50 px-3 py-1.5 rounded-lg inline-block border border-emerald-100">
            Pipeline conectado ao banco de dados Laravel. Alterações são refletidas em tempo real.
          </p>
        )}
      </header>

      <Reveal>
        <ul className="flex flex-col divide-y divide-gray-100">
          
          {isAdmin && (
            <li className="py-6 flex items-center justify-center border border-dashed border-gray-300 rounded-2xl mb-6 hover:border-orange-400 hover:bg-orange-50/50 cursor-pointer transition-colors group">
              <button 
                onClick={() => router.push('/admin/artigos/novo')}
                className="flex flex-col items-center gap-4 text-center p-8 w-full"
              >
                <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-5xl font-extralight transition-transform group-hover:scale-110">
                  +
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-gray-800">Criar Novo Artigo</p>
                  <p className="text-sm text-gray-600 max-w-xs">Publique uma nova matéria direto no sistema.</p>
                </div>
              </button>
            </li>
          )}

          {articles.map((article) => (
            <li key={article.id} className="relative group py-4 flex justify-between items-center transition-all hover:bg-gray-50/50 rounded-xl px-4">
              <div className="flex-1">
                <ArticleRow article={article} isAdmin={false} />
              </div>

              {isAdmin && (
                <div className="ml-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0 z-10">
                  
                  <button
                    onClick={() => router.push(`/admin/artigos/editar/${article.id}`)}
                    className="p-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 rounded-xl transition-all active:scale-95"
                    title="Editar Artigo"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleDelete(article.id)}
                    className="p-2.5 text-red-600 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all active:scale-95"
                    title="Deletar Artigo"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                </div>
              )}
            </li>
          ))}
        </ul>
      </Reveal>
    </main>
  );
}
