'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { Heart, X, Menu, ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { useModalEffects } from '@/hooks/useModalEffects';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

interface Article {
  id: string | number;
  title: string;
  slug: string;
}

const links = [
  { href: '/', label: 'Home' },
  { href: '/parceiros', label: 'Parceiros' },
  { href: '/transparencia', label: 'Transparência' },
  { href: '/centro-dia', label: 'Centro Dia' },
  { href: '/atividades', label: 'Atividades' },
];

export default function NavbarClient({
  recentArticles,
}: {
  recentArticles: Article[];
}) {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(80);
  const [hidden, setHidden] = useState(false);

  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
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

  useEffect(() => {
    if (open) {
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  useModalEffects(open, () => setOpen(false));

  const closeMenus = () => {
    setOpen(false);
    setDropdownOpen(false);
  };

  const isDesktop = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;

  return (
    <>
      {open && (
        <div
          role="presentation"
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMenus}
        />
      )}

      <motion.header
        ref={headerRef}
        variants={{
          visible: { y: 0 },
          hidden: { y: '-100%' },
        }}
        animate={hidden ? 'hidden' : 'visible'}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed top-0 left-0 w-full border-b border-gray-200 bg-white z-50"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 lg:px-6 h-20">
          <Link
            href="/"
            className="flex shrink-0"
            onClick={closeMenus}
            aria-label="Ir para a página inicial da Acose Casulo"
          >
          <div style={{ position: 'relative', width: 100, height: 100 }}>
            <Image
              src="/logo.svg"
              alt="Acose Casulo"
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          </Link>

          <button
            className="lg:hidden p-2 text-gray-700 cursor-pointer"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="main-nav"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          >
            {open ? (
              <X size={24} aria-hidden="true" />
            ) : (
              <Menu size={24} aria-hidden="true" />
            )}
          </button>

          <nav
            id="main-nav"
            aria-label="Navegação principal"
            style={{
              maxHeight: open ? `calc(100dvh - ${navbarHeight}px)` : undefined,
            }}
            className={cn(
              'absolute top-full left-0 w-full bg-white border-b border-gray-200 flex-col gap-0 transition-all duration-300',
              'overflow-y-auto overflow-x-hidden',
              'lg:static lg:flex lg:flex-row lg:items-center lg:w-auto lg:border-0 lg:p-0 lg:ml-auto lg:max-h-none lg:overflow-visible lg:gap-0',
              open ? 'flex opacity-100 visible' : 'hidden lg:flex'
            )}
          >
            <ul
              className="flex flex-col lg:flex-row lg:gap-8 lg:items-center lg:p-0 w-full lg:w-auto"
            >
              {links.map(({ href, label }) => (
                <li key={href} className="w-full lg:w-auto">
                  <Link
                    href={href}
                    onClick={closeMenus}
                    aria-current={pathname === href ? 'page' : undefined}
                    className={cn(
                      'block w-full px-6 py-4 lg:px-0 lg:py-0 text-sm font-semibold transition-colors hover:text-primary',
                      pathname === href ? 'text-primary' : 'text-gray-600'
                    )}
                  >
                    {label}
                  </Link>
                </li>
              ))}

              <li
                className="relative w-full lg:w-auto"
                onMouseEnter={() => isDesktop() && setDropdownOpen(true)}
                onMouseLeave={() => isDesktop() && setDropdownOpen(false)}
              >
                <button
                  onClick={() => !isDesktop() && setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                  aria-controls="artigos-dropdown"
                  aria-label={
                    dropdownOpen
                      ? 'Fechar submenu de artigos'
                      : 'Abrir submenu de artigos'
                  }
                  className={cn(
                    'flex items-center justify-between gap-1 w-full lg:w-auto px-6 lg:px-0 py-4 lg:py-0 lg:cursor-default',
                    'text-sm font-semibold transition-colors hover:text-primary',
                    pathname.includes('/artigos')
                      ? 'text-primary'
                      : 'text-gray-600'
                  )}
                >
                  Artigos
                  <ChevronDown
                    size={14}
                    aria-hidden="true"
                    className={cn(
                      'transition-transform duration-200',
                      dropdownOpen && 'rotate-180'
                    )}
                  />
                </button>

                <div
                  id="artigos-dropdown"
                  className={cn(
                    'lg:absolute lg:top-full lg:left-0 lg:pt-4 w-full lg:w-80 transition-all z-50',
                    dropdownOpen
                      ? 'block opacity-100 visible'
                      : 'hidden lg:invisible lg:opacity-0'
                  )}
                >
                  <ul
                    className="bg-white lg:border lg:border-gray-100 lg:shadow-xl lg:rounded-xl lg:mt-0"
                    aria-label="Artigos recentes"
                  >
                    {recentArticles.map((art) => (
                      <li key={art.id} className="w-full">
                        <Link
                          href={`/artigos/${art.slug}`}
                          onClick={closeMenus}
                          className="block w-full px-6 py-4 lg:px-5 text-[13px] font-medium border-l-4 border-transparent hover:border-primary hover:bg-orange-50/40 text-gray-700 transition-all"
                        >
                          {art.title}
                        </Link>
                      </li>
                    ))}

                    <li className="w-full">
                      <Link
                        href="/artigos"
                        onClick={closeMenus}
                        className="block w-full px-6 py-4 lg:px-5 text-sm font-bold text-primary bg-orange-50/60 hover:bg-orange-100 text-center transition-colors border-t border-gray-100"
                      >
                        Mostrar todos os artigos
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>

              <li className="w-full lg:w-auto">
                <Link
                  href="/contato"
                  onClick={closeMenus}
                  aria-current={pathname === '/contato' ? 'page' : undefined}
                  className={cn(
                    'block w-full px-6 py-4 lg:px-0 lg:py-0 text-sm font-semibold transition-colors hover:text-primary',
                    pathname === '/contato' ? 'text-primary' : 'text-gray-600'
                  )}
                >
                  Contato
                </Link>
              </li>
            </ul>

            <div className="px-6 py-5 lg:px-0 lg:py-0 lg:ml-8">
              <Link
                href="/doe-agora"
                onClick={closeMenus}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border-2 border-primary text-primary text-sm font-bold transition-all hover:bg-primary hover:text-white active:scale-95 w-full"
              >
                <Heart size={15} fill="currentColor" aria-hidden="true" />
                Doe agora
              </Link>
            </div>
          </nav>
        </div>
      </motion.header>
    </>
  );
}
