'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTransparencyData } from '@/services/transparency';
import { Plus, Edit3, Trash2, Loader2, FolderOpen } from 'lucide-react';

export default function AdminTransparencyPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Carrega sempre o ano que o controlador indicar ou o primeiro disponível
  async function load(year?: number) {
    setLoading(true);
    const response = await getTransparencyData(year);
    setData(response);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header limpo */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Transparência</h1>
          <p className="text-zinc-500 mt-1">Gerenciamento de documentos.</p>
        </div>
        <Link href="/admin/transparency/new" className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all">
          <Plus size={18} /> Adicionar
        </Link>
      </div>

      {/* Tabs (Sem bagunça) */}
      <div className="flex gap-1 border-b border-zinc-200 mb-8">
        {data?.years?.map((y: number) => (
          <button 
            key={y}
            onClick={() => load(y)}
            className={`px-6 py-2.5 text-sm font-semibold border-b-2 transition-all ${data.year === y ? 'border-primary text-primary' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
          >
            {y}
          </button>
        ))}
      </div>

      {/* Grid de Cards (A estética original) */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.categories?.map((cat: any) => (
            <div key={cat.id} className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-zinc-50 px-5 py-4 border-b border-zinc-100 flex items-center gap-2">
                <FolderOpen className="text-primary" size={18} />
                <h3 className="font-bold text-zinc-900">{cat.name}</h3>
              </div>
              <ul className="divide-y divide-zinc-50">
                {cat.documents.length > 0 ? (
                  cat.documents.map((doc: any) => (
                    <li key={doc.id} className="px-5 py-3 flex justify-between items-center group hover:bg-zinc-50">
                      <span className="text-sm text-zinc-700 truncate max-w-[200px]">{doc.title}</span>
                      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/transparency/${doc.id}/edit`} className="p-1.5 text-zinc-400 hover:text-primary"><Edit3 size={16}/></Link>
                        <button className="p-1.5 text-zinc-400 hover:text-red-500"><Trash2 size={16}/></button>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="px-5 py-4 text-xs text-zinc-400 italic text-center">Nenhum documento aqui.</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
