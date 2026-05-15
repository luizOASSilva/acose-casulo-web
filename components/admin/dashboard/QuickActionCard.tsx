import { ArrowRight, Link } from "lucide-react";

interface QuickActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
};

export default function QuickActionCard({
  icon,
  title,
  description,
  href,
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-md border border-black/50 bg-secondary p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl transition hover:-translate-y-1"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-light/10 text-primary-light">
        {icon}
      </div>

      <h3 className="mt-5 text-xl font-semibold text-zinc-100">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-relaxed text-zinc-300">
        {description}
      </p>

      <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-300">
        Acessar

        <ArrowRight
          size={16}
          className="transition group-hover:translate-x-1"
        />
      </span>
    </Link>
  );
}
