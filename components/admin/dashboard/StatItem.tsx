interface StatItemProps {
  label: string;
  value: string;
};

export default function StatItem({
  label,
  value,
}: StatItemProps) {
  return (
    <div className="flex items-center justify-between rounded-md border border-zinc-100 bg-white/50 p-4">
      <span className="text-sm text-zinc-600">
        {label}
      </span>

      <span className="text-lg font-semibold text-zinc-900">
        {value}
      </span>
    </div>
  );
}
