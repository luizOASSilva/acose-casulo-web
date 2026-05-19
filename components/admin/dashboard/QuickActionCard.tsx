import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface QuickActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

export default function QuickActionCard({
  icon,
  title,
  description,
  href,
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-md border border-black/50 bg-secondary p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl transition hover:-translate-y-0.5 md:p-5"
    >
      <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary-light/10 text-primary-light">
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-md font-semibold text-zinc-100 truncate">
          {title}
        </h3>
        <p className="text-xs text-zinc-300 mt-0.5 line-clamp-1">
          {description}
        </p>
      </div>

      <div className="text-zinc-300 transition group-hover:translate-x-1 pl-2 shrink-0">
        <ArrowRight size={18} />
      </div>
    </Link>
  );
}
