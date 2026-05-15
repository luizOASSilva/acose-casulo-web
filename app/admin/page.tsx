// app/admin/page.tsx

'use client';

import Link from 'next/link';
import { Activity, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';

import LogoLoader from '@/components/ui/LogoLoader';
import { ActivityIcon, ArrowRight, BarChart3, Clock3, FileText, Globe, HeartHandshake, Pencil, ShieldCheck } from 'lucide-react';
import StatusItem from '@/components/admin/dashboard/StatusItem';
import StatItem from '@/components/admin/dashboard/StatItem';
import ActivityItem from '@/components/admin/dashboard/ActivityItem';
import QuickActionCard from '@/components/admin/dashboard/QuickActionCard';
import AnalyticsCard from '@/components/admin/dashboard/AnalyticsCard';

export default function AdminPage() {
  // const { admin, loading } = useAuth();
  // const router = useRouter();

  // useEffect(() => {
  //   if (!loading && !admin) {
  //     router.replace('/');
  //   }
  // }, [admin, loading, router]);

  // if (loading || !admin) {
  //   return <LogoLoader />;
  // }

  const name = 'Luiz';

  return (
    <main className="min-h-screen bg-[#f5f7fa] p-6 md:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="relative overflow-hidden py-8">
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">

              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-zinc-900 md:text-5xl">
                Bem-vindo novamente,
                <span className="text-primary"> {name}</span> 👋
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600">
                Gerencie conteúdos, acompanhe métricas,
                monitore atividades e entre no modo de
                edição visual do site.
              </p>
            </div>

            <Link
              href="/?edit=true"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-4 text-sm font-semibold text-white transition hover:scale-[1.02]"
            >
              <Pencil size={18} />

              Entrar no modo edição

              <ArrowRight
                size={18}
                className="transition group-hover:translate-x-1"
              />
            </Link>
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-zinc-900">
                Analytics
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Dados gerais do projeto
              </p>
            </div>

            <Link
              href="/admin/analytics"
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 transition hover:text-zinc-950"
            >
              Ver detalhes
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AnalyticsCard
              icon={<Globe size={22} />}
              title="Visitantes hoje"
              value="1.248"
              growth="+12%"
            />

            <AnalyticsCard
              icon={<HeartHandshake size={22} />}
              title="Doações iniciadas"
              value="42"
              growth="+8%"
            />

            <AnalyticsCard
              icon={<FileText size={22} />}
              title="Artigos lidos"
              value="318"
              growth="+21%"
            />

            <AnalyticsCard
              icon={<BarChart3 size={22} />}
              title="Conversão"
              value="4.2%"
              growth="+0.6%"
            />
          </div>
        </section>

        <section className='p-4'>
          <div className="mb-5">
            <h2 className="text-2xl font-semibold text-zinc-900">
              Ações rápidas
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <QuickActionCard
              icon={<FileText size={20} />}
              title="Novo artigo"
              description="Criar novo conteúdo institucional."
              href="/admin/articles/new"
            />

            <QuickActionCard
              icon={<ActivityIcon size={20} />}
              title="Nova atividade"
              description="Adicionar atividade ao site."
              href="/admin/activities/new"
            />

            <QuickActionCard
              icon={<HeartHandshake size={20} />}
              title="Novo parceiro"
              description="Cadastrar parceiro institucional."
              href="/admin/partners/new"
            />

            <QuickActionCard
              icon={<ShieldCheck size={20} />}
              title="Transparência"
              description="Enviar novos documentos."
              href="/admin/transparency/new"
            />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr] p-4">
          <div className="rounded-md border border-white/40 bg-white/70 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-zinc-900">
                  Atividade recente
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Últimas ações realizadas
                </p>
              </div>

              <button className="text-sm font-medium text-zinc-600 transition hover:text-zinc-950">
                Ver tudo
              </button>
            </div>

            <div className="space-y-4">
              <ActivityItem
                title="Hero atualizado"
                description="Texto principal alterado."
                time="Há 12 minutos"
              />

              <ActivityItem
                title="Novo parceiro adicionado"
                description="Logo institucional enviada."
                time="Há 1 hora"
              />

              <ActivityItem
                title="PDF atualizado"
                description="Documento financeiro substituído."
                time="Hoje às 10:42"
              />

              <ActivityItem
                title="Novo artigo publicado"
                description="Conteúdo publicado na seção artigos."
                time="Ontem"
              />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-md border border-white/40 bg-white/70 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl">
              <div>
                <h2 className="text-2xl font-semibold text-zinc-900">
                  Conteúdo
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Dados gerais do CMS
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <StatItem
                  label="Artigos publicados"
                  value="24"
                />

                <StatItem
                  label="Atividades"
                  value="12"
                />

                <StatItem
                  label="Parceiros"
                  value="08"
                />

                <StatItem
                  label="Documentos"
                  value="14"
                />
              </div>
            </div>

            <div className="rounded-md border border-white/40 bg-white/70 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl">
              <div>
                <h2 className="text-2xl font-semibold text-zinc-900">
                  Sistema
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Estado atual da aplicação
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <StatusItem
                  label="API"
                  status="Online"
                />

                <StatusItem
                  label="Analytics"
                  status="Ativo"
                />

                <StatusItem
                  label="Último deploy"
                  status="Hoje"
                />

                <StatusItem
                  label="Drafts pendentes"
                  status="3"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
