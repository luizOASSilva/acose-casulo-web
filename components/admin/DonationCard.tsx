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
  iconWrapperClassName,
}: DonationCardProps) {
  return (
    <div className="rounded-md border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
            {value}
          </h3>

          <p className="mt-2 text-sm text-zinc-500">
            {helper}
          </p>
        </div>

        <div
          className={`
            flex size-11 items-center justify-center rounded-xl
            ${iconWrapperClassName}
          `}
        >
          <div>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}
