"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { Heart, X, Menu, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useModalEffects } from "@/hooks/useModalEffects";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";

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
  const [navbarHeight, setNavbarHeight] = useState(80);
  const [hidden, setHidden] = useState(false);
  
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (open) {
      setHidden(false);
      return;
    }
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  useEffect(() => {
    if (!headerRef.current) return;
    const observer = new ResizeObserver(() => {
      setNavbarHeight(headerRef.current?.offsetHeight ?? 80);
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
    <motion.header
      ref={headerRef}
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-0 left-0 w-full border-b border-gray-200 bg-white z-50"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 lg:px-6 h-20">
        
        <Link href="/" className="flex shrink-0" onClick={closeMenus}>
          <Image src="/logo.svg" alt="Acose Casulo" width={70} height={70} priority />
        </Link>

        <button
          className="lg:hidden p-2 text-gray-700 cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav
          style={{ maxHeight: open ? `calc(100dvh - ${navbarHeight}px)` : undefined }}
          className={cn(
            "absolute top-full left-0 w-full bg-white border-b border-gray-200 flex-col p-6 gap-6 transition-all duration-300",
            "overflow-y-auto overflow-x-hidden", // ✅ Único lugar com scroll para evitar barra dupla
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
              <div className="flex items-center justify-between gap-1 w-full lg:w-auto">
                <Link
                  href="/artigos"
                  onClick={closeMenus}
                  className={cn(
                    "text-sm font-semibold transition-colors hover:text-primary flex-1 lg:flex-none",
                    pathname.includes("/artigos") ? "text-primary" : "text-gray-600"
                  )}
                >
                  Artigos
                </Link>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="p-1 cursor-pointer"
                >
                  <ChevronDown 
                    size={14} 
                    className={cn("transition-transform duration-200", dropdownOpen && "rotate-180")} 
                  />
                </button>
              </div>

              <div className={cn(
                "lg:absolute lg:top-full lg:left-0 lg:pt-4 w-full lg:w-80 transition-all z-50",
                dropdownOpen ? "block opacity-100 visible" : "hidden lg:invisible lg:opacity-0"
              )}>
                <ul className="bg-white lg:border lg:border-gray-100 lg:shadow-xl lg:rounded-xl mt-2 lg:mt-0">
                  {recentArticles.map((art) => (
                    <li key={art.id}>
                      <Link
                        href={`/artigos/${art.slug}`}
                        onClick={closeMenus}
                        className="block px-5 py-4 text-[13px] font-medium border-l-4 border-transparent hover:border-primary hover:bg-orange-50/40 text-gray-700 transition-all"
                      >
                        {art.title}
                      </Link>
                    </li>
                  ))}
                  
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
    </motion.header>
  );
}