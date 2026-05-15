interface StatusItemProps {
  label: string;
  status: string;
}

export default function StatusItem({
  label,
  status,
}: StatusItemProps) {
  return (
    <div className="flex items-center justify-between rounded-md border border-zinc-100 bg-white/50 p-4">
      <span className="text-sm text-zinc-600">
        {label}
      </span>

      <span className="rounded-md bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
        {status}
      </span>
    </div>
  );
}