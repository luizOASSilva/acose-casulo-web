interface DonationCardProps {
  title: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
  iconClassName?: string;
  iconWrapperClassName?: string;
}

export default function DonationCard({
  title,
  value,
  helper,
  icon,
  iconWrapperClassName = 'bg-primary/10',
}: DonationCardProps) {
  return (
    <div className="relative z-10 flex h-full min-h-[172px] flex-col justify-between rounded-md border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-zinc-500">
            {title}
          </p>

          <h3 className="mt-3 truncate text-3xl font-semibold tracking-tight text-zinc-900">
            {value}
          </h3>
        </div>

        <div
          className={`
            flex size-11 shrink-0 items-center justify-center rounded-xl
            ${iconWrapperClassName}
          `}
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 min-h-[40px] text-sm leading-relaxed text-zinc-500">
        {helper}
      </p>
    </div>
  );
}
