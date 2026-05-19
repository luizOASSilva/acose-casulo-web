import { getDonations } from '@/services/donation';
import DonationCard from '@/components/admin/DonationCard';

import {
  BadgeDollarSign,
  CheckCircle2,
  Clock3,
  Gift,
  HeartHandshake,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

function statusStyles(status: string) {
  const styles = {
    approved:
      'bg-emerald-100 text-emerald-700 border-emerald-200',

    pending:
      'bg-amber-100 text-amber-700 border-amber-200',

    expired:
      'bg-zinc-100 text-zinc-600 border-zinc-200',

    cancelled:
      'bg-red-100 text-red-700 border-red-200',
  };

  return (
    styles[status as keyof typeof styles] ||
    'bg-zinc-100 text-zinc-600 border-zinc-200'
  );
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    approved: 'Aprovado',
    pending: 'Pendente',
    expired: 'Expirado',
    cancelled: 'Cancelado',
  };

  return labels[status] || status;
}

export default async function AdminDonationsPage() {
  const response = await getDonations();

  const donations = response.data ?? [];

  const stats = {
    total: donations.reduce(
      (acc: number, item: any) =>
        acc + Number(item.amount),
      0
    ),

    approved: donations.filter(
      (item: any) => item.status === 'approved'
    ).length,

    pending: donations.filter(
      (item: any) => item.status === 'pending'
    ).length,

    gifts: donations.filter(
      (item: any) => item.has_gift
    ).length,
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">

        <section className="relative overflow-hidden py-4">
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-2xl font-semibold tracking-tight text-primary md:text-4xl">
                Gestão de Doações
              </h1>

              <p className="mt-3 text-base leading-relaxed text-zinc-600">
                Acompanhe pagamentos, monitore contribuições
                aprovadas e visualize o desempenho das doações.
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-semibold text-zinc-900">
              Métricas
            </h2>

            <p className="text-sm text-zinc-500">
              Dados gerais das doações
            </p>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            <DonationCard
              icon={<BadgeDollarSign size={22} className="text-primary"/>}
              title="Arrecadado"
              value={stats.total.toLocaleString(
                'pt-BR',
                {
                  style: 'currency',
                  currency: 'BRL',
                }
              )}
              helper="Valor total arrecadado"
              iconWrapperClassName="bg-primary/20"
            />

            <DonationCard
              icon={<CheckCircle2 size={22} className="text-green-900"/>}
              title="Aprovadas"
              value={String(stats.approved)}
              helper="Pagamentos confirmados"
              iconWrapperClassName="bg-green-500/30"
            />

            <DonationCard
              icon={<Clock3 size={22} className="text-yellow-900"/>}
              title="Pendentes"
              value={String(stats.pending)}
              helper="Aguardando pagamento"
              iconWrapperClassName="bg-yellow-500/30"
            />

            <DonationCard
              icon={<Gift size={22}/>}
              title="Brindes"
              value={String(stats.gifts)}
              helper="Doações com brindes"
              iconWrapperClassName="bg-secondary/30"
            />
          </div>
        </section>

        <section className="rounded-md border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5">
            <div>
              <h2 className="text-2xl font-semibold text-zinc-900">
                Doações recentes
              </h2>

              <p className="text-sm text-zinc-500">
                Últimas contribuições realizadas
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead className="border-b border-zinc-200 bg-zinc-50">
                <tr>
                  {[
                    'Doador',
                    'Valor',
                    'Status',
                    'Tamanho',
                    'Brinde',
                    'Data',
                  ].map((item) => (
                    <th
                      key={item}
                      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500"
                    >
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {donations.map((donation: any) => (
                  <tr
                    key={donation.id}
                    className="border-b border-zinc-100 transition hover:bg-zinc-50"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <HeartHandshake size={18} />
                        </div>

                        <div className="flex flex-col">
                          <span className="font-medium text-zinc-900">
                            {donation.name}
                          </span>

                          <span className="text-sm text-zinc-500">
                            {donation.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <span className="font-semibold text-emerald-600">
                        {Number(donation.amount).toLocaleString(
                          'pt-BR',
                          {
                            style: 'currency',
                            currency: 'BRL',
                          }
                        )}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusStyles(
                          donation.status
                        )}`}
                      >
                        {statusLabel(donation.status)}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-zinc-700">
                      {donation.size || '—'}
                    </td>

                    <td className="px-6 py-5">
                      {donation.has_gift ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-700">
                          <Gift size={13} />
                          Sim
                        </span>
                      ) : (
                        <span className="text-zinc-400">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-5 text-sm text-zinc-500">
                      {new Date(
                        donation.created_at
                      ).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {donations.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-4 py-20">
                <div className="flex size-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
                  <HeartHandshake size={28} />
                </div>

                <div className="text-center">
                  <p className="text-lg font-medium text-zinc-900">
                    Nenhuma doação encontrada
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">
                    As novas doações aparecerão aqui.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
