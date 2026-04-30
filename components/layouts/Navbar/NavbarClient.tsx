"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { Heart, X, Menu, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useModalEffects } from "@/hooks/useModalEffects";

interface Article {
  id: string | number;
  title: string;
  slug: string;
}

const links = [
  { href: "/", label: "Home" },
  { href: "/parceiros", label: "Parceiros" },
  { href: "/transparencia", label: "Transparência" },
  { href: "/centro-dia", label: "Centro Dia" },
  { href: "/atividades", label: "Atividades" },
];

export default function NavbarClient({ recentArticles }: { recentArticles: Article[] }) {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(80); // ✅ estado para a altura
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!headerRef.current) return;

    const observer = new ResizeObserver(() => {
      setNavbarHeight(headerRef.current?.offsetHeight ?? 80); // ✅ atualiza quando redimensiona (zoom, resize)
    });

    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  useModalEffects(open, () => setOpen(false));

  const closeMenus = () => {
    setOpen(false);
    setDropdownOpen(false);
  };

  return (
    <header ref={headerRef} className="relative w-full border-b border-gray-200 bg-white z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 lg:px-6 h-20">

        <Link href="/" className="flex shrink-0" onClick={closeMenus}>
          <Image src="/logo.svg" alt="Acose Casulo" width={70} height={70} priority />
        </Link>

        <button
          className="lg:hidden p-2 text-gray-700 cursor-pointer"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav
          style={{
            maxHeight: open ? `calc(100dvh - ${navbarHeight}px)` : undefined, // ✅ usa o estado
          }}
          className={cn(
            "absolute top-full left-0 w-full bg-white border-b border-gray-200 flex-col p-6 gap-6 transition-all duration-300",
            "overflow-y-auto",
            "lg:static lg:flex lg:flex-row lg:items-center lg:w-auto lg:border-0 lg:p-0 lg:ml-auto lg:max-h-none lg:overflow-visible",
            open ? "flex opacity-100 visible" : "hidden lg:flex"
          )}
        >
          <ul className="flex flex-col lg:flex-row gap-5 lg:gap-8 items-start lg:items-center">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={closeMenus}
                  className={cn(
                    "text-sm font-semibold transition-colors hover:text-primary",
                    pathname === href ? "text-primary" : "text-gray-600"
                  )}
                >
                  {label}
                </Link>
              </li>
            ))}

            <li
              className="relative w-full lg:w-auto"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                className={cn(
                  "flex items-center gap-1 text-sm font-semibold transition-colors hover:text-primary cursor-pointer w-full lg:w-auto justify-between lg:justify-start",
                  pathname.includes("/artigos") ? "text-primary" : "text-gray-600"
                )}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                Artigos
                <ChevronDown
                  size={14}
                  className={cn("transition-transform duration-200", dropdownOpen && "rotate-180")}
                />
              </button>

              <div
                className={cn(
                  "lg:absolute lg:top-full lg:left-0 lg:pt-4 w-full lg:w-80 transition-all z-50",
                  dropdownOpen ? "block opacity-100 visible" : "hidden lg:invisible lg:opacity-0"
                )}
              >
                <ul className="bg-white lg:border lg:border-gray-100 lg:shadow-xl lg:rounded-xl overflow-hidden mt-2 lg:mt-0">
                  {recentArticles.map((art) => {
                    const articleHref = `/artigos/${art.slug}`;
                    const isArticleActive = pathname === articleHref;

                    return (
                      <li key={art.id}>
                        <Link
                          href={articleHref}
                          onClick={closeMenus}
                          className={cn(
                            "block px-5 py-4 text-[13px] font-medium leading-snug transition-all border-l-4",
                            isArticleActive
                              ? "border-primary text-primary bg-orange-50/40"
                              : "border-transparent text-gray-700 hover:border-primary hover:text-primary hover:bg-orange-50/40"
                          )}
                        >
                          {art.title}
                        </Link>
                      </li>
                    );
                  })}
                  <li>
                    <Link
                      href="/artigos"
                      onClick={closeMenus}
                      className="block px-5 py-4 text-sm font-bold text-primary bg-orange-50/60 hover:bg-orange-100 text-center transition-colors border-t border-gray-100"
                    >
                      Mostrar todos os artigos
                    </Link>
                  </li>
                </ul>
              </div>
            </li>

            <li>
              <Link
                href="/contato"
                onClick={closeMenus}
                className={cn(
                  "text-sm font-semibold transition-colors hover:text-primary",
                  pathname === "/contato" ? "text-primary" : "text-gray-600"
                )}
              >
                Contato
              </Link>
            </li>
          </ul>

          <Link
            href="/doe-agora"
            onClick={closeMenus}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border-2 border-primary text-primary text-sm font-bold transition-all hover:bg-primary hover:text-white active:scale-95"
          >
            <Heart size={15} fill="currentColor" />
            Doe agora
          </Link>
        </nav>
      </div>
    </header>
  );
}
