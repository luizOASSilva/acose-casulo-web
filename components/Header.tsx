"use client"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Heart, X, Menu } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/cn"

const links = [
  { href: "/", label: "Home" },
  { href: "/parceiros", label: "Parceiros" },
  { href: "/transparencia", label: "Transparência" },
  { href: "/centro-dia", label: "Centro Dia" },
  { href: "/atividades", label: "Atividades" },
  { href: "/artigos", label: "Artigos" },
  { href: "/contato", label: "Contato" },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [])

  return (
    <header className="relative w-full border-b border-gray-200 bg-white z-50" aria-label="Cabeçalho do site">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 lg:px-6 h-20">

        <Link
          href="/"
          className="flex shrink-0 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/logo.svg"
            alt="Acose Casulo"
            width={70}
            height={70}
            className="w-auto h-auto"
          />
        </Link>

        <button
          className="lg:hidden p-2 text-gray-700 cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls="menu-principal"
        >
          {open ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>

        <nav
          id="menu-principal"
          aria-label="Navegação principal"
          className={cn(
            "absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-sm flex-col p-6 gap-6",
            "lg:static lg:flex lg:flex-row lg:items-center lg:w-auto lg:border-0 lg:shadow-none lg:p-0 lg:ml-auto",
            open ? "flex" : "hidden lg:flex"
          )}
        >
          <ul className="flex flex-col lg:flex-row gap-5 lg:gap-6 whitespace-nowrap">
            {links.map(({ href, label }) => {
              const isActive = pathname === href
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                      isActive ? "text-primary" : "text-gray-600"
                    )}
                  >
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>

          <Link
            href="/doe-agora"
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border-2 border-primary text-primary text-sm font-bold whitespace-nowrap transition hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Heart size={15} aria-hidden="true" fill="currentColor" />
            Doe agora
          </Link>
        </nav>

      </div>
    </header>
  )
}