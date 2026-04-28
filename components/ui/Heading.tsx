import { cn } from "@/lib/cn"

interface SectionHeaderProps {
  as?: "h1" | "h2" | "h3" | "h4"
  label?: string
  children: React.ReactNode
  description?: string
  className?: string
}

export default function Heading({ as: Tag = "h2", label, children, description, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {label && <p className="text-sm text-gray-500">— {label}</p>}
      <Tag className="font-display font-bold text-3xl lg:text-4xl leading-tight">
        {children}
      </Tag>
      {description && <p className="text-gray-600 max-w-xl leading-relaxed">{description}</p>}
    </div>
  )
}