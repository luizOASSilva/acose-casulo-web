export default function UserBadge({
  name,
  subtitle,
  size = 'md',
  compact = false,
}: UserBadgeProps) {
  const isSmall = size === 'sm';

  const initial = name?.charAt(0)?.toUpperCase() ?? '?';

  if (compact) {
    return (
      <div
        className="flex items-center justify-center"
        title={name}
      >
        <div
          className={`rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0
            ${isSmall ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'}`}
        >
          {initial}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 min-w-0">
      <div
        aria-hidden="true"
        className={`rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 
          ${isSmall ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'}`}
      >
        {initial}
      </div>

      <div className="flex flex-col min-w-0">
        <p
          className={`font-medium text-gray-800 leading-none truncate ${
            isSmall ? 'text-xs' : 'text-sm'
          }`}
        >
          {name}
        </p>

        {subtitle && (
          <span className="text-xs text-gray-600 mt-1 truncate">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
