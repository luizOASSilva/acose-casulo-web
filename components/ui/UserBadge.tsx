interface UserBadgeProps {
  name: string;
  subtitle?: string; 
  size?: "sm" | "md";
  showAvatar?: boolean;
}

export default function UserBadge({ 
    name, 
    subtitle, 
    size = "md" 
}: UserBadgeProps) {
  const isSmall = size === "sm";

  return (
    <div className="flex items-center gap-3">
      <div
        aria-hidden="true"
        className={`rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 
          ${isSmall ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm"}`}
      >
        {name.charAt(0).toUpperCase()}
      </div>

      <div className="flex flex-col">
        <p className={`font-medium text-gray-800 leading-none ${isSmall ? "text-xs" : "text-sm"}`}>
          {name}
        </p>

        {subtitle && (
          <span className="text-xs text-gray-400 mt-1">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}