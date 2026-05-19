import { getDonations } from "@/services/donation";
import { BadgeDollarSign, CheckCircle2, Clock3, Gift } from "lucide-react";

export const dynamic = 'force-dynamic';

function statusStyles(status: string) {
  const styles = {
    approved:
      'bg-green-500/10 text-green-400 border-green-500/20',

    pending:
      'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',

    expired:
      'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',

    cancelled:
      'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    styles[status as keyof typeof styles] ||
    'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
  );
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
    <main className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Doações
        </h1>

        <p className="mt-2 text-zinc-400">
          Gerencie e acompanhe as doações da plataforma.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Arrecadado"
          value={stats.total.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
          icon={<BadgeDollarSign className="size-5" />}
        />

        <StatCard
          title="Aprovadas"
          value={stats.approved}
          icon={<CheckCircle2 className="size-5" />}
        />

        <StatCard
          title="Pendentes"
          value={stats.pending}
          icon={<Clock3 className="size-5" />}
        />

        <StatCard
          title="Brindes"
          value={stats.gifts}
          icon={<Gift className="size-5" />}
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px]">
            <thead className="border-b border-zinc-800 bg-zinc-950/40">
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
                  className="border-b border-zinc-800/50 hover:bg-zinc-800/20"
                >
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {donation.name}
                      </span>

                      <span className="text-sm text-zinc-400">
                        {donation.email}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-5 font-semibold text-emerald-400">
                    {Number(donation.amount).toLocaleString(
                      'pt-BR',
                      {
                        style: 'currency',
                        currency: 'BRL',
                      }
                    )}
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${statusStyles(
                        donation.status
                      )}`}
                    >
                      {donation.status}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-zinc-300">
                    {donation.size || '-'}
                  </td>

                  <td className="px-6 py-5">
                    {donation.has_gift ? '🎁 Sim' : '-'}
                  </td>

                  <td className="px-6 py-5 text-sm text-zinc-400">
                    {new Date(
                      donation.created_at
                    ).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
      <div className="mb-4 flex items-center justify-between text-zinc-400">
        <span className="text-sm">{title}</span>

        {icon}
      </div>

      <div className="text-3xl font-bold tracking-tight">
        {value}
      </div>
    </div>
  );
}
