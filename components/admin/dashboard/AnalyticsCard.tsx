interface AnalyticsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  growth: string;
};

export default function AnalyticsCard({
  icon,
  title,
  value,
  growth,
}: AnalyticsCardProps) {
  return (
    <div className="rounded-md border border-white/30 bg-white/70 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl transition hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-primary/10 p-3 text-primary">
          {icon}
        </div>

        <span className="rounded-md bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
          {growth}
        </span>
      </div>

      <div className="mt-6">
        <span className="text-sm text-zinc-500">
          {title}
        </span>

        <h3 className="mt-2 text-4xl font-semibold tracking-tight text-zinc-900">
          {value}
        </h3>
      </div>
    </div>
  );
}
